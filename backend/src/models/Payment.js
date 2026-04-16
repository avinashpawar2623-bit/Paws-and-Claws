const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["stripe", "razorpay", "wallet", "cod"],
      required: true,
    },
    providerPaymentId: { type: String, default: "", index: true },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "usd" },
    status: {
      type: String,
      enum: ["created", "requires_action", "succeeded", "failed", "cancelled", "refunded"],
      default: "created",
      index: true,
    },
    receiptUrl: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
