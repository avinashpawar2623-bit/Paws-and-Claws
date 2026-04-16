const express = require("express");
const { body, param } = require("express-validator");
const {
  createPayment,
  getPaymentHistory,
  getPaymentByOrderId,
  getReceiptByProviderPaymentId,
  handleWebhook,
  requestRefund,
  cancelPayment,
  getWallet,
  topUpWallet,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/webhook",
  [
    body("providerPaymentId").isString().notEmpty(),
    body("status").isIn(["succeeded", "failed", "cancelled"]),
    validateRequest,
  ],
  handleWebhook
);

router.use(protect);

router.post(
  "/",
  [
    body("orderId").isMongoId().withMessage("Valid orderId is required."),
    body("provider").isIn(["stripe", "razorpay", "wallet", "cod"]).withMessage("Invalid payment provider."),
    body("currency").optional().isString().isLength({ min: 3, max: 3 }),
    validateRequest,
  ],
  createPayment
);
router.get("/", getPaymentHistory);
router.get(
  "/order/:orderId",
  [
    param("orderId").isMongoId().withMessage("Invalid order id."),
  ],
  getPaymentByOrderId
);
router.get(
  "/receipt/:providerPaymentId",
  [
    param("providerPaymentId").isString().notEmpty().withMessage("Invalid providerPaymentId."),
  ],
  getReceiptByProviderPaymentId
);
router.post(
  "/refund",
  [body("paymentId").isMongoId(), body("reason").optional().isString(), validateRequest],
  requestRefund
);
router.post(
  "/:paymentId/cancel",
  [
    param("paymentId").isMongoId().withMessage("Invalid payment id."),
    validateRequest,
  ],
  cancelPayment
);
router.get("/wallet", getWallet);
router.post(
  "/wallet/topup",
  [body("amount").isFloat({ gt: 0 }).withMessage("Amount must be positive."), validateRequest],
  topUpWallet
);

module.exports = router;
