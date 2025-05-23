import { Router } from "express";
import { login, register, getUserHistory, addToHistory, forgotPassword, verifyOtp } from "../controller/AuthController.js";
import { userVerification } from "../middleware/AuthMiddleware.js";

const router = Router();

// router.post("/", userVerification)
router.post("/register", register);
router.post("/login", login);
router.post("/add-to-activity", addToHistory);
router.get("/get-all-activity", getUserHistory);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);


export default router;