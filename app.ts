import express from "express";
import config from "./config/config.js";
import mongoose from "mongoose";
import { userRouter } from "./modules/user/user.router.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { invitationRouter } from "./modules/invitation/invitation.router.js";

export const app = express();

app.use(express.json());
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use('/invitation', invitationRouter)
app.use(errorMiddleware);
