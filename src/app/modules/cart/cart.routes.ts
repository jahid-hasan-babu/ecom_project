import express from "express";
import { CartControllers } from "./cart.controller";

const router = express.Router();

router.post("/add-to-cart", CartControllers.addToCart);

router.patch("/update-cart-item", CartControllers.updateCartItem);

router.get("/my-cart", CartControllers.getMyCartList);

router.delete("/remove-cart-item/:cartItemId", CartControllers.removeCartItem);

export const CartRouters = router;
