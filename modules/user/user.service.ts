import type { Types } from "mongoose";
import HttpError from "../../utils/exceptions/HttpError.js";
import type { CreateUserDto } from "./dto/create-user.dto.js";
import { type IUser, User } from "./user.model.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import { randomInt, randomUUID } from "node:crypto";
import { UserRdo } from "./rdo/user.rdo.js";
import storageService from "../storage/storage.service.js";
import config from "../../config/config.js";
import bcrypt from "bcrypt";
import sessionService from "../session/session.service.js";
import type { UpdateUserDto } from "./dto/update-user.dto.js";
import { redis } from "../../app.js";
import { PaginationRdo } from "../../utils/rdo/pagination.rdo.js";

class UserService {
  async createUser(dto: CreateUserDto): Promise<IUser> {
    const userWithSameData = await User.findOne({
      $or: [{ email: dto.email }, { login: dto.login }],
    });

    if (userWithSameData && userWithSameData.email === dto.email) {
      throw HttpError.BadRequest("User with this email is already existing");
    } else if (userWithSameData && userWithSameData.login === dto.login) {
      throw HttpError.BadRequest("User with this login is already existing");
    }

    const user = new User({ ...dto, inviteCode: randomInt(10000000) });

    return await user.save();
  }

  async uploadAvatar(
    _id: Types.ObjectId,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const user = await this.fetchUserById(_id);

      if (!user) throw HttpError.BadRequest("User not found");

      if (user.avatar) {
        await this.deleteUserAvatar(user._id, user.avatar);
      }

      const fileExtension = "." + file.originalname.split(".").at(-1);

      const avatarPath = await storageService.uploadFile(
        file.buffer,
        config.avatar_folder,
        randomUUID() + fileExtension,
      );

      await User.updateOne({ _id: user._id }, { avatar: avatarPath });

      return avatarPath;
    } catch (e) {
      console.error("Cannot upload an avatar", e);
      throw HttpError.BadRequest("Wrong file");
    }
  }

  async deleteAvatar(_id: Types.ObjectId): Promise<SuccessRdo> {
    const user = await this.fetchUserById(_id);
    if (!user) throw HttpError.Unauthorized();

    await this.deleteUserAvatar(user._id, user.avatar);

    return { success: true };
  }

  async updateUserPassword(
    _id: Types.ObjectId,
    passwordHash: string,
  ): Promise<SuccessRdo> {
    try {
      await User.updateOne({ _id }, { password: passwordHash });

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  }

  async fetchFriends(
    _id: Types.ObjectId,
    page: number = 1,
    pageSize: number = 200,
  ): Promise<PaginationRdo<UserRdo>> {
    const [friends, total] = await Promise.all([
      User.find({ friends: { $in: [_id] } })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      User.countDocuments({ friends: { $in: [_id] } }),
    ]);

    return new PaginationRdo<UserRdo>(
      total,
      friends.map((friend) => new UserRdo(friend as IUser)),
    );
  }

  async deleteFriend(
    user_id: Types.ObjectId,
    friend_id: Types.ObjectId,
  ): Promise<SuccessRdo> {
    try {
      await Promise.all([
        User.updateOne({ _id: user_id }, { $pull: { friends: friend_id } }),
        User.updateOne({ _id: friend_id }, { $pull: { friends: user_id } }),
      ]);

      return { success: true };
    } catch (e) {
      console.error("Cannot delete a friend", e);
      throw HttpError.NotFound("Friend not found");
    }
  }

  async fetchUserById(_id: Types.ObjectId): Promise<IUser> {
    const user = await User.findOne({ _id });

    if (!user) {
      throw HttpError.NotFound("User not found");
    }

    return user;
  }

  async findUserByLogin(login: string): Promise<IUser | null> {
    return User.findOne({ login });
  }

  async findUserByCode(code: number): Promise<IUser | null> {
    return User.findOne({ inviteCode: code });
  }

  async addFriend(
    _id: Types.ObjectId,
    friend_id: Types.ObjectId,
  ): Promise<SuccessRdo> {
    await Promise.all([
      User.updateOne({ _id }, { $addToSet: { friends: friend_id } }),
      User.updateOne({ _id: friend_id }, { $addToSet: { friends: _id } }),
    ]);

    return { success: true };
  }

  async fetchUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async changePassword(
    _id: Types.ObjectId,
    refreshToken: string,
    password: string,
    currentPassword: string,
  ): Promise<SuccessRdo> {
    const session = await sessionService.verifySession(refreshToken);

    if (!session) throw HttpError.Unauthorized();

    const user = await this.fetchUserById(_id);

    if (!user) throw HttpError.Unauthorized();

    const isPasswordCompare = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordCompare) throw HttpError.BadRequest("errors.password.wrong");

    if (password === currentPassword)
      throw HttpError.BadRequest("errors.password.same");

    const passwordSalt = await bcrypt.genSalt(10, "a");
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    await Promise.all([
      await sessionService.deleteAllSessions(user._id, session.token),
      await User.updateOne({ _id: user._id }, { password: passwordHash }),
    ]);

    return { success: true };
  }

  async updateUser(
    _id: Types.ObjectId,
    data: UpdateUserDto,
  ): Promise<SuccessRdo> {
    if (data.login) {
      const hasAlreadyChangedToday = await redis.get(`change-login:${_id}`);
      if (hasAlreadyChangedToday)
        throw HttpError.BadRequest("errors.login.already_changed");

      const usersWithSameLogin = await User.countDocuments({
        login: data.login,
      });
      if (usersWithSameLogin > 0)
        throw HttpError.BadRequest("errors.login.already_exists");

      await redis.set(
        `change-login:${_id}`,
        "true",
        "EX",
        config.change_login_limit_seconds,
      );
    }

    const { modifiedCount } = await User.updateOne({ _id }, data);

    return { success: modifiedCount === 1 };
  }

  async deleteAccount(_id: Types.ObjectId): Promise<SuccessRdo> {
    await this.deleteAvatar(_id);
    const { deletedCount } = await User.deleteOne({ _id }, {});

    return { success: deletedCount === 1 };
  }

  private async deleteUserAvatar(
    _id: Types.ObjectId,
    avatarPath: string,
  ): Promise<SuccessRdo> {
    try {
      await storageService
        .deleteFile(avatarPath)
        .catch((e) => console.error("Cannot delete user avatar file", e));

      await User.updateOne({ _id }, { avatar: null });

      return { success: true };
    } catch (e) {
      console.error("Cannot delete user avatar file", e);
      return { success: false, message: "Cannot delete user avatar file" };
    }
  }
}

export default new UserService();
