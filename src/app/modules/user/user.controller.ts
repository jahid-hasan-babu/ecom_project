import httpStatus from 'http-status';
import { UserServices } from './user.service';
import { Request, Response } from "express";
import catchAsync from '../../../helpers/catchAsync';
import sendResponse from '../../../helpers/sendResponse';

const dashBoardData = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.dashBoardData();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard data fetched successfully",
    data: result,
  });
});

const performance = catchAsync(async (req: Request, res: Response) => {
  const {search} = req.query ;
  const result = await UserServices.performance(Number(search));
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Performance data fetched successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  const result = await UserServices.getAllUsers(options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await UserServices.getUserById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const addStudent = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserServices.addStudent(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student added successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const result = await UserServices.getMyProfile(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My profile fetched successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const payload = req.body;
  const file = req.file;
  const result = await UserServices.updateUser(id, payload, file);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const addInstructor = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const file = req.file;
  const result = await UserServices.addInstructor(payload, file);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Instructor added successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const payload = req.body;
  const result = await UserServices.changePassword(id, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Password updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const result = await UserServices.deleteUser(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const status = req.body.status;
  const result = await UserServices.updateUserStatus(userId, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "User status updated successfully",
    data: result,
  });
});

const getSingleInstructor = catchAsync(async (req: Request, res: Response) => {
  const  userId  = req.user.id;
  const instructorId = req.params.instructorId;
  const options = req.query;
  const result = await UserServices.getSingleInstructor(userId, instructorId, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Instructor retrive successfully",
    data: result,
  });
});

const toggleNotification = catchAsync(async (req: Request, res: Response) => {
  const  userId  = req.user.id;
  const result = await UserServices.toggleNotification(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Notification toggle successfully",
    data: result,
  });
});

export const UserControllers = {
  dashBoardData,
  performance,
  getAllUsers,
  getUserById,
  addStudent,
  getMyProfile,
  addInstructor,
  updateUser,
  changePassword,
  deleteUser,
  updateUserStatus,
  getSingleInstructor,
  toggleNotification
};
