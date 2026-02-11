import {body} from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export const resetPasswordMiddleware = [
    body("password")
        .notEmpty()
        .withMessage("Password is a required field")
        .isStrongPassword({ minLength: 8 })
        .withMessage(
            "Password should include digits, uppercase letters and special symbols ('@', '!', '#')",
        ),
    body('token').notEmpty().withMessage('Token is a required field').isJWT().withMessage('Wrong JWT format'),
    validationMiddleware
]