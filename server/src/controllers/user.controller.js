import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendResetPWEmail } from "../services/emailService.js";
import { randomUUID } from "crypto";
import { validateUsername, validatePassword, normalizeUsername } from "../utils/validation.js";

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" });
        }

        if (await bcrypt.compare(password, user.password)) {

            if (!user.isVerified) {
              return res.status(403).json({ message: "Please verify your email" });
            };

            const token = jwt.sign(
              {
                username: user.username,
                name: user.name,
                role: "user",
                isGuest: false
              },
              process.env.JWT_SECRET,
              { expiresIn: "7d" }
            );

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token, username: username, message: "Login successful" });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Wrong Password!" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }

};

const register = async (req, res) => {

    console.log("REGISTER HIT");
    console.log(req.body);
    const { name, email, username, password, agreedToTerms } = req.body;

    // Require explicit agreement to terms/privacy (no DB check)
    if (!agreedToTerms) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "You must agree to the Privacy Policy and Terms of Service" });
    }

    try {
        // Validate username
        const usernameErrors = validateUsername(username);
        if (usernameErrors.length > 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: usernameErrors[0]
            });
        }

        // Validate password
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                message: passwordErrors[0]
            });
        }

        // Check for existing username (case-insensitive with . treated as null)
        const normalizedUsername = normalizeUsername(username);
        const existingUsers = await User.find({});
        
        const usernameExists = existingUsers.some(u => 
            normalizeUsername(u.username) === normalizedUsername
        );
        
        if (usernameExists) {
            return res.status(httpStatus.FOUND).json({ message: "Username Unavailable" });
        }

        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(httpStatus.FOUND).json({ message: "Email Already Registered" });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email: email,
            name: name,
            username: username,
            password: hashedPassword,
            verificationToken: verificationToken,
            verificationTokenExpires: Date.now() + 10 * 60 * 1000,
        });

        await newUser.save();

        await sendVerificationEmail(name, email, verificationToken);

        return res.status(httpStatus.CREATED).json({ message: "Verify your mail" });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message?.includes("Invalid login")
                ? "We could not send the verification email. Please check mail configuration and try again."
                : "Something went wrong",
            error: error.message
        });
    }
};

const resendVerification = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.json({ message: "Already verified" });
    }

    const now = Date.now();

    if (
      user.lastVerificationSentAt &&
      now - user.lastVerificationSentAt.getTime() < 30000
    ) {
      return res.status(429).json({
        message: "Please wait before requesting again"
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

    await sendVerificationEmail(user.name, email, token);

    user.lastVerificationSentAt = new Date();
    await user.save();

    res.json({ message: "Verification email resent" });
};

const verifyUser = async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });
  
  if (!user) {
    return res.status(400).json({ message: "Invalid token" }); 
  };

  user.isVerified = true;
  user.verificationToken = null;

  await user.save();

  res.status(200).json({ message: "Email verified!" }); 
};

const getUserHistory = async (req,res) => {
  
     try{
        const user = req.user;

        console.log("User (getUserHistory) : ", user);
        
        if (!user || user.isGuest) {
            return res.status(403).json({ message: "Not allowed" });
        }

        const meetings = await Meeting.find({ "participants.username": user.username }).lean();

        const history = meetings
          .map((meeting) => {
            const participant = meeting.participants?.find(
              ({ username }) => username === user.username
            );

            return {
              _id: meeting._id,
              meetingCode: meeting.meetingCode,
              time: participant?.leftAt || participant?.joinedAt || meeting.createdAt,
              isActive: meeting.isActive,
            };
          })
          .sort((a, b) => new Date(b.time) - new Date(a.time));

        console.log("Meetings : ", meetings);

        res.status(200).json(history);
     } catch(e) {
        console.log("Error (getUserHistory)");
        
        res.json({message : `Something went wrong : ${e}`});
     }

}

const forgotPW = async (req,res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) res.json({ message: "If account exists, reset link sent" });

  const now = Date.now();
  
  if (
    user.resetPasswordRequestedAt &&
    now - user.resetPasswordRequestedAt.getTime() < 30000
  ) {
    res.json({ message: "If account exists, reset link sent" });
  }
  
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  
  await sendResetPWEmail(user.name, email, token);
  user.resetPasswordRequestedAt = new Date();
  
  await user.save();
  
  res.json({ message: "If account exists, reset link sent" });
}

const resetPW = async (req,res) => {
  const { token, newPassword } = req.body;

  try {
    // Validate password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        message: passwordErrors[0]
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" }); 
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password Updated Successfully!" });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong",
      error: error.message
    });
  }
}

const createMeeting = async (req, res) => {
  
  if (req.user && !req.user.isGuest) {
    const generateMeetingCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    
    const part = () =>
      Array.from({ length: 4 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");

    return `${part()}-${part()}-${part()}-${part()}`;
    };

    let meetingCode;
    let exists;
    do {
      meetingCode = generateMeetingCode();
      exists = await Meeting.findOne({ meetingCode });
    } while (exists);

    const meeting = new Meeting({
      meetingCode,
      host: req.user.username,
      isActive: true,
    });

    await meeting.save();

    res.status(200).json({ meetingCode });
  }else{
    res.status(401).json({ message : "Log In to Create Meeting" });
  }
};

const joinCall = async (req, res) => {
    
  const meeting = await Meeting.findOne({
    meetingCode: req.params.code
  });

  console.log("MeetingCode : ", req.params.code);
  console.log("isActive : ", meeting?.isActive);

  if (!meeting || !meeting.isActive) {
    console.log("Expired");
    return res.status(404).json({ message: "Meeting expired" });
  }
  
  const user = req.user;
  console.log(user);

  const token = req.headers.authorization?.split(" ")[1];

  if (token && !user) {
    const decoded = jwt.decode(token);
    return res.status(401).json({
      message: decoded?.isGuest ? "Guest token expired" : "Token expired",
      isGuest: decoded?.isGuest === true,
    });
  }

  let isHost = (meeting.host == user?.username) ? true : false;
  const alreadyExists = meeting.participants?.some(
    (participant) => participant.username === user?.username && !participant.leftAt
  );

  if (meeting.controls?.meetingLocked && !isHost) {
    return res.status(403).json({ message: "Meeting is locked" });
  }
  
  console.log("isHost : ", isHost);
  console.log("meeting.host : ", meeting.host);
  console.log("user?.username : ", user?.username);

  res.json({ success: true, isHost, controls: meeting.controls });
}

const generateGuestToken = (req, res) => {

  const randomId = crypto.randomUUID().slice(0, 6);

  console.log(randomId);

  const token = jwt.sign(
    {
      username: "guest_" + randomId,
      isGuest: true,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  console.log(token);

  res.json({ token });
};

const getUserDetails = (req, res) => {

  if (!req.user) {
    return res.json({ isGuest: true }); // No token || Invalid/Expired Token
  }

  res.json({
    isGuest: req.user.isGuest,
    username: req.user.username,
    name: req.user.name,
  });
}

const checkUsername = async (req, res) => {
  const { username } = req.body;

  try {
    if (!username || username.length < 3) {
      return res.status(httpStatus.BAD_REQUEST).json({ 
        message: "Invalid username", 
        available: false 
      });
    }

    // Check for existing username (case-insensitive with . treated as null)
    const normalizedUsername = normalizeUsername(username);
    const existingUsers = await User.find({});
    
    const usernameExists = existingUsers.some(u => 
      normalizeUsername(u.username) === normalizedUsername
    );
    
    return res.status(httpStatus.OK).json({ 
      available: !usernameExists 
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Error checking username",
      error: error.message
    });
  }
};

export { login, register, resendVerification, forgotPW, resetPW, verifyUser, getUserHistory, createMeeting, joinCall, generateGuestToken, getUserDetails, checkUsername };
