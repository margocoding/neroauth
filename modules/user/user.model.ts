import { model, Schema, Types } from "mongoose";
import { randomInt } from "node:crypto";

export interface IUser {
  _id: Types.ObjectId;
  login: string;
  password: string;
  email: string;
  avatar: string;
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
  avatar: { type: String, required: false },
  friends: { type: [Types.ObjectId], default: [], ref: "User" },
});

userSchema.pre("deleteOne", { document: true, query: false }, async (next) => {
  const user: IUser = this as unknown as IUser;

  if (!user) return;

  await Promise.all([
    model("Session").deleteMany({ user: user._id }),
    model("Invitation").deleteMany({
      $or: [{ from: user._id }, { to: user._id }],
    }),
    model("User").updateMany(
      { friends: user._id },
      { $pull: { friends: user._id } },
    ),
  ]);
});

export const User = model("User", userSchema);
