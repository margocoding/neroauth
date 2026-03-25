import config from "../../../config/config.js";
import { UserRdo } from "../../user/rdo/user.rdo.js";
import type { IUser } from "../../user/user.model.js";

export class AuthRdo {
    user: UserRdo;
    accessToken: { value: string; expiresIn: Date };

    refreshToken: { value: string; expiresIn: Date };

    constructor(user: IUser, accessToken: string, refreshToken: string) {
        this.user = new UserRdo(user);
        this.accessToken = { value: accessToken, expiresIn: new Date(Date.now() + (config.access_token_lifetime * 1000)) };
        this.refreshToken = { value: refreshToken, expiresIn: new Date(Date.now() + (config.refresh_token_lifetime * 1000)) };
    }
}