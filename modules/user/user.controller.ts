import type { Request, Response } from "express";
import userService from "./user.service.js";
import type { IUser } from "./user.model.js";
import HttpError from "../../utils/exceptions/HttpError.js";

class UserController {
    async fetchUserData(req: Request, res: Response): Promise<Response<IUser>> {
        if(!req.user) {
            throw HttpError.Unauthorized();
        }
    
        const result = await userService.fetchUserById(req.user._id);

        return res.json(result);
    }
}

export default new UserController();