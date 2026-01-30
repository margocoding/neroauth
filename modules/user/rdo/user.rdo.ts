import type { Types } from "mongoose";
import type { IUser } from "../user.model.js";

export class UserRdo {
  _id!: Types.ObjectId;
  login!: string;
  email?: string;
  inviteCode?: number;
  friends!: Array<Types.ObjectId | IUser>;

  constructor(user: IUser) {
    ((this._id = user._id),
      (this.login = user.login),
      (this.email = user.email),
      (this.inviteCode = user.inviteCode),
      (this.friends = user.friends));
  }
}
