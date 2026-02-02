import type { Types } from "mongoose";
import Invitation, { type IInvitation } from "./invitation.model.js";
import userService from "../user/user.service.js";
import HttpError from "../../utils/exceptions/HttpError.js";
import mailService from "../mail/mail.service.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import type { IUser } from "../user/user.model.js";
import config from "../../config/config.js";
import { InvitationType } from "./dto/fetch-invitations.dto.js";
import { InvitationRdo } from "./rdo/invitation.rdo.js";

class InvitationService {
  async createInvitation(
    from: Types.ObjectId,
    code: number,
  ): Promise<SuccessRdo> {
    const candidate = await userService.findUserByCode(code);

    if (!candidate) {
      throw HttpError.NotFound("User with this code not found");
    }

    if (candidate.friends.find((friend) => friend === from)) {
      throw HttpError.BadRequest("You are already a friend");
    }

    const invitationFromInitiator = await Invitation.findOne({
      from,
      to: candidate._id,
    });

    if (invitationFromInitiator)
      throw HttpError.BadRequest("You have already had an invitation");

    const invitationFromCandidate = await Invitation.findOne({
      to: from,
      from: candidate._id,
      createdAt: {
        $lt: new Date(Date.now() - config.invitation_expire_limit),
      },
    });

    if (invitationFromCandidate) {
      return this.processApplyingInvitation(
        candidate._id,
        from,
        candidate.email,
        candidate.login,
      );
    }

    await Promise.all([
      Invitation.create({ from, to: candidate._id }),
      mailService.sendMail(
        candidate.email,
        `New friend invitation from ${candidate.login}`,
        `User ${candidate.login} wants to be your friend! Apply his invite in our website`,
      ),
    ]);

    return { success: true };
  }

  async applyInvitation(invitation_id: Types.ObjectId): Promise<SuccessRdo> {
    const invitation = await Invitation.findOne({
      _id: invitation_id,
    })
      .populate("to", "email login _id")
      .populate("from", "_id");

    if (!invitation) throw HttpError.NotFound("Invitation not found");

    if (
      Date.now() - new Date(invitation.createdAt).getTime() >
      config.invitation_expire_limit
    ) {
      await Invitation.deleteOne({ _id: invitation._id });
      throw HttpError.BadRequest("Invitation has expired");
    }
    return this.processApplyingInvitation(
      invitation.from._id,
      invitation.to._id,
      (invitation.to as IUser).email,
      (invitation.to as IUser).login,
    );
  }

  async fetchInvintations(
    userId: Types.ObjectId,
    type: InvitationType = InvitationType.INCOMING,
    page: number = 1,
    pageSize: number = 15,
  ): Promise<InvitationRdo[]> {
    const invintations = await Invitation.find({
      ...(type === InvitationType.INCOMING ? { to: userId } : { from: userId }),
    })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate(type === InvitationType.INCOMING ? "from" : "to", "_id login");

    return invintations.map((invitation) => new InvitationRdo(invitation));
  }

  async processApplyingInvitation(
    from: Types.ObjectId,
    to: Types.ObjectId,
    candidateEmail: string,
    candidateLogin: string,
  ): Promise<SuccessRdo> {
    await Promise.allSettled([
      userService.addFriend(from, to),
      mailService.sendMail(
        candidateEmail,
        "New friend",
        `${candidateLogin} has applied your invitation`,
      ),
      Invitation.deleteOne({ from, to }),
    ]);

    return { success: true, message: "Friend is successfully added" };
  }
}

export default new InvitationService();
