import type { Types } from "mongoose";
import HttpError from "../../utils/exceptions/HttpError.js";
import type { CreateUserDto } from "./dto/create-user.dto.js";
import { User, type IUser } from "./user.model.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";

class UserService {
  async createUser(dto: CreateUserDto): Promise<IUser> {
    const userWithSameData = await User.findOne({
      $or: [{ email: dto.email }, { login: dto.login }],
    });

    if (userWithSameData && userWithSameData.email === dto.email) {
      throw HttpError.BadRequest("User with this email is already existing");
    } else if (userWithSameData && userWithSameData.login === dto.login) {
        throw HttpError.BadRequest('User with this login is already existing');
    }

    const user = new User(dto);

    return await user.save();
  }

  async fetchFriends(_id: string): Promise<IUser[]> {
    const user = await User.findOne({_id}).populate('friends', '_id login');

    return user?.friends || [];
  }

  async fetchUserById(_id: Types.ObjectId): Promise<IUser> {
    const user = await User.findOne({_id});

    if(!user) {
        throw HttpError.NotFound('User not found');
    }

    return user;
  }

  async findUserByLogin(login: string): Promise<IUser | null> {
    return User.findOne({login});
  }

  async findUserByCode(code: number): Promise<IUser | null> {
    return User.findOne({code});
  }

  async addFriend(_id: Types.ObjectId, friend_id: Types.ObjectId): Promise<SuccessRdo> {
    await Promise.all([
      User.updateOne({_id}, {friends: {$addToSet: friend_id}}),
      User.updateOne({_id: friend_id}, {friends: {$addToSet: _id}})
    ])

    return {success: true}
  } 
}

export default new UserService();
