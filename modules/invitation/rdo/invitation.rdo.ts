import { Expose } from "class-transformer";
import type { Types } from "mongoose";
import type { IUser } from "../../user/user.model.js";
import { UserRdo } from "../../user/rdo/user.rdo.js";
import type { IInvitation } from "../invitation.model.js";

export class InvitationRdo {
  public _id!: Types.ObjectId;
  public from!: Types.ObjectId | UserRdo;
  public to!: Types.ObjectId | UserRdo;
  public createdAt!: Date;

  constructor(invitation: IInvitation) {
    this._id = invitation._id;
    this.from = invitation.from?._id
      ? new UserRdo(invitation.from as IUser)
      : invitation.from;
    this.to = invitation.to?._id
      ? new UserRdo(invitation.to as IUser)
      : invitation.to;
    this.createdAt = invitation.createdAt;
  }
}
