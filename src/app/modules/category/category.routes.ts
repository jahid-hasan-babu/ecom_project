import { UserRole } from "@prisma/client";
import express from "express";
import { CategoryController } from "./category.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidations } from "./category.validation";


const router = express.Router();


router.post(
  "/create-category",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  validateRequest(CategoryValidations.categorySchema),
  CategoryController.createCategory
);

router.get("/all-category", auth(), CategoryController.getCategoryList);

router.get("/single-category/:id", auth(), CategoryController.getCategoryById);

router.patch(
  "/update-category/:id",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  CategoryController.updateCategory
);

router.delete("/delete-category/:id", auth(), CategoryController.deleteCategory);



export const CategoryRoutes = router;
