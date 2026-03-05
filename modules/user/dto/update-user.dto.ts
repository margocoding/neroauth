import {body} from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export interface UpdateUserDto {
    login: string;
}

export const updateUserMiddleware = [
    body('login').notEmpty().withMessage('errors.login.required').isString().withMessage('errors.login.wrong_format'),
    validationMiddleware
]