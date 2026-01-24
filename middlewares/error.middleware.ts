import type { NextFunction, Request, Response } from "express";
import ApiError from "../utils/exceptions/HttpError.js";

const errorMiddleware = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }

  return res.status(500).json("Unexpected server error");
};

export default errorMiddleware;