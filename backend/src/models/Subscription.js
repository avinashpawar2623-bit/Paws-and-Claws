const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["vendor_premium", "customer_loyalty_plus"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "trialing", "past_due", "cancelled"],
      default: "active",
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    renewsAt: { type: Date, required: true },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
