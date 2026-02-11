import { param } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export enum ChannelLanguage {
  RU = "RU",
  EN = "EN",
}

export const fetchPostsMiddleware = [
  param("language")
    .notEmpty()
    .withMessage("Language is a required field")
    .isIn(Object.values(ChannelLanguage))
    .withMessage(
      `Language should contain one of these values ${Object.values(ChannelLanguage).join(", ")}`,
    ),
  validationMiddleware,
];
