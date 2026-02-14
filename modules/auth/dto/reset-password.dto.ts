import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export const resetPasswordMiddleware = [
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
  

  validationMiddleware,
];
