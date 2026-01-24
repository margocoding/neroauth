import { body } from "express-validator";
import validationMiddleware from "../../../middlewares/validation.middleware.js";
import type { Types } from "mongoose";

export interface CreateInvitationDto {
  code: number;
}

export const createInvitationMiddleware = [
  body("code").notEmpty().isInt(),
  validationMiddleware,
];
