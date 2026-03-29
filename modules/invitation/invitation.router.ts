import { Router } from "express";
import { createInvitationMiddleware } from "./dto/create-invitation.dto.js";
import invitationController from "./invitation.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { fetchInvitationsMiddleware } from "./dto/fetch-invitations.dto.js";
import { applyInvitationMiddleware } from "./dto/apply-invitation.dto.js";
import { dismissInvitationMiddleware } from "./dto/dismiss-invitation.dto.js";

export const invitationRouter = Router();

invitationRouter.post(
  "/",
  ...createInvitationMiddleware,
  authMiddleware,
  invitationController.createInvitation,
);
invitationRouter.post(
  "/apply/:id",
  ...applyInvitationMiddleware,
  authMiddleware,
  invitationController.applyInvitation,
);
invitationRouter.post(
  "/dismiss/:id",
  ...dismissInvitationMiddleware,
  authMiddleware,
  invitationController.dismissInvitation,
);
invitationRouter.get(
  "/",
  authMiddleware,
  ...fetchInvitationsMiddleware,
  invitationController.fetchInvitations,
);
