const express = require("express");
const { body, param } = require("express-validator");
const {
  getProducts,
  getProductById,
  getProductSuggestions,
  getTrendingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require("../controllers/productController");
const {
  createReview,
  getProductReviews,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const upload = require("../middleware/upload");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/", getProducts);
router.get("/suggestions", getProductSuggestions);
router.get("/trending", getTrendingProducts);
router.get("/:id", [param("id").isMongoId().withMessage("Invalid product id."), validateRequest], getProductById);
router.get("/:id/reviews", getProductReviews);
router.post(
  "/:id/reviews",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid product id."),
    body("rating").isFloat({ min: 1, max: 5 }).withMessage("Rating must be 1-5."),
    validateRequest,
  ],
  createReview
);
router.post(
  "/",
  protect,
  allowRoles("admin", "vendor"),
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("category").notEmpty().withMessage("Category is required."),
    body("price").isFloat({ min: 0 }).withMessage("Price must be >= 0."),
    validateRequest,
  ],
  createProduct
);
router.put("/:id", protect, allowRoles("admin", "vendor"), updateProduct);
router.delete("/:id", protect, allowRoles("admin", "vendor"), deleteProduct);
router.post(
  "/:id/image",
  protect,
  allowRoles("admin", "vendor"),
  upload.single("image"),
  uploadProductImage
);

module.exports = router;
