import express from 'express';
import { UserControllers } from './user.controller';
import { UserRole } from "@prisma/client";
import auth from '../../middlewares/auth';
import { fileUploader } from '../../middlewares/fileUploader';
import parseBodyData from '../../middlewares/parseBodyData';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidations } from './user.validation';

const router = express.Router();


router.get("/all-users", auth(), UserControllers.getAllUsers);


router.get("/me", auth(), UserControllers.getMyProfile);

router.get("/:userId", auth(), UserControllers.getUserById);

router.patch("/update-password", auth(), UserControllers.changePassword);


router.put(
  "/update-profile",
  auth(),
  fileUploader.uploadProfileImage,
  parseBodyData,
  validateRequest(UserValidations.updateProfileSchema),
  UserControllers.updateUser
);

router.delete("/delete", auth(), UserControllers.deleteUser);





export const UserRouters = router;
