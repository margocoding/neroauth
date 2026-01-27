import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";
import type { CreateUserDto } from "../../user/dto/create-user.dto.js";

export interface RegisterDto extends CreateUserDto {
  code: number;
}

export const registerMiddleware = [
  body("login")
    .notEmpty()
    .withMessage("Login is a required field")
    .isString()
    .withMessage("Login should be a string"),
  body("email")
    .notEmpty()
    .withMessage("Email is a required field")
    .isEmail()
    .withMessage("Wrong email format"),
  body("code")
    .notEmpty()
    .withMessage("Code is a required field")
    .isInt({ max: 1000000 })
    .withMessage("Wrong code format"),
  body("password")
    .notEmpty()
    .withMessage("Password is a required field")
    .isStrongPassword({ minLength: 8 })
    .withMessage(
      "Password should include digits, uppercase letters and special symbols ('@', '!', '#')",
    ),
  validationMiddleware,
];
