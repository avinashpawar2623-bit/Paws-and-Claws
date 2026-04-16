const Subscription = require("../models/Subscription");
const AuditLog = require("../models/AuditLog");

const PLAN_DAYS = {
  vendor_premium: 30,
  customer_loyalty_plus: 30,
};

const createSubscription = async (req, res) => {
  const { plan } = req.body;
  if (!PLAN_DAYS[plan]) {
    return res.status(400).json({ success: false, message: "Invalid plan selected." });
  }

  const renewsAt = new Date(Date.now() + PLAN_DAYS[plan] * 24 * 60 * 60 * 1000);
  const subscription = await Subscription.create({
    userId: req.user._id,
    plan,
    renewsAt,
    status: "active",
  });

  await AuditLog.create({
    actorId: req.user._id,
    action: "subscription.created",
    entityType: "Subscription",
    entityId: subscription._id.toString(),
    details: { plan },
  });

  return res.status(201).json({ success: true, subscription });
};

const getSubscriptions = async (req, res) => {
  const query = req.user.role === "admin" ? {} : { userId: req.user._id };
  const subscriptions = await Subscription.find(query).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, subscriptions });
};

const cancelSubscription = async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);
  if (!subscription) {
    return res.status(404).json({ success: false, message: "Subscription not found." });
  }
  const isOwner = subscription.userId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden." });
  }
  subscription.status = "cancelled";
  subscription.cancelledAt = new Date();
  await subscription.save();

  await AuditLog.create({
    actorId: req.user._id,
    action: "subscription.cancelled",
    entityType: "Subscription",
    entityId: subscription._id.toString(),
    details: {},
  });

  return res.status(200).json({ success: true, message: "Subscription cancelled.", subscription });
};

module.exports = { createSubscription, getSubscriptions, cancelSubscription };
