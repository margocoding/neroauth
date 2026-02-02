import { jest } from "@jest/globals";
import HttpError from "../../utils/exceptions/HttpError.js";
import type { CreateUserDto } from "./dto/create-user.dto.js";
import { User, type IUser } from "./user.model.js";
import userService from "./user.service.js";
import { Types } from "mongoose";

const mockedUser = {
  save: jest.spyOn(User.prototype, "save"),
  findOne: jest.spyOn(User, "findOne"),
};

describe("UserService", () => {
  const data: CreateUserDto = {
    email: "test@test.com",
    login: "testing",
    password: "testing",
  };
  describe("Create a user", () => {

    it("Should successfully create a user", async () => {
      mockedUser.findOne.mockResolvedValue(null);
      mockedUser.save.mockResolvedValue(data);

      const result = userService.createUser(data);

      await expect(result).resolves.toEqual(data);
      expect(mockedUser.findOne).toHaveBeenCalledWith({
        $or: [{ email: data.email }, { login: data.login }],
      });
      expect(mockedUser.save).toHaveBeenCalledTimes(1);
    });

    it("Should throw an error if user with email is already existing", async () => {
      mockedUser.findOne.mockResolvedValue({ email: data.email } as any);

      const result = userService.createUser(data);

      await expect(result).rejects.toThrow(
        HttpError.BadRequest("User with this email is already existing"),
      );
      expect(mockedUser.findOne).toHaveBeenCalledWith({
        $or: [{ email: data.email }, { login: data.login }],
      });
    });

    it("Should throw an error if user with login is already existing", async () => {
      mockedUser.findOne.mockResolvedValue({
        login: data.login,
      } as any);

      const result = userService.createUser(data);

      await expect(result).rejects.toThrow(
        HttpError.BadRequest("User with this login is already existing"),
      );
      expect(mockedUser.findOne).toHaveBeenCalledWith({
        $or: [{ email: data.email }, { login: data.login }],
      });
    });
  });

  describe("Fetch user by id", () => {
    it("Should successfully fetch a user", async () => {
      mockedUser.findOne.mockResolvedValue(data as any);
      const randomId = new Types.ObjectId();

      const result = userService.fetchUserById(randomId);

      await expect(result).resolves.toEqual(data);
      expect(mockedUser.findOne).toHaveBeenCalledWith({_id: randomId});
    });
  });
});
