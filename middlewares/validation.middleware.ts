import type {NextFunction, Request, Response} from "express";
import {matchedData, validationResult} from "express-validator";

const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
        req.body = matchedData(req, {locations: ['body'], includeOptionals: true});
        return next();
    }

    res.status(400).json({errors: result.array()});
}

export default validationMiddleware;