import * as bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import prisma from "../../../lib/prisma";
import { fileUploader } from "../../../middlewares/fileUploader";
import { deleteFromS3ByUrl } from "../../../lib/deleteFromS3ByUrl";
import { IPaginationOptions } from "../../../interface/pagination.type";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { UserRole, UserStatus } from "@prisma/client";
import { accountCreationEmail } from "../../../helpers/registrationTemplete";
import sentEmailUtility from "../../../utils/sentEmailUtility";

const generatePassword = async (length: number = 8) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  return password;
};

const dashBoardData = async () => {
  const [totalCourses, totalStudents, totalTutors] = await prisma.$transaction([
    prisma.course.count(),
    prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR", status: "ACTIVE" } }),
  ]);

  return {
    totalCourses,
    totalStudents,
    totalTutors,
  };
};

const performance = async (search?: number) => {
  const filterYear = search || new Date().getUTCFullYear();

  const startDate = new Date(`${filterYear}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${filterYear + 1}-01-01T00:00:00.000Z`);

  const users = await prisma.user.findMany({
    where: {
      role: { not: "ADMIN" },
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const stats: { [key: string]: number } = {};

  users.forEach((user) => {
    const date = new Date(user.createdAt);
    const month = date.getUTCMonth() + 1; // 1 to 12
    stats[month] = (stats[month] || 0) + 1;
  });

  // Ensure all 12 months are included, even if 0
  const result = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return {
      month: month.toString().padStart(2, "0"),
      year: filterYear,
      count: stats[month] || 0,
    };
  });

  return result;
};

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
    whereCondition.username = {
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
      username: true,
      email: true,
      profileImage: true,
      role: true,
      phone: true,
      status: true,
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

const addStudent = async (payload: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const user = await prisma.user.create({
    data: {
      email: payload.email,
      password: hashedPassword,
      username: payload.username,
      role: "STUDENT",
    },
  });

  const emailSubject = "Welcome to Our Service!";
  const emailText = `Hello ${payload.email},\n\nWelcome to our service! Your account has been successfully created.\n\nBest regards,\nThe Team`;

  const emailHTML = accountCreationEmail(payload.email, payload.password);

  await sentEmailUtility(payload.email, emailSubject, emailText, emailHTML);

  return;
};

const addInstructor = async (payload: any, file: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists");
  }

  let profileImage = "";

  if (file) {
    const uploadResult = await fileUploader.uploadToDigitalOcean(file);
    profileImage = uploadResult.Location;
  }
  let password = await generatePassword();
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: payload.email,
      password: hashedPassword,
      username: payload.username,
      designation: payload.designation,
      profileImage: profileImage,
      role: "INSTRUCTOR",
    },
  });

  const emailSubject = "Welcome to Our Service!";
  const emailText = `Hello ${payload.email},\n\nWelcome to our service! Your account has been successfully created.\n\nBest regards,\nThe Team`;

  const emailHTML = accountCreationEmail(payload.email, payload.password);

  await sentEmailUtility(payload.email, emailSubject, emailText, emailHTML);

  return;
};

const getMyProfile = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id: id, status: "ACTIVE" },
    select: {
      id: true,
      username: true,
      email: true,
      profileImage: true,
      role: true,
      phone: true,
      address: true,
      gender: true,
      isNotified: true,
      dateOfBirth: true,
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
      username: true,
      email: true,
      profileImage: true,
      role: true,
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
      username: payload.username,
      profileImage: profileImage,
      phone: payload.phone,
      address: payload.address,
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
    },
    select: {
      id: true,
      username: true,
      email: true,
      profileImage: true,
      role: true,
      phone: true,
      address: true,
      gender: true,
      dateOfBirth: true,
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
      httpStatus.UNAUTHORIZED,
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

const updateUserStatus = async (userId: string, status: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  };
  const result = prisma.user.update({
    where: { id: userId },
    data: { status: status as UserStatus },
    select: {
      id: true,
      status: true,
    }
  })
  return result;
}


const getSingleInstructor = async (
  userId: string,
  instructorId: string,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  // Fetch instructor with paginated courses
  const instructor = await prisma.user.findUnique({
    where: { id: instructorId },
    select: {
      id: true,
      username: true,
      designation: true,
      profileImage: true,
      Course: {
        where: { instructorId },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          coverImage: true,
          duration: true,
          totalRaters: true,
          avgRating: true,
          price: true,
          Favorite: { where: { userId }, select: { id: true } },
          modules: { select: { id: true, _count: { select: { lessons: true } } } },
          _count: { select: { StudenCourse: true, Review: true } },
        },
      },
    },
  });

  if (!instructor) throw new ApiError(httpStatus.NOT_FOUND, "INSTRUCTOR_NOT_FOUND");

  const courses = instructor.Course.map((course: any) => {
    const totalLessons = course.modules.reduce(
      (acc: number, mod: any) => acc + mod._count.lessons,
      0
    );

    return {
      id: course.id,
      title: course.title,
      coverImage: course.coverImage,
      duration: course.duration,
      price: course.price,
      totalRaters: course.totalRaters,
      avgRating: course.avgRating,
      totalLessons,
      isFavorite: course.Favorite.length > 0,
      totalStudents: course._count.StudentCourse,
      totalReviews: course._count.Review,
    };
  });

  const totalCourses = await prisma.course.count({ where: { instructorId } });

  // Aggregate total students and reviews manually
  const allCourses = await prisma.course.findMany({
    where: { instructorId },
    select: { _count: { select: { StudenCourse: true, Review: true } } },
  });

  const totalStudents = allCourses.reduce(
    (acc, course) => acc + (course._count.StudenCourse || 0),
    0
  );

  const totalReviews = allCourses.reduce(
    (acc, course) => acc + (course._count.Review || 0),
    0
  );

  return {
    meta: {
      page,
      limit,
      total: totalCourses,
      totalPage: Math.ceil(totalCourses / limit),
    },
    data: {
      instructor: {
          id: instructor.id,
          name: instructor.username,
          designation: instructor.designation,
          profileImage: instructor.profileImage,
          totalCourses,
          totalStudents,
          totalReviews,
      },
      course: courses
    },
  };
};

const toggleNotification = async (userId: string) => {
 
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isNotified: true },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "USER_NOT_FOUND");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isNotified: !user.isNotified },
    select: {
      id: true,
      isNotified: true,
    },
  });

  return updatedUser;
};





export const UserServices = {
  dashBoardData,
  performance,
  getAllUsers,
  getUserById,
  addStudent,
  addInstructor,
  getMyProfile,
  updateUser,
  changePassword,
  deleteUser,
  updateUserStatus,
  getSingleInstructor,
  toggleNotification
};
