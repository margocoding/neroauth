import type { NextFunction, Request, Response } from "express";
import HttpError from "../utils/exceptions/HttpError.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import type { Types } from "mongoose";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    const token = authHeader?.split(" ")[1];

    if (!token) {
      throw HttpError.Unauthorized();
    }

    const verified = jwt.verify(token, config.jwt_secret);

    req.user = verified as { _id: Types.ObjectId };
    next();
  } catch (e) {
    console.error(e);
    throw HttpError.Unauthorized();
  }
};

export default authMiddleware;
