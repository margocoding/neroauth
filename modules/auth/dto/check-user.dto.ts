import { query } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export const checkUserMiddleware = [
  query("email")
    .notEmpty()
    .withMessage("errors.email.required")
    .isEmail()
    .withMessage("errors.email.invalid"),

  validationMiddleware,
];
