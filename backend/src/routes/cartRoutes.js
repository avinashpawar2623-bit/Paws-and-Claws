const express = require("express");
const { body, param } = require("express-validator");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.use(protect);
router.get("/", getCart);
router.post(
  "/add",
  [
    body("productId").isMongoId().withMessage("Valid productId is required."),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be >= 1."),
    validateRequest,
  ],
  addToCart
);
router.put(
  "/update/:itemId",
  [
    param("itemId").isMongoId().withMessage("Invalid cart item id."),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be >= 1."),
    validateRequest,
  ],
  updateCartItem
);
router.delete("/:itemId", [param("itemId").isMongoId().withMessage("Invalid cart item id."), validateRequest], removeCartItem);
router.delete("/", clearCart);

module.exports = router;
