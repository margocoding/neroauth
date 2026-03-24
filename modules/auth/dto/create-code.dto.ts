import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";
import { localeMiddleware } from "../../../utils/dto/locale.dto.js";

export interface CreateCodeDto {
  email: string;
}

export const createCodeMiddleware = [
  body("email")
    .notEmpty()
    .withMessage("errors.email.required")
    .isEmail()
    .withMessage("errors.email.invalid"),
  
  ...localeMiddleware,
  validationMiddleware,
];
