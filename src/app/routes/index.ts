import express from "express";
import { AuthRouters } from "../modules/auth/auth.routes";
import { UserRouters } from "../modules/dashboard/user/user.routes";
import { NotificationsRouters } from "../modules/notifications/notification.routes";
import { CourseRouters } from "../modules/course/course.routes";
import { FavoriteRouters } from "../modules/favorite/favorite.routes";
import { ReviewRouters } from "../modules/review/review.routes";
import { CategoryRoutes } from "../modules/category/category.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRouters,
  },
  {
    path: "/users",
    route: UserRouters,
  },
  {
    path: "/notifications",
    route: NotificationsRouters,
  },
  {
    path: "/courses",
    route: CourseRouters,
  },
  {
    path: "/reviews",
    route: ReviewRouters,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
