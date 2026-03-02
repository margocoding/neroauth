import type { Types } from "mongoose";
import HttpError from "../../utils/exceptions/HttpError.js";
import type { CreateUserDto } from "./dto/create-user.dto.js";
import { type IUser, User } from "./user.model.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import { randomInt, randomUUID } from "node:crypto";
import { UserRdo } from "./rdo/user.rdo.js";
import type { Multer } from "multer";
import path from "node:path";
import storageService from "../storage/storage.service.js";
import config from "../../config/config.js";

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

        if(!user) throw HttpError.BadRequest('User not found');

        if(user.avatar) {
            await this.deleteUserAvatar(user._id, user.avatar);
        }

        const fileExtension = '.' + file.filename.split('.').at(-1)
        const avatarPath = await storageService.uploadFile(file.buffer, config.avatar_folder, randomUUID() + fileExtension);

        await User.updateOne({_id: user._id}, {avatar: avatarPath});

        return avatarPath;

    } catch (e) {
        console.error("Cannot upload an avatar", e);
        throw HttpError.BadRequest("Wrong file");
    }
}

async deleteUserAvatar(_id: Types.ObjectId, avatarPath: string): Promise<SuccessRdo> {
    try {
        const [folder, filename] = avatarPath.split(path.sep);

        if(!folder || !filename) throw HttpError.BadRequest('Avatar not found');
        
        await storageService.deleteFile(folder, filename).catch((e) => console.error('Cannot delete user avatar file', e));
        
        await User.updateOne({_id}, {avatar: null});

        return {success: true};
    } catch(e) {
        console.error('Cannot delete user avatar file', e);
        return {success: false, message: 'Cannot delete user avatar file'};
    } 
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
    pageSize: number = 15,
  ): Promise<UserRdo[]> {
    const user = await User.findOne({ _id })
      .populate("friends", "_id login inviteCode")
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (!user) throw HttpError.NotFound("User not found");

    return user?.friends.map((friend) => new UserRdo(friend as IUser));
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
}

export default new UserService();
