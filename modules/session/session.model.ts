import {model, Schema, Types} from "mongoose";
import {type IUser} from "../user/user.model.js";

export enum DeviceType {
    CONSOLE = "console",
    DESKTOP = "desktop",
    EMBEDDED = "embedded",
    MOBILE = "mobile",
    SMART_TV = "smarttv",
    TABLET = "tablet",
    WEARABLE = "wearable",
    XR = "xr"
}

export interface Device {
    deviceType: DeviceType,
    device: string;
    browser: string;
    os: string;
}

export interface Location {
    country: string;
    city: string;
}

export interface ISession {
    _id: Types.ObjectId;
    user: Types.ObjectId | IUser;
    token: string;
    lastJoin: Date;
    createdAt: Date;
    location: Location;
    device: Device;
}

const sessionSchema = new Schema<ISession>({
    user: {type: Types.ObjectId, ref: 'User'},
    token: {type: String, unique: true},
    lastJoin: {type: Date, default: new Date()},
    createdAt: {type: Date, default: new Date()},
    device: {
        name: {type: String},
        deviceType: {type: String, enum: DeviceType},
        browser: {type: String},
        os: {type: String}
    },
    location: {country: {type: String}, city: {type: String}},
});

export const Session = model("Session", sessionSchema);
