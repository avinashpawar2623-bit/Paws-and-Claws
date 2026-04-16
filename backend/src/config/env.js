const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "replace_this_secret",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "replace_this_refresh_secret",
};

module.exports = env;
