import type { Request as RequestType } from "express";
import type { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request extends Request {
      user?: { _id: Types.ObjectId };
    }
  }
}
