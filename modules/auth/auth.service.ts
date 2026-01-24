import type { CreateUserDto } from "../user/dto/create-user.dto.js";
import bcrypt from "bcrypt";
import userService from "../user/user.service.js";
import jwt from "jsonwebtoken";
import config from "../../config/config.js";
import type { LoginDto } from "./dto/login.dto.js";
import HttpError from "../../utils/exceptions/HttpError.js";
import type { RegisterDto } from "./dto/register.dto.js";
import type { Types } from "mongoose";

class AuthService {
  async register(data: RegisterDto) {
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

  generateToken(_id: Types.ObjectId) {
    const token = jwt.sign({ _id }, config.jwt_secret);
    return token;
  }
}

export default new AuthService();
