import httpStatus from "http-status";
import { promoService } from "./promo.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { Request, Response } from "express";

const createPromo = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await promoService.createPromo(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Promo created successfully",
    data: result,
  });
});


const getAllPromos = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  const result = await promoService.getAllPromos(options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Promo retrive successfully",
    data: result,
  });
});


const getSinglePromo = catchAsync(async (req: Request, res: Response) => {
  const promoId = req.params.promoId;
  const result = await promoService.getSinglePromo(promoId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Promo retrive successfully",
    data: result,
  });
});

const updatePromo = catchAsync(async (req: Request, res: Response) => {
  const promoId = req.params.promoId;
  const payload = req.body;
  const result = await promoService.updatePromo(promoId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Promo updated successfully",
    data: result,
  });
}); 

const applyPromoToProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const promoId = req.params.promoId;
  const result = await promoService.applyPromoToProduct(productId, promoId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Promo applied successfully",
    data: result,
  });
}); 

export const PromoController = {
  createPromo,
  getAllPromos,
  getSinglePromo,
  updatePromo,
  applyPromoToProduct
};
