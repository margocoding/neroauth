import { jest } from "@jest/globals";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import config from "../../config/config.js";
import userService from "../user/user.service.js";
import authService from "./auth.service.js";
import HttpError from "../../utils/exceptions/HttpError.js";
import { randomInt } from "node:crypto";

const mockedBcrypt = {
  hash: jest.spyOn<typeof bcrypt, "hash", () => Promise<string>>(
    bcrypt,
    "hash",
  ),
  genSalt: jest.spyOn<typeof bcrypt, "genSalt", () => Promise<string>>(
    bcrypt,
    "genSalt",
  ),
  compare: jest.spyOn<typeof bcrypt, "compare", () => Promise<boolean>>(
    bcrypt,
    "compare",
  ),
};

const mockedUserService = {
  createUser: jest.spyOn(userService, "createUser"),
  findUserByLogin: jest.spyOn(userService, "findUserByLogin"),
};

const mockedAuthService = {
  generateToken: jest.spyOn<typeof authService, "generateToken", () => string>(
    authService,
    "generateToken",
  ),
};

describe("AuthService", () => {
  const generatedUserData = {
    _id: new Types.ObjectId(),
    login: "test-login",
    email: "test@test.org",
    code: randomInt(100000000),
    password: "some password",
    friends: []
  };
  const generatedJwt = "token";
  const generatedHash = "Generated hash";
  describe("Sign up", () => {
    it("Should successfully sign up and return user with token", async () => {
      const generatedSalt = "Generated salt";

      mockedBcrypt.genSalt.mockResolvedValue(generatedSalt);
      mockedBcrypt.hash.mockResolvedValue(generatedHash);

      mockedUserService.createUser.mockResolvedValue({
        ...generatedUserData,
        password: generatedHash,
      });
      mockedAuthService.generateToken.mockReturnValue(generatedJwt);

      const result = authService.register(generatedUserData);

      await expect(result).resolves.toEqual({
        user: { ...generatedUserData, password: generatedHash },
        token: generatedJwt,
      });
      expect(mockedBcrypt.genSalt).toHaveBeenCalledWith(10, "a");
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        generatedUserData.password,
        generatedSalt,
      );
      expect(mockedUserService.createUser).toHaveBeenCalledWith({
        ...generatedUserData,
        password: generatedHash,
      });
      expect(mockedAuthService.generateToken).toHaveBeenCalledWith(
        generatedUserData._id,
      );
    });
  });

  describe("Sign in", () => {
    it("Should successfully sign in and return user with token", async () => {
      mockedUserService.findUserByLogin.mockResolvedValue({
        ...generatedUserData,
        password: generatedHash,
      });

      mockedBcrypt.compare.mockResolvedValue(true);
      mockedAuthService.generateToken.mockReturnValue(generatedJwt);

      const result = authService.login(generatedUserData);

      await expect(result).resolves.toEqual({
        user: { ...generatedUserData, password: generatedHash },
        token: generatedJwt,
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        generatedUserData.password,
        generatedHash,
      );
      expect(mockedUserService.findUserByLogin).toHaveBeenCalledWith(
        generatedUserData.login,
      );
      expect(mockedAuthService.generateToken).toHaveBeenCalledWith(
        generatedUserData._id,
      );
    });

    it("Should throw an error if user not found", async () => {
      mockedUserService.findUserByLogin.mockResolvedValue(null);

      const result = authService.login(generatedUserData);

      await expect(result).rejects.toThrow(
        HttpError.Unauthorized("Wrong login or password"),
      );
      expect(mockedUserService.findUserByLogin).toHaveBeenCalledWith(
        generatedUserData.login,
      );
    });

    it("Should throw an error if password is wrong", async () => {
      mockedUserService.findUserByLogin.mockResolvedValue({
        ...generatedUserData,
        password: generatedHash,
      });
      mockedBcrypt.compare.mockResolvedValue(false);

      const result = authService.login(generatedUserData);

      await expect(result).rejects.toThrow(
        HttpError.Unauthorized("Wrong login or password"),
      );
      expect(mockedUserService.findUserByLogin).toHaveBeenCalledWith(
        generatedUserData.login,
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        generatedUserData.password,
        generatedHash,
      );
    });
  });
});
