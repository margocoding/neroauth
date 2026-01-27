import { Router } from "express";
import authController from "./auth.controller.js";
import { createCodeMiddleware } from "./dto/create-code.dto.js";
import { loginMiddleware } from "./dto/login.dto.js";
import { registerMiddleware } from "./dto/register.dto.js";

export const authRouter = Router();

authRouter.post(
  "/create-code",
  ...createCodeMiddleware,
  authController.createCode,
);
authRouter.post("/register", ...registerMiddleware, authController.register);
authRouter.post("/login", ...loginMiddleware, authController.login);
