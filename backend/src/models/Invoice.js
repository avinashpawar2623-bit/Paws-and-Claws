const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, default: "" },
    currency: { type: String, default: "usd" },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["issued", "voided", "refunded"], default: "issued", index: true },
    receiptUrl: { type: String, default: "" },
    lineItems: {
      type: [
        new mongoose.Schema(
          {
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    shippingAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);

