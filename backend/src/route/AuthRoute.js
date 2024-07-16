import { Router } from "express";
import { login, register, getUserHistory, addToHistory } from "../controller/AuthController.js";
import { userVerification } from "../middleware/AuthMiddleware.js";

const router = Router();

// router.post("/", userVerification)
router.post("/register", register);
router.post("/login", login);
router.post("/add-to-activity", addToHistory);
router.get("/get-all-activity", getUserHistory);

export default router;