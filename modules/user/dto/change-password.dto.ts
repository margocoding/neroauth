import {body} from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export const changePasswordMiddleware = [
    body("password")
        .notEmpty()
        .withMessage("errors.password.required")
        .isStrongPassword({minLength: 8})
        .withMessage("errors.password.weak"),
    body("currentPassword")
        .notEmpty()
        .withMessage("errors.password.required")
        .isStrongPassword({minLength: 8})
        .withMessage("errors.password.weak"),
    body('refreshToken').notEmpty().withMessage('Token is a required field').isJWT().withMessage('Wrong JWT format'),
    validationMiddleware
]