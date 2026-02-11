import {query} from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export const downloadMiddleware = [
    query('fileName').notEmpty().withMessage('Filename is a required field').isString().withMessage('Filename should be a string'),
    validationMiddleware
]