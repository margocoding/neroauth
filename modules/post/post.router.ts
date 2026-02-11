import { Router } from "express";
import postController from "./post.controller.js";

export const postRouter = Router();

postRouter.get("/:language", postController.fetchPosts);
postRouter.get("/image/:id", postController.fetchImage);
