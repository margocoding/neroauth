import { param } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export const fetchUserMiddleware = [
  param("id")
    .notEmpty()
    .withMessage("id is a required field")
    .isMongoId()
    .withMessage("id should be a mongo id"),
  validationMiddleware,
];
