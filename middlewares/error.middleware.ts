import type { NextFunction, Request, Response } from "express";
import ApiError from "../utils/exceptions/HttpError.js";
import config from "../config/config.js";

const errorMiddleware = async (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }

  const params = new URLSearchParams({
    chat_id: config.vk_chat_id,
    message: '[ERROR] ' + err,
    random_id: '0',
    access_token: config.vk_access_token,
    v: "5.131"
  });

  const response = await fetch(`https://api.vk.com/method/messages.send?${params.toString()}`, {method: 'GET'});
  console.log(await response.json());

  return res.status(500).json("Unexpected server error");
};

export default errorMiddleware;