const User = require("../models/User");
const Product = require("../models/Product");
const AuditLog = require("../models/AuditLog");

const getProfile = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

const updateProfile = async (req, res) => {
  const { name, phone, address, profileImage } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  user.name = name ?? user.name;
  user.phone = phone ?? user.phone;
  user.address = address ?? user.address;
  user.profileImage = profileImage ?? user.profileImage;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated.",
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      address: user.address,
      walletBalance: user.walletBalance,
      loyaltyPoints: user.loyaltyPoints,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};

const listUsers = async (_req, res) => {
  const users = await User.find().select("-password -refreshToken");
  return res.status(200).json({ success: true, users });
};

const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  await AuditLog.create({
    actorId: req.user?._id || null,
    action: "user.deleted",
    entityType: "User",
    entityId: user._id.toString(),
    details: { email: user.email },
  });

  return res.status(200).json({ success: true, message: "User deleted." });
};

const updateUserStatus = async (req, res) => {
  const { isSuspended, suspendedReason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  user.isSuspended = Boolean(isSuspended);
  user.suspendedReason = user.isSuspended ? suspendedReason || "" : "";
  await user.save();

  await AuditLog.create({
    actorId: req.user?._id || null,
    action: user.isSuspended ? "user.suspended" : "user.unsuspended",
    entityType: "User",
    entityId: user._id.toString(),
    details: { reason: user.suspendedReason, email: user.email },
  });

  return res.status(200).json({
    success: true,
    message: user.isSuspended ? "User suspended." : "User reactivated.",
    user,
  });
};

const listAuditLogs = async (_req, res) => {
  const logs = await AuditLog.find()
    .populate("actorId", "name email role")
    .sort({ createdAt: -1 })
    .limit(100);
  return res.status(200).json({ success: true, logs });
};

const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist.productId");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  const items = (user.wishlist || [])
    .filter((item) => item.productId)
    .map((item) => ({
      ...item.toObject(),
      priceDrop:
        typeof item.productId.price === "number" &&
        typeof item.priceWhenAdded === "number" &&
        item.productId.price < item.priceWhenAdded,
    }));

  return res.status(200).json({
    success: true,
    items,
    loyaltyPoints: user.loyaltyPoints || 0,
  });
};

const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const [user, product] = await Promise.all([
    User.findById(req.user._id),
    Product.findById(productId),
  ]);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const alreadyExists = user.wishlist.some(
    (item) => item.productId.toString() === productId.toString()
  );
  if (alreadyExists) {
    return res.status(200).json({ success: true, message: "Product already in wishlist." });
  }

  user.wishlist.push({
    productId: product._id,
    priceWhenAdded: product.price,
  });
  await user.save();

  return res.status(201).json({
    success: true,
    message: "Added to wishlist.",
    wishlistCount: user.wishlist.length,
  });
};

const removeFromWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  user.wishlist = user.wishlist.filter(
    (item) => item.productId.toString() !== req.params.productId.toString()
  );
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Removed from wishlist.",
    wishlistCount: user.wishlist.length,
  });
};

module.exports = {
  getProfile,
  updateProfile,
  listUsers,
  deleteUser,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateUserStatus,
  listAuditLogs,
};
