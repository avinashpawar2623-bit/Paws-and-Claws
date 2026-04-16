const AuditLog = require("../models/AuditLog");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const WalletTransaction = require("../models/WalletTransaction");
const Invoice = require("../models/Invoice");
const { createIdempotencyKey, creditWallet, processOrderPayment } = require("../services/paymentService");
const { createNotification } = require("../services/notificationService");

const createPayment = async (req, res) => {
  const { orderId, provider, currency } = req.body;
  const idempotencyKey = req.headers["x-idempotency-key"] || createIdempotencyKey();
  const payment = await processOrderPayment({
    userId: req.user._id,
    orderId,
    provider,
    idempotencyKey,
    currency,
  });
  return res.status(201).json({ success: true, idempotencyKey, payment });
};

const getPaymentHistory = async (req, res) => {
  const query = req.user.role === "admin" ? {} : { userId: req.user._id };
  const payments = await Payment.find(query).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, payments });
};

const getPaymentByOrderId = async (req, res) => {
  const { orderId } = req.params;
  const payment = await Payment.findOne({ orderId }).sort({ createdAt: -1 });
  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found." });
  }
  const isOwner = payment.userId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden." });
  }
  const invoice = await Invoice.findOne({ paymentId: payment._id });
  return res.status(200).json({ success: true, payment, invoice });
};

const getReceiptByProviderPaymentId = async (req, res) => {
  const { providerPaymentId } = req.params;
  const payment = await Payment.findOne({ providerPaymentId });
  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found." });
  }
  const isOwner = payment.userId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden." });
  }
  const invoice = await Invoice.findOne({ paymentId: payment._id });
  return res.status(200).json({
    success: true,
    providerPaymentId,
    paymentStatus: payment.status,
    invoice: invoice || null,
  });
};

const handleWebhook = async (req, res) => {
  const { providerPaymentId, status } = req.body;
  const payment = await Payment.findOne({ providerPaymentId });
  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found." });
  }
  const changed = payment.status !== status;
  if (changed) {
    payment.status = status;
    await payment.save();
  }

  const order = await Order.findById(payment.orderId);
  if (order) {
    order.paymentStatus = status === "succeeded" ? "paid" : "failed";
    await order.save();

    if (changed) {
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${order.userId.toString()}`).emit("order.updated", {
          orderId: order._id.toString(),
          status: order.status,
          paymentStatus: order.paymentStatus,
        });
      }

      await createNotification({
        userId: order.userId,
        type: "payment_updated",
        title: "Payment updated",
        message: `Payment for order ${order._id.toString()} is now ${order.paymentStatus}.`,
        referenceType: "Order",
        referenceId: order._id.toString(),
        metadata: {
          paymentStatus: order.paymentStatus,
        },
      });
    }
  }

  if (changed) {
    await AuditLog.create({
      actorId: null,
      action: "payment.webhook.updated",
      entityType: "Payment",
      entityId: payment._id.toString(),
      details: { providerPaymentId, status },
    });
  }

  return res.status(200).json({ success: true, message: "Webhook processed." });
};

const requestRefund = async (req, res) => {
  const { paymentId, reason } = req.body;
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found." });
  }

  const isOwner = payment.userId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden." });
  }
  if (payment.status !== "succeeded") {
    return res.status(400).json({ success: false, message: "Refund allowed only for successful payments." });
  }

  payment.status = "refunded";
  await payment.save();
  await creditWallet({
    userId: payment.userId,
    amount: payment.amount,
    reason: "refund",
    referenceId: payment._id.toString(),
    note: reason || "Refund credited to wallet",
  });

  await AuditLog.create({
    actorId: req.user._id,
    action: "payment.refunded",
    entityType: "Payment",
    entityId: payment._id.toString(),
    details: { reason: reason || "" },
  });

  // Notify the user that payment status was effectively rolled back.
  const order = await Order.findById(payment.orderId);
  if (order) {
    order.paymentStatus = "failed";
    await order.save();
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${order.userId.toString()}`).emit("order.updated", {
        orderId: order._id.toString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
      });
    }

    await createNotification({
      userId: order.userId,
      type: "payment_updated",
      title: "Refund processed",
      message: `Refund for order ${order._id.toString()} was credited to your wallet.`,
      referenceType: "Order",
      referenceId: order._id.toString(),
      metadata: {
        paymentStatus: order.paymentStatus,
      },
    });
  }

  return res.status(200).json({ success: true, message: "Refund processed to wallet.", payment });
};

const cancelPayment = async (req, res) => {
  const { paymentId } = req.params;
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found." });
  }
  const isOwner = payment.userId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden." });
  }

  if (payment.status === "succeeded") {
    return res.status(400).json({ success: false, message: "Completed payments cannot be cancelled. Use refund instead." });
  }

  payment.status = "cancelled";
  await payment.save();

  await AuditLog.create({
    actorId: req.user._id,
    action: "payment.cancelled",
    entityType: "Payment",
    entityId: payment._id.toString(),
    details: { paymentId },
  });

  const order = await Order.findByIdAndUpdate(
    payment.orderId,
    { paymentStatus: "failed" },
    { new: true }
  );

  if (order) {
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${order.userId.toString()}`).emit("order.updated", {
        orderId: order._id.toString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
      });
    }

    await createNotification({
      userId: order.userId,
      type: "payment_updated",
      title: "Payment cancelled",
      message: `Payment for order ${order._id.toString()} was cancelled.`,
      referenceType: "Order",
      referenceId: order._id.toString(),
      metadata: {
        paymentStatus: order.paymentStatus,
      },
    });
  }

  return res.status(200).json({ success: true, message: "Payment cancelled.", payment });
};

const getWallet = async (req, res) => {
  const transactions = await WalletTransaction.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  return res.status(200).json({
    success: true,
    walletBalance: req.user.walletBalance || 0,
    transactions,
  });
};

const topUpWallet = async (req, res) => {
  const amount = Number(req.body.amount || 0);
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Top-up amount must be greater than zero." });
  }
  const balance = await creditWallet({
    userId: req.user._id,
    amount,
    reason: "topup",
    referenceId: "",
    note: "Manual wallet top-up",
  });
  return res.status(200).json({ success: true, message: "Wallet funded.", walletBalance: balance });
};

module.exports = {
  createPayment,
  getPaymentHistory,
  getPaymentByOrderId,
  getReceiptByProviderPaymentId,
  handleWebhook,
  requestRefund,
  cancelPayment,
  getWallet,
  topUpWallet,
};
