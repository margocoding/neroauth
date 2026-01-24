import { Router } from "express";
import { createInvitationMiddleware } from "./dto/create-invitation.dto.js";
import invitationController from "./invitation.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

export const invitationRouter = Router();

invitationRouter.post(
  "/",
  ...createInvitationMiddleware,
  authMiddleware,
  invitationController.createInvitation,
);
