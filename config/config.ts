import dotenv from "dotenv";

dotenv.config();

const config = {
  port: +(process.env.PORT || 3000),
  mongo_url: process.env.MONGO_URL || "mongodb://localhost:27017",
  jwt_secret: process.env.JWT_SECRET || "Secret",
  reset_password_jwt_secret: process.env.RESET_PASSWORD_JWT_SECRET || 'Secret',
  invitation_expire_limit: 7 * 24 * 60 * 60 * 1000,
  auth_code_resend_limit: 1 * 60 * 1000,
  auth_code_expire_limit: 15 * 60 * 1000,
  reset_password_resend_limit: 5 * 60 * 1000,
  reset_password_expire_limit: 20 * 60 * 1000,
  posts_cache_lifetime: 1 * 60 * 60,
  smtp_email: process.env.SMTP_EMAIL,
  smtp_host: process.env.SMTP_HOST,
  smtp_password: process.env.SMTP_PASSWORD,
  redis_host: process.env.REDIS_HOST || "localhost",
  redis_port: +(process.env.REDIS_PORT || 6379),
  node_env: process.env.NODE_ENV || "development",
  tg_api_id: +(process.env.TG_API_ID || 0),
  tg_api_hash: process.env.TG_API_HASH,
  tg_session: process.env.TG_SESSION,
  tg_phone: process.env.TG_PHONE,
  image_ttl: 60 * 60,
  defaultPhotoHeight: 800,
  defaultPhotoWidth: 800,
  allowedExtensions: {
    downloads: [".apk"],
    videos: [".mp4"],
    images: [".png", ".jpg", ".jpeg", ".gif", ".svg"],
  },

  allowedLocales: ["en", "ru"],

  maxFileSize: {
    downloads: 1000 * 1024 * 1024,
    videos: 100 * 1024 * 1024,
    images: 10 * 1024 * 1024,
  },

  maxTgRequestPostCount: 50,
  maxPostsViewCount: 21,

  rateLimit: {
    enabled: true,
    windowMs: 60 * 1000,
    maxRequests: 200,
  },
  securityHeaders: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
};

export default config;
