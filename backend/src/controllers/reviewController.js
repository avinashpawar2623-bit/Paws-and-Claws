const Product = require("../models/Product");
const Review = require("../models/Review");

const syncProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: "$productId",
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  const rating = stats.length ? Number(stats[0].avgRating.toFixed(2)) : 0;
  await Product.findByIdAndUpdate(productId, { rating });
};

const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    return res
      .status(400)
      .json({ success: false, message: "Rating must be between 1 and 5." });
  }

  const review = await Review.create({
    productId,
    userId: req.user._id,
    rating: numericRating,
    comment: comment || "",
  });

  await syncProductRating(product._id);

  return res.status(201).json({ success: true, message: "Review added.", review });
};

const getProductReviews = async (req, res) => {
  const reviews = await Review.find({ productId: req.params.id })
    .populate("userId", "name email role")
    .sort({ createdAt: -1 });

  return res.status(200).json({ success: true, reviews });
};

const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found." });
  }

  const isOwner = review.userId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden." });
  }

  const productId = review.productId;
  await review.deleteOne();
  await syncProductRating(productId);

  return res.status(200).json({ success: true, message: "Review deleted." });
};

module.exports = { createReview, getProductReviews, deleteReview };
