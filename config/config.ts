import dotenv from "dotenv";

dotenv.config();

const config = {
  port: +(process.env.PORT || 3000),
  mongo_url: process.env.MONGO_URL || "mongodb://localhost:27017",
  jwt_secret: process.env.JWT_SECRET || "Secret",
  invitation_expires_at: 7 * 24 * 60 * 60 * 1000,
};

export default config;
