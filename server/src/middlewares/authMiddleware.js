import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  
  console.log("header.auth : ", req.headers.authorization);
  
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token);
  
  if (!token) {
    req.user = null;
    console.log("No Token");
    return next(); // No Token
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token + User/Guest");
    req.user = user; // Token + User/Guest
  } catch {
    console.log("Invalid Token / Expired");
    req.user = null; // Invalid Token / Expired
  }

  next();
};