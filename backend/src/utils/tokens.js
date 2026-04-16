const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateAccessToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    env.jwtSecret,
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.jwtRefreshSecret, {
    expiresIn: "7d",
  });

module.exports = { generateAccessToken, generateRefreshToken };
