import { app } from "../../app.js";
import request from "supertest";

describe("AuthController", () => {
  describe("Register", () => {
    it("Should return 400 status code if body is empty", async () => {
      const response = await request(app).post("/auth/register");

      expect(response.status).toBe(400);
    });
    it("Should return 400 status code if password is not strong", async () => {
      const response = await request(app).post("/auth/register").send({
        login: "something",
        email: "test@test.com",
        password: "12345678",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          path: "password",
          location: "body",
        }),
      );
    });
    it("Should return 400 status code if email is wrong", async () => {
      const response = await request(app).post("/auth/register").send({
        login: "something",
        email: "test",
        password: "gjsd134kfas9023",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          path: "email",
          location: "body",
        }),
      );
    });
  });

  describe("Login", () => {
    it("Should return 400 status code if request body is empty", async () => {
      const response = await request(app).post("/auth/login");

      expect(response.status).toBe(400);
    });

    it("Should throw an error if each of fields are not string", async () => {
      const response = await request(app).post("/auth/login").send({
        login: 123123.23,
        password: "soankn13209gasd",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          path: "login",
          location: "body",
        }),
      );
    });
  });
});
