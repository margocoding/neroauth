import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";
import type { Types } from "mongoose";

export interface LoginDto {
    login: string;
    password: string;
}

export const loginMiddleware = [body('login').notEmpty().isString(), body('password').notEmpty().isString(), validationMiddleware];