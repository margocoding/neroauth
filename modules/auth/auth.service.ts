import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Types } from "mongoose";
import { randomInt } from "node:crypto";
import { redis } from "../../app.js";
import config from "../../config/config.js";
import HttpError from "../../utils/exceptions/HttpError.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import mailService from "../mail/mail.service.js";
import userService from "../user/user.service.js";
import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";
import sessionService from "../session/session.service.js";
import type { Device, Location } from "../session/session.model.js";
import { AuthRdo } from "./rdo/auth-rdo.js";
import type { IUser } from "../user/user.model.js";
import { readFileSync } from "node:fs";

class AuthService {
  async register(
    { code, ...data }: RegisterDto,
    location: Location,
    device: Device,
  ): Promise<AuthRdo> {
    const { success } = await this.verifyCode(data.email, code);

    if (!success) {
      throw HttpError.BadRequest("errors.code.invalid");
    }

    const passwordSalt = await bcrypt.genSalt(10, "a");
    const passwordHash = await bcrypt.hash(data.password, passwordSalt);

    const user = await userService.createUser({
      ...data,
      password: passwordHash,
    });
    const [accessToken, refreshToken] = this.generateTokens(user._id);

    await sessionService.createSession(
      refreshToken,
      accessToken,
      user._id,
      location,
      device,
    );

    await redis.del(`auth-code:${user.email}`);

    return new AuthRdo(user, accessToken, refreshToken);
  }

  async login(
    { email, password }: LoginDto,
    location: Location,
    device: Device,
  ): Promise<AuthRdo> {
    const user = await userService.fetchUserByEmail(email);

    if (!user) {
      throw HttpError.Unauthorized("errors.auth.invalid");
    }

    const isPasswordCompare = await bcrypt.compare(password, user.password);

    if (!isPasswordCompare) {
      throw HttpError.Unauthorized("errors.auth.invalid");
    }

    const [accessToken, refreshToken] = this.generateTokens(user._id);
    await sessionService.createSession(
      refreshToken,
      accessToken,
      user._id,
      location,
      device,
    );

    return new AuthRdo(user, accessToken, refreshToken);
  }

  async refreshToken(currentRefreshToken: string): Promise<AuthRdo> {
    const session = await sessionService.verifySession(currentRefreshToken);

    if (!session) throw HttpError.Unauthorized();

    const [accessToken, refreshToken] = this.generateTokens(session.user._id);
    await sessionService.updateSessionToken(
      session._id,
      refreshToken,
      accessToken,
    );

    return new AuthRdo(session.user as IUser, accessToken, refreshToken);
  }

  async checkUserByEmail(email: string): Promise<SuccessRdo> {
    try {
      const user = await userService.fetchUserByEmail(email);

      if (!user) return { success: false };

      return { success: true };
    } catch (e) {
      return { success: false };
    }
  }

  async createCode(email: string): Promise<SuccessRdo> {
    const existingCodeString = await redis.get(`auth-code:${email}`);

    if (existingCodeString) {
      const existingCode = JSON.parse(existingCodeString);

      if (
        Date.now() - new Date(existingCode.createdAt).getTime() <
        config.auth_code_resend_limit
      ) {
        throw HttpError.BadRequest("errors.code.resend");
      }
    }

    const code = randomInt(1000000);

    const mailHtml = readFileSync("./modules/auth/mails/code.html", "utf-8");
    const html = mailHtml
      .replace("{title}", "Код подтверждения")
      .replace(
        "{description}",
        "На вашу почту был отправлен код подтверждения, если вы не отправляли этот код просто проигнорируйте это сообщение. Никому код не сообщайте",
      )
      .replace("{code}", String(code))
      .replace("{code_title}", "Ваш код: ");

    await Promise.all([
      mailService.sendMail(email, "Confirmation code", {
        html,
      }),
      redis.set(
        `auth-code:${email}`,
        JSON.stringify({
          createdAt: new Date(),
          code,
        }),
      ),
    ]);

    return { success: true };
  }

  async verifyCode(email: string, code: number): Promise<SuccessRdo> {
    try {
      const codeFoundString = await redis.get(`auth-code:${email}`);

      if (!codeFoundString) {
        throw HttpError.BadRequest("errors.code.invalid");
      }

      const codeFound = JSON.parse(codeFoundString);

      if (code !== codeFound.code) {
        throw HttpError.BadRequest("errors.code.invalid");
      }

      if (
        Date.now() - new Date(codeFound.createdAt).getTime() >
        config.auth_code_expire_limit
      ) {
        throw HttpError.BadRequest("errors.code.expired");
      }

      return { success: true };
    } catch (e) {
      console.error("Cannot verify an auth code", e);
      return { success: false };
    }
  }

  async resetPassword(
    email: string,
    code: number,
    password: string,
    location: Location,
    device: Device,
  ): Promise<AuthRdo> {
    const verified = await this.verifyCode(email, code);

    if (!verified) throw HttpError.BadRequest("errors.code.invalid");

    const user = await userService.fetchUserByEmail(email);

    if (!user) throw HttpError.BadRequest("Wrong reset password link");

    const passwordSalt = await bcrypt.genSalt(10, "a");
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    const { success } = await userService.updateUserPassword(
      user._id,
      passwordHash,
    );

    const [accessToken, refreshToken] = this.generateTokens(user._id);
    await sessionService.createSession(
      refreshToken,
      accessToken,
      user._id,
      location,
      device,
    );
    await sessionService.deleteAllSessions(user._id, refreshToken);

    return new AuthRdo(user, accessToken, refreshToken);
  }

  generateTokens(_id: Types.ObjectId): [string, string] {
    return [
      jwt.sign({ _id }, config.jwt_secret, {
        expiresIn: config.access_token_lifetime,
      }),
      jwt.sign({ _id }, config.jwt_refresh_secret, {
        expiresIn: config.refresh_token_lifetime,
      }),
    ];
  }
}

export default new AuthService();
