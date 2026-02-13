import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export interface LoginDto {
  email: string;
  password: string;
}

export const loginMiddleware = [
  body("email")
    .notEmpty()
    .withMessage("errors.email.required")
    .isEmail()
    .withMessage("errors.email.invalid"),

  body("password")
    .notEmpty()
    .withMessage("errors.password.required")
    .isString()
    .withMessage("errors.password.string"),

  validationMiddleware,
];
