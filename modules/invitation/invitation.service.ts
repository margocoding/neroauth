import type { Types } from "mongoose";
import Invitation from "./invitation.model.js";
import userService from "../user/user.service.js";
import HttpError from "../../utils/exceptions/HttpError.js";
import mailService from "../mail/mail.service.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import type { IUser } from "../user/user.model.js";
import config from "../../config/config.js";
import { InvitationType } from "./dto/fetch-invitations.dto.js";
import { InvitationRdo } from "./rdo/invitation.rdo.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import i18n, { Locale } from "../../config/i18n.js";
import { PaginationRdo } from "../../utils/rdo/pagination.rdo.js";

class InvitationService {
  async createInvitation(
    from: Types.ObjectId,
    code: number,
    locale: Locale,
  ): Promise<SuccessRdo> {
    const candidate = await userService.findUserByCode(code);
    const fromUser = await userService.fetchUserById(from);

    if (!candidate) {
      throw HttpError.NotFound("errors.invitation.user_not_found");
    }

    if (String(candidate._id) === String(from))
      throw HttpError.BadRequest("errors.invitation.self");

    if (candidate.friends.find((friend) => String(friend) === String(from))) {
      throw HttpError.BadRequest("errors.invitation.already_friend");
    }

    const invitationFromInitiator = await Invitation.findOne({
      from,
      to: candidate._id,
    });

    if (invitationFromInitiator)
      throw HttpError.BadRequest("errors.invitation.already_invited");

    const invitationFromCandidate = await Invitation.findOne({
      to: from,
      from: candidate._id
    });

    if (invitationFromCandidate) {
      return this.processApplyingInvitation(
        candidate._id,
        from,
        candidate.email,
        candidate.login,
        candidate.avatar,
        locale,
      );
    }

    const htmlFile = readFileSync(
      path.join(
        process.cwd(),
        "modules",
        "invitation",
        "mails",
        "new-invitation.html",
      ),
    ).toString("utf-8");

    const html = htmlFile
      .replace(
        "{banner}",
        config.api_url + "/" + i18n[locale].newInvitation.banner,
      )
      .replace("{description}", i18n[locale].newInvitation.description)
      .replace("{subdescription}", i18n[locale].newInvitation.subdescription)
      .replace("{button}", i18n[locale].newInvitation.button)
      .replace("{avatar_url}", config.api_url + "/" + fromUser.avatar)
      .replace("{web_app_url}", config.web_app_url)
      .replace("{username}", fromUser.login);

    await Promise.all([
      Invitation.create({ from, to: candidate._id }),
      mailService.sendMail(candidate.email, i18n[locale].newInvitation.title, {
        html,
      }),
    ]);

    return { success: true };
  }

  async applyInvitation(
    invitation_id: Types.ObjectId,
    locale: Locale,
  ): Promise<SuccessRdo> {
    const invitation = await Invitation.findOne({
      _id: invitation_id,
    })
      .populate("to", "email login _id")
      .populate("from", "_id");

    if (!invitation) throw HttpError.NotFound("Invitation not found");


    return this.processApplyingInvitation(
      invitation.from._id,
      invitation.to._id,
      (invitation.from as IUser).email,
      (invitation.from as IUser).login,
      (invitation.from as IUser).avatar,
      locale,
    );
  }

  async dismissInvitation(invitation_id: Types.ObjectId): Promise<SuccessRdo> {
    const invitation = await Invitation.findOne({
      _id: invitation_id,
    })
      .populate("to", "email login _id")
      .populate("from", "_id");

    if (!invitation) throw HttpError.NotFound("Invitation not found");


    await Invitation.deleteOne({
      from: invitation.from._id,
      to: invitation.to._id,
    });
    return { success: true, message: "Invitation is successfully deleted" };
  }

  async fetchInvintations(
    userId: Types.ObjectId,
    type: InvitationType = InvitationType.INCOMING,
    page: number = 1,
    pageSize: number = 15,
  ): Promise<PaginationRdo<InvitationRdo>> {
    const where =
      type === InvitationType.INCOMING ? { to: userId } : { from: userId };
    const [invintations, total] = await Promise.all([
      Invitation.find({
        ...where,
      })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate(
          type === InvitationType.INCOMING ? "from" : "to",
          "_id login avatar",
        ),
      Invitation.countDocuments({ ...where }),
    ]);

    return new PaginationRdo<InvitationRdo>(
      total,
      invintations.map((invitation) => new InvitationRdo(invitation)),
    );
  }

  async processApplyingInvitation(
    from: Types.ObjectId,
    to: Types.ObjectId,
    candidateEmail: string,
    candidateLogin: string,
    candidateAvatar: string = "/uploads/assets/default-avatar.svg",
    locale: Locale,
  ): Promise<SuccessRdo> {
    const htmlFile = readFileSync(
      path.join(
        process.cwd(),
        "modules",
        "invitation",
        "mails",
        "apply-invitation.html",
      ),
    ).toString("utf-8");

    const html = htmlFile
      .replace(
        "{banner}",
        config.api_url + "/" + i18n[locale].applyInvitation.banner,
      )
      .replace("{description}", i18n[locale].applyInvitation.description)
      .replace("{subdescription}", i18n[locale].applyInvitation.subdescription)
      .replace("{button}", i18n[locale].applyInvitation.button)
      .replace("{avatar_url}", config.api_url + "/" + candidateAvatar)
      .replace("{web_app_url}", config.web_app_url);

    await Promise.allSettled([
      userService.addFriend(from, to),
      mailService.sendMail(candidateEmail, i18n[locale].applyInvitation.title, {
        html,
      }),
      Invitation.deleteOne({ from, to }),
    ]);

    return { success: true, message: "Friend is successfully added" };
  }
}

export default new InvitationService();
