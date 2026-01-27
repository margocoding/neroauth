import mongoose from "mongoose";
import { app } from "./app.js";
import config from "./config/config.js";
import { Redis } from "ioredis";

app.listen(config.port, async () => {
  await mongoose.connect(config.mongo_url);
  console.log(`App is listening on port ${config.port}`);
});
