import express from "express";
import { AuthRouters } from "../modules/auth/auth.routes";
import { CategoryRoutes } from "../modules/category/category.routes";
import { UserRouters } from "../modules/user/user.routes";
import { BrandRoutes } from "../modules/brand/brand.routes";

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
    path: "/category",
    route: CategoryRoutes,
  },
  {
    path: "/brands",
    route: BrandRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
