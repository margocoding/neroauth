import type { Request, Response } from "express";
import invitationService from "./invitation.service.js";
import type { SuccessRdo } from "../../utils/rdo/success.rdo.js";
import type { CreateInvitationDto } from "./dto/create-invitation.dto.js";
import HttpError from "../../utils/exceptions/HttpError.js";

class InvitationController {
  async createInvitation(
    req: Request,
    res: Response,
  ): Promise<Response<SuccessRdo>> {
    if (!req.user) throw HttpError.Unauthorized();

    const { code } = req.body as CreateInvitationDto;
    const result = await invitationService.createInvitation(req.user._id, code);

    return res.json(result);
  }
}

export default new InvitationController();
