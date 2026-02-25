import {body} from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";
import type {CreateUserDto} from "../../user/dto/create-user.dto.js";

export interface RegisterDto extends CreateUserDto {
    code: number;
}

export const registerMiddleware = [
    body("login")
        .notEmpty()
        .withMessage("errors.login.required")
        .isString()
        .withMessage("errors.login.string")
        .isLength({max: 15})
        .withMessage('errors.login.length'),

    body("email")
        .notEmpty()
        .withMessage("errors.email.required")
        .isEmail()
        .withMessage("errors.email.invalid"),

    body("code")
        .notEmpty()
        .withMessage("errors.code.required")
        .isInt({max: 1000000})
        .withMessage("errors.code.invalid"),

    body("password")
        .notEmpty()
        .withMessage("errors.password.required")
        .isStrongPassword({minLength: 8})
        .withMessage("errors.password.weak"),

    validationMiddleware,
];
