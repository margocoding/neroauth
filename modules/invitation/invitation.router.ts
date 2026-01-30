import { Router } from "express";
import { createInvitationMiddleware } from "./dto/create-invitation.dto.js";
import invitationController from "./invitation.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { fetchInvitationsMiddleware } from "./dto/fetch-invitations.dto.js";

export const invitationRouter = Router();

invitationRouter.post(
  "/",
  ...createInvitationMiddleware,
  authMiddleware,
  invitationController.createInvitation,
);
invitationRouter.post(
  "/apply/:id",
  authMiddleware,
  invitationController.applyInvitation,
);
invitationRouter.get(
  "/",
  authMiddleware,
  ...fetchInvitationsMiddleware,
  invitationController.fetchInvitations,
);
