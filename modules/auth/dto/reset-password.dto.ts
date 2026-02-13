import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export const resetPasswordMiddleware = [
  body("password")
    .notEmpty()
    .withMessage("errors.password.required")
    .isStrongPassword({ minLength: 8 })
    .withMessage("errors.password.weak"),

  body("token")
    .notEmpty()
    .withMessage("errors.token.required")
    .isJWT()
    .withMessage("errors.token.invalid"),

  validationMiddleware,
];
