import express from "express";
import { productController } from "./product.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../middlewares/fileUploader";
import parseBodyData from "../../middlewares/parseBodyData";
import validateRequest from "../../middlewares/validateRequest";
import { productValidation } from "./product.validation";


const router = express.Router();


router.post(
  "/create-product",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  fileUploader.uploadMultipleImage,
  parseBodyData,
  validateRequest(productValidation.createProductSchema),
  productController.createProduct
);

router.put(
  "/update-product-info/:productId",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  fileUploader.uploadMultipleImage,
  parseBodyData,
  productController.updateProductInfo,
);


router.get("/all-product", productController.getAllProducts);

router.get("/single-product/:productId", productController.getSingleProduct);

router.post("/product-toggle/:productId", auth(UserRole.ADMIN, UserRole.SUPERADMIN), productController.toggleProductActive);

router.put("/update-variant/:productId/:variantId", auth(UserRole.ADMIN, UserRole.SUPERADMIN), productController.updateVariantInfo);

export const ProductRouters = router;
