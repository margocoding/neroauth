import { model, Schema, Types } from "mongoose";
import { randomInt } from "node:crypto";

export interface IUser {
  _id: Types.ObjectId;
  login: string;
  password: string;
  email: string;
  inviteCode: number;
  friends: Array<IUser | Types.ObjectId>;
}

const userSchema = new Schema<IUser>({
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  inviteCode: {
    type: Number,
    required: true,
    unique: true,
    default: randomInt(10000000),
  },
  friends: { type: [Types.ObjectId], default: [], ref: "User" },
});

export const User = model("User", userSchema);
