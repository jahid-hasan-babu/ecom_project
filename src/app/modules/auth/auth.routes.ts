import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";
import auth, { checkOTP } from "../../middlewares/auth";
import { fileUploader } from "../../middlewares/fileUploader";
import parseBodyData from "../../middlewares/parseBodyData";

const router = express.Router();


router.post(
  "/register", 
  fileUploader.uploadProfileImage,
  parseBodyData,
  validateRequest(authValidation.registerUser),
  AuthControllers.registerUser
);

router.post(
  "/verify-register-otp",
  validateRequest(authValidation.verifyOtp),
  AuthControllers.verifyOtpForRegister,
);

router.post(
  "/resend-otp",
  validateRequest(authValidation.forgotPassword),
  AuthControllers.forgotPassword,
)

router.post(
  "/login",
  validateRequest(authValidation.loginUser),
  AuthControllers.loginUser
);
router.post(
  "/forgot-password",
  validateRequest(authValidation.forgotPassword),
  AuthControllers.forgotPassword
);
router.post(
  "/verify-otp",
  validateRequest(authValidation.verifyOtp),
  AuthControllers.verifyOtp
);
router.post(
  "/reset-password",
  validateRequest(authValidation.resetPassword),
  checkOTP,
  AuthControllers.resetPassword
);



export const AuthRouters = router;
