import { UserRole } from "@prisma/client";
import express from "express";
import { PromoController } from "./promo.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { promoValidation } from "./promo.validation";



const router = express.Router();

router.post(
  "/create-promo",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  validateRequest(promoValidation.createPromoSchema),
  PromoController.createPromo
);

router.get("/all-promos",  PromoController.getAllPromos); 

router.get("/single-promo/:promoId",  PromoController.getSinglePromo); 

router.put(
  "/update-promo/:promoId",
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  PromoController.updatePromo
);

router.get("/apply-promo/:productId/:promoId", PromoController.applyPromoToProduct);



export const PromoRouters = router;
