import { query } from "express-validator";
import { paginationMiddleware } from "../../../utils/dto/pagination.dto.js";
import validationMiddleware from "../../../middlewares/validation.middleware.js";

export enum InvitationType {
  INCOMING = "incoming",
  OUTGOINT = "outgoing",
}

export const fetchInvitationsMiddleware = [
  ...paginationMiddleware,
  query("type")
    .optional()
    .isIn(Object.values(InvitationType))
    .withMessage(
      `Type must be next values: ${Object.values(InvitationType).join(", ")}`,
    ),
  validationMiddleware,
];
