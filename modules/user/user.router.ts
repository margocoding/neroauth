import { Router } from "express";
import userController from "./user.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { fetchUserMiddleware } from "./dto/fetch-user.dto.js";
import { fetchUserFriendsMiddleware } from "./dto/fetch-user-friends.dto.js";
import { deleteFriendMiddleware } from "./dto/delete-friend.dto.js";
import multer from "multer";
import { changePasswordMiddleware } from "./dto/change-password.dto.js";
import { updateUserMiddleware } from "./dto/update-user.dto.js";
import HttpError from "../../utils/exceptions/HttpError.js";

export const userRouter = Router();

const upload = multer({
    fileFilter(req, file, callback) {
        if (['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
});

userRouter.get("/", authMiddleware, userController.fetchUserData);
userRouter.get(
    "/:id/friends",
    ...fetchUserFriendsMiddleware,
    userController.fetchUserFriends,
);
userRouter.post(
    "/upload-avatar",
    authMiddleware,
    upload.single("avatar"),
    userController.uploadAvatar,
);
userRouter.delete(
    "/avatar",
    authMiddleware,
    userController.deleteAvatar,
);
userRouter.put('/', ...updateUserMiddleware, authMiddleware, userController.updateUser);
userRouter.put('/change-password', ...changePasswordMiddleware, authMiddleware, userController.changePassword)
userRouter.get("/:id", ...fetchUserMiddleware, userController.fetchUserById);
userRouter.delete(
    "/friend/:friend_id",
    ...deleteFriendMiddleware,
    authMiddleware,
    userController.deleteFriend,
);
