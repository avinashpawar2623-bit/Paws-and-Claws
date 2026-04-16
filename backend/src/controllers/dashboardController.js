const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const VendorShop = require("../models/VendorShop");

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

module.exports = { getAdminDashboard, getVendorDashboard };
