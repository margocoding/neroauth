import { query } from "express-validator";
import { Locale } from "../../config/i18n.js";

export const localeMiddleware = [
  query("language")
    .optional()
    .isIn(Object.values(Locale))
    .withMessage(
      `Locale must be next values: ${Object.values(Locale).join(", ")}`,
    ),
];
