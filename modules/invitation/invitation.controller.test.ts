import request from "supertest";
import { app } from "../../app.js";
import { Types } from "mongoose";
import { randomInt } from "node:crypto";

describe("InvitationController", () => {
  describe("Create an invitation", () => {
    it("Should throw an error if code is not an integer", async () => {
      const response = await request(app).post("/invitation").send({
        code: "some",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          location: "body",
          path: "code",
        }),
      );
      expect(response.body.errors.length).toBe(1);
    });
  });
});
