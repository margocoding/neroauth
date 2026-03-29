import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Redis } from "ioredis";
import { TelegramClient as Client } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import config from "./config/config.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { helpRouter } from "./modules/help/help.router.js";
import { invitationRouter } from "./modules/invitation/invitation.router.js";
import { postRouter } from "./modules/post/post.router.js";
import { sessionRouter } from "./modules/session/session.router.js";
import { userRouter } from "./modules/user/user.router.js";
import type { MulterError } from "multer";
import multer from "multer";
import HttpError from "./utils/exceptions/HttpError.js";

export const app = express();
app.set("trust proxy", true);

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
app.use(express.static(import.meta.dirname));
app.use(express.json());
app.use("/user", userRouter);
app.use((err: MulterError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(HttpError.BadRequest("profile.avatar.errors.file_too_large"));
    }
  }

  next(err);
});
app.use("/auth", authRouter);
app.use("/invitation", invitationRouter);
app.use("/posts", postRouter);
app.use("/help", helpRouter);
app.use("/session", sessionRouter);
app.use(errorMiddleware);
