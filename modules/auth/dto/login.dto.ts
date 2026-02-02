import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";
import type { Types } from "mongoose";

export interface LoginDto {
  email: string;
  password: string;
}

export const loginMiddleware = [
  body("email")
    .notEmpty()
    .withMessage("Email is a required field")
    .isEmail()
    .withMessage("Wrong email format"),
  body("password").notEmpty().isString(),
  validationMiddleware,
];
