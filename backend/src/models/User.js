const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "vendor", "customer"],
      default: "customer",
    },
    profileImage: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    refreshToken: {
      type: String,
      default: "",
    },
    passwordResetToken: {
      type: String,
      default: "",
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
