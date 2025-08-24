import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import path from "path";
import morgan from "morgan";
import { successTemplate } from "./app/lib/successTemplete";
import { cancelTemplate } from "./app/lib/cancelTemplete";
import bodyParser from "body-parser";

const app: Application = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:3001",
    ],
  })
);

//parser
app.use(bodyParser.json({ limit: "100mb" }));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"))
);
console.log(path.join(__dirname, "..", "public", "uploads"));

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "The ecom server is running. . .",
  });
});

app.use("/success", (req: Request, res: Response) => {
  res.send(successTemplate());
});

app.use("/cancel", (req: Request, res: Response) => {
  res.send(cancelTemplate());
});

app.use(morgan('dev'));
app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
