import { UserRole } from "@prisma/client";

export interface IRegisterUser {
  fullName: string;
  email: string;
  password: string;
  gender: string;
  address: string;
  phone: string;
}
export interface IUserLogin {
  email: string;
  password: string;
}
export interface IOtp {
  userId: string;
  otpCode: Number;
}
export interface IChangePassword {
  newPassword: string;
  oldPassword: string;
}

