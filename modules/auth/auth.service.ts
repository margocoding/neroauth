import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Types } from "mongoose";
import { randomInt } from "node:crypto";
import { redis } from "../../app.js";
import config from "../../config/config.js";
import HttpError from "../../utils/exceptions/HttpError.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import mailService from "../mail/mail.service.js";
import { UserRdo } from "../user/rdo/user.rdo.js";
import userService from "../user/user.service.js";
import type { LoginDto } from "./dto/login.dto.js";
import type { RegisterDto } from "./dto/register.dto.js";

class AuthService {
  async register({ code, ...data }: RegisterDto) {
    const { success } = await this.verifyCode(data.email, code);

    if (!success) {
      throw HttpError.BadRequest("Wrong code");
    }

    const passwordSalt = await bcrypt.genSalt(10, "a");
    const passwordHash = await bcrypt.hash(data.password, passwordSalt);

    const user = await userService.createUser({
      ...data,
      password: passwordHash,
    });
    const token = this.generateToken(user._id);

    await redis.del(`auth-code:${user.email}`);

    return { user: new UserRdo(user), token };
  }

  async login({ email, password }: LoginDto) {
    const user = await userService.fetchUserByEmail(email);

    if (!user) {
      throw HttpError.Unauthorized("Wrong login or password");
    }

    const isPasswordCompare = await bcrypt.compare(password, user.password);

    if (!isPasswordCompare) {
      throw HttpError.Unauthorized("Wrong login or password");
    }

    const token = this.generateToken(user._id);

    return {
      user: new UserRdo(user),
      token,
    };
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
        throw HttpError.BadRequest(
          "You can resend a code only after 2 minutes",
        );
      }
    }

    const code = randomInt(1000000);

    await Promise.all([
      mailService.sendMail(
        email,
        "Confirmation code",
        `Your confirmation code is ${code}`,
      ),
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
        throw HttpError.BadRequest("Wrong code");
      }

      const codeFound = JSON.parse(codeFoundString);

      if (code !== codeFound.code) {
        throw HttpError.BadRequest("Wrong code");
      }

      if (
        Date.now() - new Date(codeFound.createdAt).getTime() >
        config.auth_code_expire_limit
      ) {
        throw HttpError.BadRequest("Code has already expired");
      }

      return { success: true };
    } catch (e) {
      console.error("Cannot verify an auth code", e);
      return { success: false };
    }
  }

  generateToken(_id: Types.ObjectId) {
    const token = jwt.sign({ _id }, config.jwt_secret);
    return token;
  }
}

export default new AuthService();
