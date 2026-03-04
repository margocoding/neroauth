import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import sessionController from "./session.controller.js";

export const sessionRouter = Router();

sessionRouter.delete(
  "/close/:id",
  authMiddleware,
  sessionController.deleteSession,
);
sessionRouter.delete(
  "/close",
  authMiddleware,
  sessionController.deleteAllSessions,
);
sessionRouter.get("/", authMiddleware, sessionController.fetchSessions);
