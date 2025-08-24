import { Request, Response } from "express";
import { productService } from "./product.service";
import  httpStatus  from 'http-status';
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";



const createProduct = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body; 
  const files = req.files as any;
  const promoId = req.body.promoId;
  const result = await productService.createProduct(payload, files, promoId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const options = req.query;
  const products = await productService.getAllProducts(options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products fetched successfully",
    data: products,
  });
});




const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const product = await productService.getSingleProduct(productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product fetched successfully",
    data: product,
  });
});

const updateProductInfo = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const payload = req.body; 
  const files = req.files as any;
  const promoId = req.body.promoId;
  const result = await productService.updateProductInfo(productId, payload, files, promoId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product update successfully",
    data: result,
  });
});

const toggleProductActive = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const product = await productService.toggleProductActive(productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product toggle successfully",
    data: product,
  });
});

const updateVariantInfo = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const variantId = req.params.variantId;
  const payload = req.body; 
  const result = await productService.updateVariantInfo(productId, variantId, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Variant update successfully",
    data: result,
  });
});

export const productController = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  toggleProductActive,
  updateProductInfo,
  updateVariantInfo
};