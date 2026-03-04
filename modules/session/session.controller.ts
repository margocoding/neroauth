import type { Request, Response } from "express";
import type { ISession } from "./session.model.js";
import sessionService from "./session.service.js";
import HttpError from "../../utils/exceptions/HttpError.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import { Types } from "mongoose";

class SessionController {
  async fetchSessions(
    req: Request,
    res: Response,
  ): Promise<Response<ISession[]>> {
    if (!req.user) throw HttpError.Unauthorized();
    const result = await sessionService.fetchSessions(req.user._id);

    return res.json(result);
  }

  async deleteSession(
    req: Request,
    res: Response,
  ): Promise<Response<SuccessRdo>> {
    if (!req.user) throw HttpError.Unauthorized();
    const result = await sessionService.deleteSession(
      new Types.ObjectId(req.params.id as string),
      req.user._id,
    );

    return res.json(result);
  }

  async deleteAllSessions(
    req: Request,
    res: Response,
  ): Promise<Response<SuccessRdo>> {
    if (!req.user) throw HttpError.Unauthorized();
    const result = await sessionService.deleteAllSessions(
      req.user._id,
      req.body.refreshToken as string,
    );

    return res.json(result);
  }
}

export default new SessionController();
