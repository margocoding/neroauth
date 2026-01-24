import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  res.status(400).json({ errors: result.array() });
}

export default validationMiddleware;