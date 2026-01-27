import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export interface CreateCodeDto {
  email: string;
}

export const createCodeMiddleware = [
  body("email")
    .notEmpty()
    .withMessage("Email is a required field")
    .isEmail()
    .withMessage("Wrong email format"),
  validationMiddleware,
];
