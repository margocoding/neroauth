import express from "express";
import errorMiddleware from "./middlewares/error.middleware.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { invitationRouter } from "./modules/invitation/invitation.router.js";
import { userRouter } from "./modules/user/user.router.js";
import { Redis } from "ioredis";
import config from "./config/config.js";
import cors from "cors";
import { Api, TelegramClient as Client, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { postRouter } from "./modules/post/post.router.js";
import { helpRouter } from "./modules/help/help.router.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export const app = express();

export const redis = new Redis({
  host: config.redis_host,
  port: config.redis_port,
});

const session = new StringSession(config.tg_session);

export const client = new Client(
  session,
  +config.tg_api_id!,
  config.tg_api_hash!,
  {
    connectionRetries: 5,
  },
);

app.use(
  cors({
    origin: config.node_env === "development" ? true : "neroteam.org",
  }),
);
app.use(express.json());
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/invitation", invitationRouter);
app.use("/posts", postRouter);
app.use("/help", helpRouter);
app.use(errorMiddleware);
