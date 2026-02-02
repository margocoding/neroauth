import dotenv from "dotenv";

dotenv.config();

const config = {
  port: +(process.env.PORT || 3000),
  mongo_url: process.env.MONGO_URL || "mongodb://localhost:27017",
  jwt_secret: process.env.JWT_SECRET || "Secret",
  invitation_expire_limit: 7 * 24 * 60 * 60 * 1000,
  auth_code_resend_limit: 1 * 60 * 1000,
  auth_code_expire_limit: 15 * 60 * 1000,
  smtp_email: process.env.SMTP_EMAIL,
  smtp_host: process.env.SMTP_HOST,
  smtp_password: process.env.SMTP_PASSWORD,
  redis_host: process.env.REDIS_HOST || "localhost",
  redis_port: +(process.env.REDIS_PORT || 6379),
  node_env: process.env.NODE_ENV || "development",
};

export default config;
