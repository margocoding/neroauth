import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";
import { localeMiddleware } from "../../../utils/dto/locale.dto.js";

export const resetPasswordMiddleware = [
  body("email")
    .notEmpty()
    .withMessage("errors.email.required")
    .isEmail()
    .withMessage("errors.email.invalid"),

  body("password")
    .notEmpty()
    .withMessage("errors.password.required")
    .isStrongPassword({ minLength: 8 })
    .withMessage("errors.password.weak"),

  body("code")
    .notEmpty()
    .withMessage("errors.code.required")
    .isInt({ max: 1000000 })
    .withMessage("errors.code.invalid"),

  ...localeMiddleware,

  validationMiddleware,
];
