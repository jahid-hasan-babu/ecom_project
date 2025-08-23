import httpStatus from "http-status";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";


const createReview = async (
  userId: string,
  courseId: string,
  payload: any
) => {
  const existingCourse = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  const existingMyCourse = await prisma.studenCourse.findFirst({
    where: {
      userId,
      courseId,
      isReview: false,
      isCompleted: true,
    },
  });

  if (!existingMyCourse) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You can't review this course");
  }

  if (!existingCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  await prisma.review.create({
    data: {
      userId,
      courseId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  const newTotalRaters = existingCourse.totalRaters + 1;
  const newSumOfRatings =
    existingCourse.avgRating * existingCourse.totalRaters + payload.rating;

  const newAvgRating = newSumOfRatings / newTotalRaters;

  await prisma.studenCourse.update({
    where: {
      id: existingMyCourse.id,
    },
    data: {
      isReview: true,
    },
  });

  await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      avgRating: newAvgRating,
      totalRaters: newTotalRaters,
    },
  });
};

const getMyReviews = async (userId: string) => {
  const result = await prisma.review.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          title: true,
          coverImage: true,
          avgRating: true,
          totalRaters: true
        },
      },
    },
  });
  return result;
};

export const ReviewServices = {
  createReview,
  getMyReviews,
};
