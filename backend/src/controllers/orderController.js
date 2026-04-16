const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  const { shippingAddress, paymentStatus, paymentMethod } = req.body;
  const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty." });
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.productId._id);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${item.productId?.name || "item"}.`,
      });
    }
  }

  const orderItems = cart.items.map((item) => ({
    productId: item.productId._id,
    name: item.productId.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const order = await Order.create({
    userId: req.user._id,
    items: orderItems,
    totalPrice: cart.totalPrice,
    shippingAddress: shippingAddress || "",
    paymentStatus: paymentStatus || "pending",
    paymentMethod: paymentMethod || "cod",
    status: "pending",
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.productId._id, {
      $inc: { stock: -item.quantity },
    });
  }

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  return res.status(201).json({ success: true, message: "Order created.", order });
};

const getOrders = async (req, res) => {
  const query = req.user.role === "admin" ? {} : { userId: req.user._id };
  const orders = await Order.find(query).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, orders });
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  const isOwner = order.userId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden." });
  }

  return res.status(200).json({ success: true, order });
};

const updateOrderStatus = async (req, res) => {
  const { status, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();
  return res.status(200).json({ success: true, message: "Order updated.", order });
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
