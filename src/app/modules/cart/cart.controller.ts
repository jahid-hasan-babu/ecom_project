import httpStatus from "http-status";
import { Request, Response } from "express";
import { CartServices } from "./cart.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import ApiError from "../../errors/ApiError";



const addToCart = catchAsync(async (req: Request, res: Response) => {
  const variantId: string = req.body.variantId;
  const quantity: number = req.body.quantity;

  if (!variantId || !quantity) {
    throw new ApiError(httpStatus.BAD_REQUEST, "quantity and variantId must be required");
  }

  const token: string | undefined = req.headers["token"] as string | undefined;
  const userId: string | undefined = req.user?.id;
  const result = await CartServices.addItemToCart(variantId, quantity, token, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product added to cart successfully",
    data: result,
  });
});


const getMyCartList = catchAsync(async (req: Request, res: Response) => {
  const token: string | undefined = req.headers["token"] as string | undefined;
  const result = await CartServices.getOrCreateCart(token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart list fetched successfully",
    data: result,
  });
});


const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const { cartItemId, quantity } = req.body;

  if (!cartItemId || quantity === undefined) {
    throw new ApiError(httpStatus.BAD_REQUEST, "cartItemId and quantity are required");
  }
  const token: string | undefined = req.headers["token"] as string | undefined;
  if (token === undefined) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You are not valid user");
  }
  const result = await CartServices.updateCartItem(cartItemId, quantity);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item updated successfully",
    data: result,
  });
});

const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const { cartItemId } = req.params;

  if (!cartItemId ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "cartItemId are required");
  }
  const token: string | undefined = req.headers["token"] as string | undefined;
  if (token === undefined) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You are not valid user");
  }
  const result = await CartServices.removeCartItem(cartItemId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart item remove successfully",
    data: result,
  });
});

export const CartControllers = {
  addToCart,
  getMyCartList,
  updateCartItem,
  removeCartItem
};
