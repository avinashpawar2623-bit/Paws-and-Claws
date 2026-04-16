const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const env = require("../config/env");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/tokens");

const sanitizeUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  phone: user.phone,
  role: user.role,
  profileImage: user.profileImage,
  address: user.address,
  walletBalance: user.walletBalance,
  loyaltyPoints: user.loyaltyPoints,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async (req, res) => {
  const { email, password, name, phone, role, address } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required.",
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    phone: phone || "",
    role: role || "customer",
    address: address || "",
  });

  return res.status(201).json({
    success: true,
    message: "Registration successful.",
    user: sanitizeUser(user),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials." });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials." });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    accessToken,
    refreshToken,
    user: sanitizeUser(user),
  });
};

const refreshToken = async (req, res) => {
  const token = req.body.refreshToken;
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Refresh token is required." });
  }

  try {
    const payload = jwt.verify(token, env.jwtRefreshSecret);
    const user = await User.findById(payload.sub);

    if (!user || user.refreshToken !== token) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token." });
    }

    const newAccessToken = generateAccessToken(user);
    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Refresh token expired or invalid." });
  }
};

const logout = async (req, res) => {
  const token = req.body.refreshToken;
  if (token) {
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = "";
      await user.save();
    }
  }

  return res.status(200).json({ success: true, message: "Logout successful." });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 15);
    await user.save();
  }

  return res.status(200).json({
    success: true,
    message:
      "If an account exists with this email, a password reset link will be sent.",
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
};
