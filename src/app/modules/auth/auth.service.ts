import * as bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import sentEmailUtility from "../../utils/sentEmailUtility";
import prisma from "../../lib/prisma";
import { IRegisterUser, IUserLogin } from "./auth.interface ";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { emailTemplate } from "../../utils/emailNotifications/emailHTML";
import { fileUploader } from "../../middlewares/fileUploader";
import { EnumGender } from "@prisma/client";

const registerUserIntoDB = async (payload: IRegisterUser, file: any) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User already exists with this email"
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );
  let profileImage = null;
  if (file) {
    const uploadResult = await fileUploader.uploadToDigitalOcean(file);
    profileImage = uploadResult.Location;
  }

  const user = await prisma.user.create({
    data: {
      email: payload.email.trim(),
      password: hashedPassword,
      fullName: payload.fullName,
      gender: payload.gender as EnumGender,
      address: payload.address,
      phone: payload.phone,
      profileImage,
    },
  });

  const otpCode = Math.floor(100000 + Math.random() * 900000);
  const message = `Please verify your email by entering this otp: ${otpCode}`;
  const emailSubject = "OTP Verification";
  const emailText = message;
  const emailHTML = emailTemplate(otpCode);
  await sentEmailUtility(payload.email, emailSubject, emailText, emailHTML);
  const OTP_EXPIRY_TIME = Number(config.otp_expiry_time) * 60 * 1000;

  const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);

  const existingOtp = await prisma.otp.findFirst({
    where: { userId: user.id },
  });
  if (existingOtp) {
    await prisma.otp.update({
      where: {
        id: existingOtp.id,
      },
      data: {
        otpCode: otpCode,
        userId: user.id,
        expiry,
      },
    });
  } else {
    await prisma.otp.create({
      data: {
        otpCode: otpCode,
        userId: user.id,
        expiry,
      },
    });
  }

  return {
    userId: user.id,
  };
};

const verifyOtpForRegister = async (payload: {
  userId: string;
  otpCode: number;
}) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });
  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "Your account has been deleted");
  }
  const otpData = await prisma.otp.findUnique({
    where: {
      userId_otpCode:{
        userId: payload.userId,
        otpCode: payload.otpCode,
      }
    },
  });
  if (!otpData) {
    throw new ApiError(httpStatus.NOT_FOUND, "OTP not found");
  }

  if (otpData.expiry < new Date()) {
    throw new ApiError(httpStatus.REQUEST_TIMEOUT, "OTP expired");
  }

  await prisma.otp.delete({
    where: {
      id: otpData.id,
    },
  });

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      isVerified: true,
    },
  });
  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email as string,
      role: userData.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  return {
    id: userData.id,
    email: userData.email,
    fullName: userData.fullName,
    phone: userData.phone,
    address: userData.address,
    gender: userData.gender,
    profileImage: userData.profileImage,
    accessToken,
  };
};

const loginUserFromDB = async (payload: IUserLogin) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  if (userData.isVerified === false) {
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const message = `Please verify your email by entering this otp: ${otpCode}`;
    const emailSubject = "OTP Verification";
    const emailText = message;
    const emailHTML = emailTemplate(otpCode);
    await sentEmailUtility(payload.email, emailSubject, emailText, emailHTML);
    const OTP_EXPIRY_TIME = Number(config.otp_expiry_time) * 60 * 1000;

    const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);

    const existingOtp = await prisma.otp.findFirst({
      where: { userId: userData.id },
    });
    if (existingOtp) {
      await prisma.otp.update({
        where: {
          id: existingOtp.id,
        },
        data: {
          otpCode: otpCode,
          userId: userData.id,
          expiry,
        },
      });
    } else {
      await prisma.otp.create({
        data: {
          otpCode: otpCode,
          userId: userData.id,
          expiry,
        },
      });
    }

    return {
      message: "We have sent an OTP to your email. Please verify your email",
      userId: userData.id,
    };
  } else {
    const isCorrectPassword = await bcrypt.compare(
      payload.password,
      userData.password as string
    );

    if (!isCorrectPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect");
    }

    const accessToken = jwtHelpers.generateToken(
      {
        id: userData.id,
        email: userData.email as string,
        role: userData.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string
    );

   

    return {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone,
      address: userData.address,
      gender: userData.gender,
      profileImage: userData.profileImage,
      accessToken,
    };
  }
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }

  const OTP_EXPIRY_TIME = Number(config.otp_expiry_time) * 60 * 1000;
  const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);

  const otpCode = Math.floor(100000 + Math.random() * 900000);

  const emailSubject = "OTP Verification";
  const emailText = `Your OTP is: ${otpCode}`;
  const emailHTML = emailTemplate(otpCode);
  await sentEmailUtility(payload.email, emailSubject, emailText, emailHTML);

  const existingOtp = await prisma.otp.findFirst({
    where: { userId: userData.id },
  });
  if (existingOtp) {
    await prisma.otp.update({
      where: {
        id: existingOtp.id,
      },
      data: {
        otpCode: otpCode,
        userId: userData.id,
        expiry,
      },
    });
  } else {
    await prisma.otp.create({
      data: {
        otpCode: otpCode,
        userId: userData.id,
        expiry,
      },
    });
  }
  return {
    userId: userData.id,
  };
};

const verifyOtp = async (payload: { userId: string; otpCode: number }) => {
  const otpData = await prisma.otp.findUnique({
    where: {
      userId_otpCode:{
        userId: payload.userId,
        otpCode: payload.otpCode,
      }
    },
  });
  if (!otpData) {
    throw new ApiError(httpStatus.NOT_FOUND, "OTP not found");
  }

  if (otpData.expiry < new Date()) {
    throw new ApiError(httpStatus.REQUEST_TIMEOUT, "OTP expired");
  }

  await prisma.otp.delete({
    where: {
      id: otpData.id,
    },
  });
  const accessToken = jwtHelpers.generateToken(
    {
      id: payload.userId,
      hexCode: payload.otpCode as any,
    },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );
  return { accessToken };
};

const resetPassword = async (userId: string, newPassword: string) => {
  const hashedPassword: string = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "please login",
  };
};




export const AuthServices = {
  loginUserFromDB,
  registerUserIntoDB,
  verifyOtpForRegister,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
