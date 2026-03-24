import type { Request, Response } from "express";
import authService from "./auth.service.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import sessionService from "../session/session.service.js";
import type { AuthRdo } from "./rdo/auth-rdo.js";
import type { Locale } from "../../config/i18n.js";

class AuthController {
  async register(req: Request, res: Response) {
    const locale = (req.query.locale as Locale) || "en";

    const location = sessionService.getLocationByIp(req.ip as string);
    const device = sessionService.getDeviceByUserAgent(
      req.headers["user-agent"] as string,
    );
    const result = await authService.register(
      req.body,
      location,
      device,
      locale,
    );

    return res.json(result);
  }

  async login(req: Request, res: Response): Promise<Response<AuthRdo>> {
    const locale = (req.query.locale as Locale) || "en";
    const location = sessionService.getLocationByIp(req.ip as string);
    const device = sessionService.getDeviceByUserAgent(
      req.headers["user-agent"] as string,
    );
    const result = await authService.login(req.body, location, device, locale);

    return res.json(result);
  }

  async refreshToken(req: Request, res: Response): Promise<Response<AuthRdo>> {
    const result = await authService.refreshToken(req.body.refreshToken);

    return res.json(result);
  }

  async resetPassword(req: Request, res: Response): Promise<Response<AuthRdo>> {
    const locale = (req.query.locale as Locale) || "en";

    const { email, password, code } = req.body;
    const location = sessionService.getLocationByIp(req.ip as string);
    const device = sessionService.getDeviceByUserAgent(
      req.headers["user-agent"] as string,
    );
    const result = await authService.resetPassword(
      email,
      +code,
      password,
      location,
      device,
      locale,
    );

    return res.json(result);
  }

  async checkUserByEmail(
    req: Request,
    res: Response,
  ): Promise<Response<SuccessRdo>> {
    const result = await authService.checkUserByEmail(
      req.query.email as string,
    );

    return res.json(result);
  }

  async createCode(req: Request, res: Response): Promise<Response<SuccessRdo>> {
    const locale = (req.query.locale as Locale) || "en";

    const result = await authService.createCode(req.body.email, locale);

    return res.json(result);
  }
}

export default new AuthController();
