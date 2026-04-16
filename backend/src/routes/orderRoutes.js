const express = require("express");
const { body, param } = require("express-validator");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.use(protect);
router.post(
  "/",
  [
    body("shippingAddress")
      .optional()
      .isString()
      .isLength({ max: 250 })
      .withMessage("Shipping address is too long."),
    body("paymentMethod")
      .optional()
      .isIn(["stripe", "razorpay", "wallet", "cod"])
      .withMessage("Invalid payment method."),
    validateRequest,
  ],
  createOrder
);
router.get("/", getOrders);
router.get("/:id", [param("id").isMongoId().withMessage("Invalid order id."), validateRequest], getOrderById);
router.put(
  "/:id/status",
  allowRoles("admin"),
  [
    param("id").isMongoId().withMessage("Invalid order id."),
    body("status").optional().isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
    body("paymentStatus").optional().isIn(["pending", "paid", "failed"]),
    validateRequest,
  ],
  updateOrderStatus
);

module.exports = router;
