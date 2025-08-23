import { UserRole } from "@prisma/client";

export interface IRegisterUser {
  username: string;
  email: string;
  password: string;
  expertise: string;
  description: string;
  fcmToken: string;
  role: UserRole;
}
export interface IUserLogin {
  email: string;
  password: string;
  fcmToken?: string;
}
export interface IOtp {
  userId: string;
  otpCode: Number;
}
export interface IChangePassword {
  newPassword: string;
  oldPassword: string;
}

