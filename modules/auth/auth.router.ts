import { Router } from "express";
import { body } from "express-validator";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import authController from "./auth.controller.js";
import { loginMiddleware } from "./dto/login.dto.js";
import { registerMiddleware } from "./dto/register.dto.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  ...registerMiddleware,
  authController.register
);

authRouter.post('/login', ...loginMiddleware, authController.login);
