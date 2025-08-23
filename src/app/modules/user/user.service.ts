import * as bcrypt from "bcrypt";
import { IPaginationOptions } from "../../interface/pagination.type";
import { paginationHelper } from "../../helpers/paginationHelper";
import { UserRole, UserStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { deleteFromS3ByUrl } from "../../lib/deleteFromS3ByUrl";
import { fileUploader } from "../../middlewares/fileUploader";



const getAllUsers = async (
  options: IPaginationOptions & { search?: string; filter?: string }
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { search, filter } = options;

  const whereCondition: any = {};

  if (filter) {
    whereCondition.role = filter as UserRole;
  }

  if (search) {
    whereCondition.fullName = {
      contains: search,
      mode: "insensitive",
    };
  }

  const users = await prisma.user.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip,
    select: {
      id: true,
      fullName: true,
      profileImage: true,
      email: true,
      address: true,
      phone: true,
      gender: true,
      createdAt: true,
    },
  });

  const totalUsers = await prisma.user.count({
    where: whereCondition,
  });

  return {
    meta: {
      page,
      limit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
    data: users,
  };
};



const getMyProfile = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id: id, status: "ACTIVE" },
    select: {
      id: true,
      fullName: true,
      profileImage: true,
      email: true,
      address: true,
      phone: true,
      gender: true,
      createdAt: true,
    },
  });
  return user;
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      profileImage: true,
      email: true,
      address: true,
      phone: true,
      gender: true,
      createdAt: true,
    },
  });
  return user;
};

const updateUser = async (id: string, payload: any, file: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  let profileImage = existingUser.profileImage;

  if (file) {
    if (profileImage) {
      await deleteFromS3ByUrl(existingUser.profileImage as string);
    }
    const uploadResult = await fileUploader.uploadToDigitalOcean(file);
    profileImage = uploadResult.Location;
  }
  const result = await prisma.user.update({
    where: { id },
    data: {
      fullName: payload.fullName,
      profileImage: profileImage,
      phone: payload.phone,
      address: payload.address,
      gender: payload.gender
    },
    select: {
      id: true,
      fullName: true,
      profileImage: true,
      email: true,
      address: true,
      phone: true,
      gender: true,
    },
  });
  return result;
};

const changePassword = async (
  id: string,
  payload: { currentPass: string; newPass: string }
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { password: true },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const bcryptPassword = existingUser.password;
  const isMatch = await bcrypt.compare(
    payload.currentPass,
    bcryptPassword as string
  );

  if (!isMatch) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Current password is incorrect"
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPass,
    parseInt(process.env.BCRYPT_SALT_ROUNDS || "12")
  );

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  return;
};

const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await prisma.user.delete({
    where: { id },
  });
  return;
};




export const UserServices = {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateUser,
  changePassword,
  deleteUser,
};
