import httpStatus from "http-status";

import sendResponse from "../../helpers/sendResponse";
import { AuthServices } from "./auth.service";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const file = req.file;
  const result = await AuthServices.registerUserIntoDB(payload, file);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "User registered successfully please verify your email",
    data: result,
  });
});

const verifyOtpForRegister = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthServices.verifyOtpForRegister(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User verified successfully",
    data: result,
  });
});



const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUserFromDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,

    data: result,
  });
});

const socialLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.socialLogin(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User social logged in successfully",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "OTP sent successfully",
    data: result,
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthServices.verifyOtp(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "OTP verified successfully please reset your password",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const newPassword = req.body.newPassword;
  const result = await AuthServices.resetPassword(userId, newPassword);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password Reset successfully please login",
    data: result,
  });
});

const addSignature = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const file = req.file;
  const result = await AuthServices.addSignature(userId, file);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Signature added successfully",
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  verifyOtpForRegister,
  addSignature,
  loginUser,
  forgotPassword,
  verifyOtp,
  socialLogin,
  resetPassword,
};
