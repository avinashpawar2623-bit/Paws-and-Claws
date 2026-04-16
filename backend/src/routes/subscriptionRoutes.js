const express = require("express");
const { body, param } = require("express-validator");
const {
  createSubscription,
  getSubscriptions,
  cancelSubscription,
} = require("../controllers/subscriptionController");
const { protect } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();
router.use(protect);

router.post(
  "/",
  [
    body("plan")
      .isIn(["vendor_premium", "customer_loyalty_plus"])
      .withMessage("Invalid subscription plan."),
    validateRequest,
  ],
  createSubscription
);
router.get("/", getSubscriptions);
router.put("/:id/cancel", [param("id").isMongoId(), validateRequest], cancelSubscription);

module.exports = router;
