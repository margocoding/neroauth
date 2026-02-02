import { query } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export const checkUserMiddleware = [
  query("email")
    .notEmpty()
    .withMessage("email is a required field")
    .isEmail()
    .withMessage("Wrong email format"),
  validationMiddleware,
];
