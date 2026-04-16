const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const VendorShop = require("../models/VendorShop");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const mongoose = require("mongoose");

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const getAdminDashboard = async (_req, res) => {
  const since24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [userCount, suspendedUserCount, productCount, orderCount, revenueAgg, recentAuditLogs, recentNotificationsCount, recentPaymentsCount] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isSuspended: true }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ["paid", "pending"] } } },
      { $group: { _id: null, revenue: { $sum: "$totalPrice" } } },
    ]),
    AuditLog.find().sort({ createdAt: -1 }).limit(10),
    Notification.countDocuments({ createdAt: { $gte: since24Hours } }),
    Payment.countDocuments({ createdAt: { $gte: since24Hours } }),
  ]);

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);
  const dbStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const memoryUsage = process.memoryUsage();

  return res.status(200).json({
    success: true,
    analytics: {
      userCount,
      suspendedUserCount,
      productCount,
      orderCount,
      totalRevenue: revenueAgg[0]?.revenue || 0,
    },
    systemHealth: {
      apiStatus: "operational",
      databaseStatus: dbStateMap[mongoose.connection.readyState] || "unknown",
      uptimeSeconds: Math.floor(process.uptime()),
      memoryRssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      memoryHeapUsedMb:
        Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      notificationsLast24h: recentNotificationsCount,
      paymentsLast24h: recentPaymentsCount,
      generatedAt: new Date().toISOString(),
    },
    recentOrders,
    recentAuditLogs,
  });
};

const getVendorDashboard = async (req, res) => {
  const products = await Product.find({ vendor: req.user._id }).select("_id stock name");
  const productIds = products.map((p) => p._id);
  const shop = await VendorShop.findOne({ vendorId: req.user._id });

  const matchingOrders = await Order.find({ "items.productId": { $in: productIds } });

  let totalUnitsSold = 0;
  let estimatedRevenue = 0;
  let paidOrdersCount = 0;
  for (const order of matchingOrders) {
    let matchedInOrder = false;
    for (const item of order.items) {
      if (productIds.some((id) => id.toString() === item.productId.toString())) {
        totalUnitsSold += item.quantity;
        estimatedRevenue += item.quantity * item.price;
        matchedInOrder = true;
      }
    }
    if (matchedInOrder && order.paymentStatus === "paid") {
      paidOrdersCount += 1;
    }
  }

  const averageOrderValue = paidOrdersCount > 0 ? estimatedRevenue / paidOrdersCount : 0;

  return res.status(200).json({
    success: true,
    analytics: {
      productCount: products.length,
      totalUnitsSold,
      paidOrdersCount,
      estimatedRevenue,
      averageOrderValue,
      lowStockProducts: products.filter((p) => p.stock <= 5),
      shopTier: shop?.tier || "silver",
      shopVerified: shop?.isVerified || false,
    },
    shop: shop || null,
  });
};

const exportOrdersCsv = async (_req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(250)
    .populate("userId", "name email");

  const header = [
    "orderId",
    "customerName",
    "customerEmail",
    "status",
    "paymentStatus",
    "paymentMethod",
    "totalPrice",
    "itemCount",
    "createdAt",
  ];

  const rows = orders.map((order) =>
    [
      order._id,
      order.userId?.name || "",
      order.userId?.email || "",
      order.status,
      order.paymentStatus,
      order.paymentMethod,
      Number(order.totalPrice || 0).toFixed(2),
      order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0,
      order.createdAt?.toISOString?.() || "",
    ]
      .map(escapeCsv)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="orders-report.csv"');

  return res.status(200).send(csv);
};

module.exports = { getAdminDashboard, getVendorDashboard, exportOrdersCsv };
