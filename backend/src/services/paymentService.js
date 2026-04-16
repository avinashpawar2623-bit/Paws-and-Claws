const crypto = require("crypto");

const env = require("../config/env");
const AuditLog = require("../models/AuditLog");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const User = require("../models/User");
const WalletTransaction = require("../models/WalletTransaction");
const Invoice = require("../models/Invoice");

const createIdempotencyKey = () => crypto.randomUUID();

const createGatewayPayment = async ({ provider, amount, currency, orderId }) => {
  // In production this should call Stripe/Razorpay SDK.
  // Fallback keeps local development functional without storing card data.
  const providerPaymentId = `${provider}_${crypto.randomBytes(8).toString("hex")}`;
  const requiresAction = provider === "stripe" && !env.stripeSecretKey;
  return {
    providerPaymentId,
    status: requiresAction ? "requires_action" : "succeeded",
    receiptUrl: requiresAction ? "" : `/api/payments/receipt/${providerPaymentId}`,
    metadata: { orderId: orderId.toString(), simulated: !env.stripeSecretKey },
  };
};

const generateInvoiceNumber = () => {
  const rand = crypto.randomBytes(4).toString("hex");
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `INV-${yyyy}${mm}${dd}-${rand}`.toUpperCase();
};

const creditWallet = async ({ userId, amount, reason, referenceId, note }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  user.walletBalance += amount;
  await user.save();

  await WalletTransaction.create({
    userId,
    type: "credit",
    reason,
    amount,
    balanceAfter: user.walletBalance,
    referenceId: referenceId || "",
    note: note || "",
  });

  return user.walletBalance;
};

const awardLoyaltyPoints = async ({ userId, orderTotal }) => {
  const user = await User.findById(userId);
  if (!user) return 0;

  const points = Math.max(Math.floor(Number(orderTotal || 0)), 0);
  user.loyaltyPoints += points;
  await user.save();
  return points;
};

const debitWallet = async ({ userId, amount, reason, referenceId, note }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  if (user.walletBalance < amount) {
    const error = new Error("Insufficient wallet balance.");
    error.statusCode = 400;
    throw error;
  }

  user.walletBalance -= amount;
  await user.save();

  await WalletTransaction.create({
    userId,
    type: "debit",
    reason,
    amount,
    balanceAfter: user.walletBalance,
    referenceId: referenceId || "",
    note: note || "",
  });

  return user.walletBalance;
};

const processOrderPayment = async ({
  userId,
  orderId,
  provider,
  idempotencyKey,
  currency = "usd",
}) => {
  const existingPayment = await Payment.findOne({ idempotencyKey });
  if (existingPayment) {
    if (existingPayment.status === "succeeded") {
      const existingInvoice = await Invoice.findOne({ paymentId: existingPayment._id });
      if (!existingInvoice) {
        const order = await Order.findById(orderId);
        if (order) {
          await Invoice.create({
            invoiceNumber: generateInvoiceNumber(),
            paymentId: existingPayment._id,
            orderId: order._id,
            userId,
            provider: existingPayment.provider,
            currency: existingPayment.currency || currency,
            amount: existingPayment.amount,
            status: "issued",
            receiptUrl: existingPayment.receiptUrl,
            shippingAddress: order.shippingAddress || "",
            lineItems: (order.items || []).map((i) => ({
              name: i.name,
              quantity: i.quantity,
              price: i.price,
            })),
          });
        }
      }
    }
    return existingPayment;
  }

  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found.");
    error.statusCode = 404;
    throw error;
  }
  if (order.userId.toString() !== userId.toString()) {
    const error = new Error("Forbidden.");
    error.statusCode = 403;
    throw error;
  }

  let gatewayResult = {
    providerPaymentId: "",
    status: provider === "cod" ? "created" : "succeeded",
    receiptUrl: "",
    metadata: {},
  };

  if (provider === "wallet") {
    await debitWallet({
      userId,
      amount: order.totalPrice,
      reason: "order_payment",
      referenceId: order._id.toString(),
      note: "Paid from store wallet",
    });
  } else if (provider !== "cod") {
    gatewayResult = await createGatewayPayment({
      provider,
      amount: order.totalPrice,
      currency,
      orderId: order._id,
    });
  }

  const payment = await Payment.create({
    orderId: order._id,
    userId,
    provider,
    providerPaymentId: gatewayResult.providerPaymentId,
    idempotencyKey,
    amount: order.totalPrice,
    currency,
    status: gatewayResult.status,
    receiptUrl: gatewayResult.receiptUrl,
    metadata: gatewayResult.metadata,
  });

  if (payment.status === "succeeded") {
    const wasAlreadyPaid = order.paymentStatus === "paid";
    order.paymentStatus = "paid";
    await order.save();
    if (!wasAlreadyPaid) {
      await awardLoyaltyPoints({ userId, orderTotal: order.totalPrice });
    }
  }

  await AuditLog.create({
    actorId: userId,
    action: "payment.created",
    entityType: "Payment",
    entityId: payment._id.toString(),
    details: { provider, orderId: order._id.toString(), status: payment.status },
  });

  if (payment.status === "succeeded") {
    await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      paymentId: payment._id,
      orderId: order._id,
      userId,
      provider,
      currency: payment.currency || currency,
      amount: payment.amount,
      status: "issued",
      receiptUrl: payment.receiptUrl,
      shippingAddress: order.shippingAddress || "",
      lineItems: (order.items || []).map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    });
  }

  return payment;
};

module.exports = {
  createIdempotencyKey,
  processOrderPayment,
  creditWallet,
  awardLoyaltyPoints,
};
