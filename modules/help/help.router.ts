import { Router } from "express";
import helpController from "./help.controller.js";
import {downloadMiddleware} from "./dto/download.dto.js";

export const helpRouter = Router();

helpRouter.get("/video", helpController.fetchVideo);
helpRouter.get("/download", downloadMiddleware, helpController.download);
