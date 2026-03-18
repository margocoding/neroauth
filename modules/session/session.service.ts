import type { Types } from "mongoose";
import HttpError from "../../utils/exceptions/HttpError.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import { SessionRdo } from "./rdo/session.rdo.js";
import { type Device, DeviceType, type ISession, type Location, Session } from "./session.model.js";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

class SessionService {
    async createSession(
        token: string,
        accessToken: string,
        userId: Types.ObjectId,
        location: Location,
        device: Device,
    ): Promise<SessionRdo> {
        const session = new Session({
            token,
            accessToken,
            user: userId,
            location,
            device,
        });

        const savedSession = await session.save();

        return new SessionRdo(savedSession);
    }

    async verifySession(token: string): Promise<ISession | null> {
        const foundSession = await Session.findOne({ token });

  async verifySession(token: string): Promise<ISession> {
    const foundSession = await Session.findOne({ token });

        return Session.findByIdAndUpdate(
            foundSession._id,
            { lastJoin: new Date() },
            { returnDocument: 'after' }
        ).populate('user');
    }

    async verifySessionAction(accessToken: string): Promise<ISession> {
        const foundSession = await Session.findOne({ accessToken });

        if (!foundSession) throw HttpError.Unauthorized();

        return foundSession;
    }

    async updateSessionToken(_id: Types.ObjectId, token: string, accessToken: string): Promise<SuccessRdo> {
        const updateData = await Session.updateOne({ _id }, { token, accessToken, lastJoin: new Date() });

  async updateSessionToken(
    _id: Types.ObjectId,
    token: string,
  ): Promise<SuccessRdo> {
    const updateData = await Session.updateOne(
      { _id },
      { token, lastJoin: new Date() },
    );

        return { success: true };
    }

    async fetchSessions(userId: Types.ObjectId): Promise<SessionRdo[]> {
        const sessions = await Session.find({ user: userId });

  async fetchSessions(userId: Types.ObjectId): Promise<SessionRdo[]> {
    const sessions = await Session.find({ user: userId });

    async deleteSession(
        _id: Types.ObjectId,
        userId: Types.ObjectId,
    ): Promise<SuccessRdo> {
        const session = await Session.findOne({ _id, user: userId });

  async deleteSession(
    _id: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<SuccessRdo> {
    const session = await Session.findOne({ _id, user: userId });

        await session.deleteOne({ _id: session._id });

        return { success: true };
    }

    async deleteAllSessions(
        userId: Types.ObjectId,
        refreshToken: string,
    ): Promise<SuccessRdo> {
        const sessions = await Session.find({ user: userId });

        if (!sessions.find(({ token }) => token === refreshToken))
            throw HttpError.BadRequest("Wrong refresh token");

        const sessionsForDelete = sessions.filter(
            ({ token }) => token !== refreshToken,
        );

        await Session.deleteMany({
            _id: sessionsForDelete.map(({ _id }) => _id
            ),
        });

        return { success: true };
    }

    return { success: true };
  }

  getLocationByIp(ipAddress: string): Location {
    const lookup = geoip.lookup(ipAddress);

    return {
      country: lookup?.country || "Unknown country",
      city: lookup?.city || "Unknown city",
    };
  }

  getDeviceByUserAgent(userAgent: string): Device {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    console.log(result);

    return {
      browser: result.browser.name || ("Chrome" as string),
      os: result.os.name || ("iOS" as string),
      device: result.device.model || ("iPhone" as string),
      deviceType: (result.device.type as DeviceType) || DeviceType.MOBILE,
    };
  }
}

export default new SessionService();
