import type { Types } from "mongoose";
import type { ISession } from "../session.model.js";

export class SessionRdo {
  _id: Types.ObjectId;
  token: string;
  lastJoin: Date;
  location: string;
  device: string;
  createdAt: Date;

  constructor(session: ISession) {
    this._id = session._id;
    this.token = session.token;
    this.lastJoin = session.lastJoin;
    this.location = session.location;
    this.device = session.device;
    this.createdAt = session.createdAt;
  }
}
