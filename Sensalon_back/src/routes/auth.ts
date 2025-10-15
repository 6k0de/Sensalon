import { Router } from "express";
import { Login, LoginAdmin } from "../controllers/Auth/Login";
import { Register } from "../controllers/Auth/Register";
import { forgotPassword, resetPassword, verifyToken } from "../controllers/ForgotPassword/forgotPassword";

export const authRoute = Router()

//POST Login & Login Admin
authRoute.post("/login", Login);
authRoute.post("/loginA", LoginAdmin);
authRoute.post("/register", Register);

//POST Forgot Password & Verify Token & Reset Password
authRoute.post("/forgot-password", forgotPassword);
authRoute.post("/verify-token", verifyToken);
authRoute.post("/reset-password", resetPassword);