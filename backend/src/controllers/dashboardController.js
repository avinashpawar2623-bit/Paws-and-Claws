const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const getAdminDashboard = async (_req, res) => {
  const [userCount, productCount, orderCount, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ["paid", "pending"] } } },
      { $group: { _id: null, revenue: { $sum: "$totalPrice" } } },
    ]),
  ]);

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);

  return res.status(200).json({
    success: true,
    analytics: {
      userCount,
      productCount,
      orderCount,
      totalRevenue: revenueAgg[0]?.revenue || 0,
    },
    recentOrders,
  });
};

const getVendorDashboard = async (req, res) => {
  const products = await Product.find({ vendor: req.user._id }).select("_id stock name");
  const productIds = products.map((p) => p._id);

  const matchingOrders = await Order.find({ "items.productId": { $in: productIds } });

  let totalUnitsSold = 0;
  let estimatedRevenue = 0;
  for (const order of matchingOrders) {
    for (const item of order.items) {
      if (productIds.some((id) => id.toString() === item.productId.toString())) {
        totalUnitsSold += item.quantity;
        estimatedRevenue += item.quantity * item.price;
      }
    }
  }

  return res.status(200).json({
    success: true,
    analytics: {
      productCount: products.length,
      totalUnitsSold,
      estimatedRevenue,
      lowStockProducts: products.filter((p) => p.stock <= 5),
    },
  });
};

module.exports = { getAdminDashboard, getVendorDashboard };
