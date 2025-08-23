import httpStatus from "http-status";
import { Request, Response } from "express";
import { ReviewServices } from "./review.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";


const createReview = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId;
  const payload = req.body;
  const userId = req.user.id;
  const result = await ReviewServices.createReview(userId, courseId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

;

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await ReviewServices.getMyReviews(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review retrieved successfully",
    data: result,
  });
});


export const ReviewControllers = {
  createReview,
  getMyReviews,
};
