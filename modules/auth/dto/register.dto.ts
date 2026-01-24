import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";
import type { CreateUserDto } from "../../user/dto/create-user.dto.js";

export interface RegisterDto extends CreateUserDto {}

export const registerMiddleware = [
  body("login").notEmpty().isString(),
  body("email").notEmpty().isEmail(),
  body("password")
    .notEmpty()
    .isStrongPassword({ minLength: 8 })
    .withMessage(
      "Password should include digits, uppercase letters and special symbols ('@', '!', '#')",
    ),
  validationMiddleware,
];
