import express from "express";
import { ReviewControllers } from "./review.controller";
import auth from "../../middlewares/auth";


const router = express.Router();

router.post("/make-review/:courseId", auth(), ReviewControllers.createReview);

router.get("/my-reviews", auth(), ReviewControllers.getMyReviews);

export const ReviewRouters = router;
