import type { Request, Response } from "express";
import authService from "./auth.service.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";

class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);

    return res.json(result);
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);

    return res.json(result);
  }

  async createCode(req: Request, res: Response): Promise<Response<SuccessRdo>> {
    const result = await authService.createCode(req.body.email);

    return res.json(result);
  }
}

export default new AuthController();
