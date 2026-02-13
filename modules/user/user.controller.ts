import type { Request, Response } from "express";
import userService from "./user.service.js";
import type { IUser } from "./user.model.js";
import HttpError from "../../utils/exceptions/HttpError.js";
import { UserRdo } from "./rdo/user.rdo.js";
import { Types } from "mongoose";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";

class UserController {
  async fetchUserData(req: Request, res: Response): Promise<Response<UserRdo>> {
    if (!req.user) {
      throw HttpError.Unauthorized();
    }

    const result = await userService.fetchUserById(req.user._id);

    return res.json(new UserRdo(result));
  }

  async fetchUserById(req: Request, res: Response): Promise<Response<UserRdo>> {
    try {
      const result = await userService.fetchUserById(
        new Types.ObjectId(req.params.id as string),
      );

      return res.json(result);
    } catch (e) {
      throw HttpError.NotFound("User not found");
    }
  }

  async fetchUserFriends(
    req: Request,
    res: Response,
  ): Promise<Response<UserRdo[]>> {
    try {
      const result = await userService.fetchFriends(
        new Types.ObjectId(req.params.id as string),
        +(req.query.page || 1),
        +(req.query.pageSize || 15),
      );

      return res.json(result);
    } catch (e) {
      throw HttpError.NotFound("User not found");
    }
  }

  async deleteFriend(
    req: Request,
    res: Response,
  ): Promise<Response<SuccessRdo>> {
    if (!req.user) throw HttpError.Unauthorized();
    const result = await userService.deleteFriend(
      req.user._id,
      new Types.ObjectId(req.params.friend_id as string),
    );

    return res.json(result);
  }
}

export default new UserController();
