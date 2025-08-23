import express from 'express';
import { UserControllers } from './user.controller';
import { UserRole } from "@prisma/client";
import auth from '../../middlewares/auth';
import { fileUploader } from '../../middlewares/fileUploader';
import parseBodyData from '../../middlewares/parseBodyData';

const router = express.Router();


router.get("/all-users", auth(), UserControllers.getAllUsers);

router.post(
  "/add-student",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  UserControllers.addStudent
);

router.get("/single-instructor/:instructorId", auth(), UserControllers.getSingleInstructor);

router.get("/me", auth(), UserControllers.getMyProfile);

router.get("/:id", auth(), UserControllers.getUserById);

router.patch("/update-password", auth(), UserControllers.changePassword);

router.post(
  "/add-instructor",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  fileUploader.uploadProfileImage,
  parseBodyData,
  UserControllers.addInstructor
);

router.put(
  "/update",
  auth(),
  fileUploader.uploadProfileImage,
  parseBodyData,
  UserControllers.updateUser
);

router.delete("/delete", auth(), UserControllers.deleteUser);

router.patch("/update-status/:userId", auth(), UserControllers.updateUserStatus);

router.patch("/toggle-notification", auth(), UserControllers.toggleNotification);


export const UserRouters = router;
