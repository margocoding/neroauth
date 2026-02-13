import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export const requestResetPasswordMiddleware = [
  body("email")
    .notEmpty()
    .withMessage("errors.email.required")
    .isEmail()
    .withMessage("errors.email.invalid"),

  validationMiddleware,
];
