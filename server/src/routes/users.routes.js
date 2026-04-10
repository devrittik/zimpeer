import { Router } from "express";
import { createMeeting, forgotPW, generateGuestToken, getUserDetails, getUserHistory, joinCall, login, register, resendVerification, resetPW, verifyUser, checkUsername } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/check-username").post(checkUsername);
router.route("/history").get(authMiddleware, getUserHistory);
router.route("/verify").get(verifyUser);
router.route("/resend-verification").post(resendVerification);
router.route("/forgot-password").post(forgotPW);
router.route("/reset-password").post(resetPW);
router.route("/create-meeting").post(authMiddleware, createMeeting);
router.route("/join/:code").get(authMiddleware, joinCall);
router.route("/guest-token").get(generateGuestToken);
router.route("/me").get(authMiddleware, getUserDetails);

export default router;