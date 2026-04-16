const Cart = require("../models/Cart");
const Product = require("../models/Product");

const calculateTotalPrice = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const ensureCart = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart) {
    cart = await Cart.create({ userId, items: [], totalPrice: 0 });
    cart = await Cart.findById(cart._id).populate("items.productId");
  }
  return cart;
};

const getCart = async (req, res) => {
  const cart = await ensureCart(req.user._id);
  return res.status(200).json({ success: true, cart });
};

const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity || 1);

  if (!productId || qty < 1) {
    return res.status(400).json({
      success: false,
      message: "Valid productId and quantity are required.",
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const cart = await ensureCart(req.user._id);
  const existing = cart.items.find(
    (item) => item.productId && item.productId._id.toString() === productId
  );

  if (existing) {
    existing.quantity += qty;
    existing.price = product.price;
  } else {
    cart.items.push({ productId, quantity: qty, price: product.price });
  }

  cart.totalPrice = calculateTotalPrice(cart.items);
  await cart.save();
  await cart.populate("items.productId");

  return res.status(200).json({ success: true, message: "Item added.", cart });
};

const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty < 1) {
    return res
      .status(400)
      .json({ success: false, message: "Quantity must be at least 1." });
  }

  const cart = await ensureCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: "Cart item not found." });
  }

  item.quantity = qty;
  cart.totalPrice = calculateTotalPrice(cart.items);
  await cart.save();
  await cart.populate("items.productId");

  return res.status(200).json({ success: true, message: "Cart updated.", cart });
};

const removeCartItem = async (req, res) => {
  const cart = await ensureCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return res.status(404).json({ success: false, message: "Cart item not found." });
  }

  item.deleteOne();
  cart.totalPrice = calculateTotalPrice(cart.items);
  await cart.save();
  await cart.populate("items.productId");

  return res.status(200).json({ success: true, message: "Item removed.", cart });
};

const clearCart = async (req, res) => {
  const cart = await ensureCart(req.user._id);
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  return res.status(200).json({ success: true, message: "Cart cleared.", cart });
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
