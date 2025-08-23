import httpStatus from "http-status";
import { brandService } from "./brand.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { Request, Response } from "express";

const createBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.createBrandIntoDb(req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Brand created successfully",
    data: result,
  });
});

const getBrandList = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.getBrandListFromDb(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand list retrieved successfully",
    data: result,
  });
});

const getBrandById = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand details retrieved successfully",
    data: result,
  });
});

const updateBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.updateIntoDb(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand updated successfully",
    data: result,
  });
});

const deleteBrand = catchAsync(async (req: Request, res: Response) => {
  const result = await brandService.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Brand deleted successfully",
    data: result,
  });
});

export const BrandController = {
  createBrand,
  getBrandList,
  getBrandById,
  updateBrand,
  deleteBrand,
};
