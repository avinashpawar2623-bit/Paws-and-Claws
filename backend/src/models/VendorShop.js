const mongoose = require("mongoose");

const vendorShopSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    shopName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    accentColor: { type: String, default: "#6b7280" },
    tier: {
      type: String,
      enum: ["silver", "gold", "platinum"],
      default: "silver",
      index: true,
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorShop", vendorShopSchema);
