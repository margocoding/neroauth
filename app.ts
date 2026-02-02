import express from "express";
import errorMiddleware from "./middlewares/error.middleware.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { invitationRouter } from "./modules/invitation/invitation.router.js";
import { userRouter } from "./modules/user/user.router.js";
import { Redis } from "ioredis";
import config from "./config/config.js";
import cors from "cors";

export const app = express();

export const redis = new Redis({
  host: config.redis_host,
  port: config.redis_port,
});
app.use(
  cors({
    origin: config.node_env === "development" ? "*" : "neroteam.org",
  }),
);
app.use(express.json());
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/invitation", invitationRouter);
app.use(errorMiddleware);
