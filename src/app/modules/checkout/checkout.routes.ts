import express from "express";
import { CheckoutController } from "./checkout.controller";
import validateRequest from "../../middlewares/validateRequest";
import { checkoutValidation } from "./checkout.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";


const router = express.Router();

router.post(
  "/create-order",
  validateRequest(checkoutValidation.createOrderSchema),
  CheckoutController.createOrder
);

router.get("/all-order", auth(UserRole.ADMIN, UserRole.SUPERADMIN), CheckoutController.getAllOrdersService);

router.patch("/update-status/:orderId", auth(UserRole.ADMIN, UserRole.SUPERADMIN), CheckoutController.changeOrderStatus);

router.get("/my-order", CheckoutController.getOrdersByToken);

export const ChackoutRoutes = router;
