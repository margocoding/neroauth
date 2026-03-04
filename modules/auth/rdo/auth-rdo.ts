import {UserRdo} from "../../user/rdo/user.rdo.js";
import type {IUser} from "../../user/user.model.js";

export class AuthRdo {
    user: UserRdo;
    accessToken: string;
    refreshToken: string

    constructor(user: IUser, accessToken: string, refreshToken: string) {
        this.user = new UserRdo(user);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}