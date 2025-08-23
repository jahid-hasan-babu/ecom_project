import { UserRole } from "@prisma/client";
import express from "express";
import { BrandController } from "./brand.controller";
import { brandValidation } from "./brand.validation";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";


const router = express.Router();

router.post(
  "/create-brand",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  validateRequest(brandValidation.createBrandSchema),
  BrandController.createBrand
);

router.get("/", auth(), BrandController.getBrandList);

router.get("/:id", auth(), BrandController.getBrandById);

router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  BrandController.updateBrand
);

router.delete("/:id", auth(), BrandController.deleteBrand);

export const BrandRoutes = router;
