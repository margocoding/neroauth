import { model, Schema, Types } from "mongoose";
import { User, type IUser } from "../user/user.model.js";

export interface IInvitation {
  _id: Types.ObjectId;
  from: Types.ObjectId | IUser;
  to: Types.ObjectId | IUser;
  createdAt: Date;
}

const invitationSchema = new Schema<IInvitation>({
  from: { type: Types.ObjectId, ref: User, required: true },
  to: { type: Types.ObjectId, ref: User, required: true },
  createdAt: { type: Date, default: new Date() },
});

const Invitation = model("Invatation", invitationSchema);

export default Invitation;
