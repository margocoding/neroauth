import { Types } from "mongoose";
import { jest } from "@jest/globals";
import mailService from "../mail/mail.service.js";
import userService from "../user/user.service.js";
import Invitation from "./invitation.model.js";
import { randomInt } from "node:crypto";
import invitationService from "./invitation.service.js";
import HttpError from "../../utils/exceptions/HttpError.js";
import config from "../../config/config.js";

const mockedUserService = {
  findUserByCode: jest.spyOn(userService, "findUserByCode"),
  addFriend: jest.spyOn(userService, "addFriend"),
};

const mockedInvitation = {
  findOne: jest.spyOn(Invitation, "findOne"),
  create: jest.spyOn(Invitation, "create"),
  populate: jest.spyOn(Invitation.prototype, "populate"),
};

const mockedMailService = {
  sendMail: jest.spyOn(mailService, "sendMail"),
};

const mockedInvitationService = {
  processApplyingInvitation: jest.spyOn(
    invitationService,
    "processApplyingInvitation",
  ),
};

describe("InvitationService", () => {
  const generatedCandidate = {
    _id: new Types.ObjectId(),
    login: "test",
    email: "test@test.com",
    code: randomInt(10000000),
  };
  const generatedInitiator = {
    _id: new Types.ObjectId(),
  };
  describe("Create an invite", () => {
    it("Should successfully create an invitation", async () => {
      mockedUserService.findUserByCode.mockResolvedValue(
        generatedCandidate as any,
      );

      mockedInvitation.findOne.mockResolvedValue(null);

      mockedInvitation.create.mockResolvedValue({
        from: generatedInitiator._id,
        to: generatedCandidate._id,
      } as any);
      mockedMailService.sendMail.mockResolvedValue({ success: true });

      const result = await invitationService.createInvitation(
        generatedInitiator._id,
        generatedCandidate.code,
      );

      expect(result.success).toBeTruthy();
      expect(mockedUserService.findUserByCode).toHaveBeenCalledWith(
        generatedCandidate.code,
      );
      expect(mockedInvitation.findOne).toHaveBeenCalledWith({
        to: generatedInitiator._id,
        from: generatedCandidate._id,
        createdAt: {
          $lt: new Date(Date.now() - config.invitation_expires_at),
        },
      });
      expect(mockedInvitation.create).toHaveBeenCalledWith({
        from: generatedInitiator._id,
        to: generatedCandidate._id,
      });
      expect(mockedMailService.sendMail).toHaveBeenCalled();
    });

    it("Should add a friend if there is an invitation to the initiator from the candidate", async () => {
      mockedUserService.findUserByCode.mockResolvedValue(
        generatedCandidate as any,
      );
      mockedInvitation.findOne.mockResolvedValue({
        from: generatedCandidate._id,
        to: generatedInitiator._id,
      } as any);

      mockedUserService.addFriend.mockResolvedValue({ success: true });
      mockedMailService.sendMail.mockResolvedValue({ success: true });

      const result = await invitationService.createInvitation(
        generatedInitiator._id,
        generatedCandidate.code,
      );

      expect(result.success).toBeTruthy();
      expect(mockedUserService.findUserByCode).toHaveBeenCalledWith(
        generatedCandidate.code,
      );
      expect(mockedInvitation.findOne).toHaveBeenCalledWith({
        to: generatedInitiator._id,
        from: generatedCandidate._id,
        createdAt: {
          $lt: new Date(Date.now() - config.invitation_expires_at),
        },
      });
      expect(mockedUserService.addFriend).toHaveBeenCalledWith(
        generatedInitiator._id,
        generatedCandidate._id,
      );
      expect(mockedMailService.sendMail).toHaveBeenCalled();
    });

    it("Should throw an error if this code is not existing", async () => {
      mockedUserService.findUserByCode.mockResolvedValue(null);

      const result = invitationService.createInvitation(
        generatedInitiator._id,
        generatedCandidate.code,
      );

      expect(result).rejects.toThrow(
        HttpError.NotFound("User with this code not found"),
      );
      expect(mockedUserService.findUserByCode).toHaveBeenCalledWith(
        generatedCandidate.code,
      );
    });
  });

  describe("Apply an invitation", () => {
    it("Should successfully apply an invite", async () => {
      const _id = new Types.ObjectId();
      mockedInvitation.populate.mockResolvedValue({
        _id,
        from: generatedInitiator,
        to: generatedCandidate,
      } as any);
      mockedInvitation.findOne.mockResolvedValue({
        _id,
        from: generatedInitiator,
        to: generatedCandidate,
      } as any);

      mockedInvitationService.processApplyingInvitation.mockResolvedValue({
        success: true,
      });

      const result = await invitationService.applyInvitation(_id);

      expect(result.success).toBeTruthy();
      expect(mockedInvitation.findOne).toHaveBeenCalledWith({
        _id,
        createdAt: {
          $lt: new Date(Date.now() - config.invitation_expires_at),
        },
      });
      expect(
        mockedInvitationService.processApplyingInvitation,
      ).toHaveBeenCalledWith(
        generatedInitiator._id,
        generatedCandidate._id,
        generatedCandidate.email,
        generatedCandidate.login,
      );
    });
  });
});
