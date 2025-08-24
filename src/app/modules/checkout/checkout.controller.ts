import httpStatus from "http-status";
import { checkoutService } from "./checkout.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { Request, Response } from "express";
import ApiError from "../../errors/ApiError";


 const createOrder = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers["token"] as string | undefined;
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You are not a valid user");
  }

  const order = await checkoutService.createOrderService(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

const getAllOrdersService = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  const order = await checkoutService.getAllOrdersService(options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order retrive successfully",
    data: order,
  });
});

const changeOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  const { status } = req.body; 

  const updatedOrder = await checkoutService.updateOrderStatusService(orderId, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Order status updated to ${status}`,
    data: updatedOrder,
  });
});


const getOrdersByToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers["token"] as string;

  if (!token) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Guest token is required",
      data: null,
    });
  }

  const orders = await checkoutService.getMyOrders(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders fetched successfully",
    data: orders,
  });
});

export const CheckoutController = {
  createOrder,
  getAllOrdersService,
  changeOrderStatus,
  getOrdersByToken
};
