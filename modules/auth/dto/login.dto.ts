import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";
import { localeMiddleware } from "../../../utils/dto/locale.dto.js";

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
    .withMessage("errors.password.string")
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s]+$/)
    .withMessage("errors.login.match"),
  ...localeMiddleware,

  validationMiddleware,
];
