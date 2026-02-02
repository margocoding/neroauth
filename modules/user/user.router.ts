import { Router } from "express";
import userController from "./user.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { paginationMiddleware } from "../../utils/dto/pagination.dto.js";
import { fetchUserMiddleware } from "./dto/fetch-user.dto.js";
import { fetchUserFriendsMiddleware } from "./dto/fetch-user-friends.dto.js";
import { deleteFriendMiddleware } from "./dto/delete-friend.dto.js";

export const userRouter = Router();

userRouter.get("/", authMiddleware, userController.fetchUserData);
userRouter.get(
  "/:id/friends",
  ...fetchUserFriendsMiddleware,
  userController.fetchUserFriends,
);
userRouter.get("/:id", ...fetchUserMiddleware, userController.fetchUserById);
userRouter.delete(
  "/friend/:friend_id",
  ...deleteFriendMiddleware,
  authMiddleware,
  userController.deleteFriend,
);
