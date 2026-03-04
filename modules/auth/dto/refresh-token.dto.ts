import validationMiddleware from "../../../middlewares/validation.middleware.js";
import {body} from "express-validator";

export const refreshTokenMiddleware = [
    body('refreshToken').notEmpty().withMessage('Refresh token should not be empty').isJWT().withMessage('Wrong token format'),
    validationMiddleware
]