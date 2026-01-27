import type { CreateUserDto } from "../user/dto/create-user.dto.js";
import bcrypt from "bcrypt";
import userService from "../user/user.service.js";
import jwt from "jsonwebtoken";
import config from "../../config/config.js";
import type { LoginDto } from "./dto/login.dto.js";
import HttpError from "../../utils/exceptions/HttpError.js";
import type { RegisterDto } from "./dto/register.dto.js";
import type { Types } from "mongoose";
import { randomInt } from "node:crypto";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import { redis } from "../../app.js";
import mailService from "../mail/mail.service.js";

class AuthService {
  async register(data: RegisterDto) {
    const { success } = await this.verifyCode(data.email, data.code);

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

    return { user, token };
  }

  async login({ login, password }: LoginDto) {
    const user = await userService.findUserByLogin(login);

    if (!user) {
      throw HttpError.Unauthorized("Wrong login or password");
    }

    const isPasswordCompare = await bcrypt.compare(password, user.password);

    if (!isPasswordCompare) {
      throw HttpError.Unauthorized("Wrong login or password");
    }

    const token = this.generateToken(user._id);

    return {
      user,
      token,
    };
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

      await redis.del(`auth-code:${email}`);

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
