const Product = require("../models/Product");
const Order = require("../models/Order");
const cloudinary = require("../config/cloudinary");

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toCsvArray = (value) =>
  String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const getProducts = async (req, res) => {
  const page = Math.max(toNumber(req.query.page, 1), 1);
  const limit = Math.min(Math.max(toNumber(req.query.limit, 10), 1), 50);
  const skip = (page - 1) * limit;

  const filter = {};
  const categories = req.query.categories ? toCsvArray(req.query.categories) : [];
  if (categories.length > 0) filter.category = { $in: categories };
  else if (req.query.category) filter.category = req.query.category;

  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = toNumber(req.query.minPrice, 0);
    if (req.query.maxPrice)
      filter.price.$lte = toNumber(req.query.maxPrice, Number.MAX_SAFE_INTEGER);
  }
  if (req.query.minRating) {
    filter.rating = { $gte: toNumber(req.query.minRating, 0) };
  }
  if (req.query.inStock === "true") {
    filter.stock = { $gt: 0 };
  }

  const breed = req.query.breed ? toCsvArray(req.query.breed) : [];
  if (breed.length > 0) filter.breed = { $in: breed };

  const size = req.query.size ? toCsvArray(req.query.size) : [];
  if (size.length > 0) filter.size = { $in: size };

  const color = req.query.color ? toCsvArray(req.query.color) : [];
  if (color.length > 0) filter.color = { $in: color };

  const vaccinationStatus = req.query.vaccinationStatus
    ? toCsvArray(req.query.vaccinationStatus)
    : [];
  if (vaccinationStatus.length > 0) {
    filter.vaccinationStatus = { $in: vaccinationStatus };
  }

  const healthStatus = req.query.healthStatus
    ? toCsvArray(req.query.healthStatus)
    : [];
  if (healthStatus.length > 0) filter.healthStatus = { $in: healthStatus };

  if (req.query.minAge || req.query.maxAge) {
    filter.age = {};
    if (req.query.minAge) filter.age.$gte = toNumber(req.query.minAge, 0);
    if (req.query.maxAge) {
      filter.age.$lte = toNumber(req.query.maxAge, Number.MAX_SAFE_INTEGER);
    }
  }

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const allowedSortBy = new Set(["createdAt", "price", "rating", "name", "relevance"]);
  const sortBy = allowedSortBy.has(req.query.sortBy) ? req.query.sortBy : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  const sort =
    req.query.search && sortBy === "relevance"
      ? { score: { $meta: "textScore" } }
      : { [sortBy]: sortOrder };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("vendor", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

const getProductById = async (req, res) => {
  const item = await Product.findById(req.params.id).populate(
    "vendor",
    "name email role"
  );
  if (!item) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  return res.status(200).json({ success: true, item });
};

const getProductSuggestions = async (req, res) => {
  const q = String(req.query.q || req.query.search || "").trim();
  if (!q) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  const [textMatches, regexMatches] = await Promise.all([
    Product.find({ $text: { $search: q } }).limit(10).select("name"),
    Product.find({ name: { $regex: q, $options: "i" } }).limit(10).select("name"),
  ]);

  const names = [
    ...(textMatches || []).map((p) => p.name),
    ...(regexMatches || [])
      .map((p) => p.name)
      .filter((n) => !textMatches.some((t) => t.name === n)),
  ].slice(0, 10);

  return res.status(200).json({ success: true, suggestions: names });
};

const getTrendingProducts = async (req, res) => {
  const limit = Math.min(Math.max(toNumber(req.query.limit, 6), 1), 20);

  const trending = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $unwind: "$items" },
    { $match: { "items.productId": { $ne: null } } },
    {
      $group: {
        _id: "$items.productId",
        unitsSold: { $sum: "$items.quantity" },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { unitsSold: -1, ordersCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        product: "$product",
        unitsSold: 1,
        ordersCount: 1,
      },
    },
  ]);

  return res.status(200).json({ success: true, trending });
};

const createProduct = async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    stock,
    breed,
    age,
    size,
    color,
    vaccinationStatus,
    healthStatus,
  } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({
      success: false,
      message: "name, category, and price are required.",
    });
  }

  const item = await Product.create({
    name,
    description: description || "",
    category,
    price: toNumber(price, 0),
    stock: toNumber(stock, 0),
    vendor: req.user._id,
    breed: breed ?? "",
    age: age ?? null,
    size: size ?? "",
    color: color ?? "",
    vaccinationStatus: vaccinationStatus ?? "",
    healthStatus: healthStatus ?? "",
  });

  return res
    .status(201)
    .json({ success: true, message: "Product created.", item });
};

const updateProduct = async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const isOwner = item.vendor && item.vendor.toString() === req.user._id.toString();
  if (req.user.role !== "admin" && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own products.",
    });
  }

  const {
    name,
    description,
    category,
    price,
    stock,
    breed,
    age,
    size,
    color,
    vaccinationStatus,
    healthStatus,
  } = req.body;
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (category !== undefined) item.category = category;
  if (price !== undefined) item.price = toNumber(price, item.price);
  if (stock !== undefined) item.stock = toNumber(stock, item.stock);
  if (breed !== undefined) item.breed = breed;
  if (age !== undefined) item.age = age;
  if (size !== undefined) item.size = size;
  if (color !== undefined) item.color = color;
  if (vaccinationStatus !== undefined) item.vaccinationStatus = vaccinationStatus;
  if (healthStatus !== undefined) item.healthStatus = healthStatus;

  await item.save();

  return res.status(200).json({ success: true, message: "Product updated.", item });
};

const deleteProduct = async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const isOwner = item.vendor && item.vendor.toString() === req.user._id.toString();
  if (req.user.role !== "admin" && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own products.",
    });
  }

  if (item.cloudinaryUrl) {
    const parts = item.cloudinaryUrl.split("/");
    const filename = parts[parts.length - 1] || "";
    const publicId = filename.split(".")[0];
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (_error) {
        // Ignore cloudinary deletion failures to avoid blocking product deletion.
      }
    }
  }

  await item.deleteOne();
  return res.status(200).json({ success: true, message: "Product deleted." });
};

const uploadProductImage = async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const isOwner = item.vendor && item.vendor.toString() === req.user._id.toString();
  if (req.user.role !== "admin" && !isOwner) {
    return res.status(403).json({
      success: false,
      message: "You can only upload image for your own products.",
    });
  }

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Image file is required." });
  }

  const uploaded = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(req.file.buffer);
  });

  item.cloudinaryUrl = uploaded.secure_url;
  await item.save();

  return res.status(200).json({
    success: true,
    message: "Image uploaded.",
    cloudinaryUrl: item.cloudinaryUrl,
  });
};

module.exports = {
  getProducts,
  getProductById,
  getProductSuggestions,
  getTrendingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
