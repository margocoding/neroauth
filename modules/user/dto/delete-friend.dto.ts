import { param } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export const deleteFriendMiddleware = [
  param("friend_id")
    .notEmpty()
    .withMessage("friend_is is a required field")
    .isMongoId()
    .withMessage("Friend id should be an object id"),
  validationMiddleware,
];
