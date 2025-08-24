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

// const getAllProducts = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user.id;
//   const options = req.query;
//   const products = await productService.getAllProducts(userId, options);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Products fetched successfully",
//     data: products,
//   });
// });

// const getAllPopulerProducts = catchAsync(
//   async (req: Request, res: Response) => {
//     const userId = req.user.id;
//     const options = req.query;
//     const products = await productService.getAllPopulerProducts(
//       userId,
//       options
//     );
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Products fetched successfully",
//       data: products,
//     });
//   }
// );



// const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
//   const productId = req.params.productId;
//   const product = await productService.getSingleProduct(productId);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Product fetched successfully",
//     data: product,
//   });
// });

// const getMyProducts = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user.id;
//   const options = req.query;
//   const products = await productService.getMyProducts(userId, options);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Products fetched successfully",
//     data: products,
//   });
// });

// const updateProduct = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user.id;
//   const { productId } = req.params;
//   const payload = req.body;
//   const files = req.files;
//   const product = await productService.updateProduct(
//     userId,
//     productId,
//     payload,
//     files as any
//   );
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Product updated successfully",
//     data: product,
//   });
// });


export const productController = {
  createProduct,
};