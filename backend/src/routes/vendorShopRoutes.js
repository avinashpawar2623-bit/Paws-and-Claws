const express = require("express");
const { body, param } = require("express-validator");
const {
  getMyVendorShop,
  upsertMyVendorShop,
  getVendorShopBySlug,
} = require("../controllers/vendorShopController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get(
  "/me",
  protect,
  allowRoles("vendor", "admin"),
  getMyVendorShop
);
router.put(
  "/me",
  protect,
  allowRoles("vendor", "admin"),
  [
    body("shopName").optional().isString().isLength({ max: 120 }),
    body("slug").optional().isString().isLength({ max: 120 }),
    body("description").optional().isString().isLength({ max: 1000 }),
    body("logoUrl").optional().isString(),
    body("bannerUrl").optional().isString(),
    body("accentColor").optional().isString().isLength({ max: 20 }),
    validateRequest,
  ],
  upsertMyVendorShop
);
router.get(
  "/:slug",
  [param("slug").isString().notEmpty(), validateRequest],
  getVendorShopBySlug
);

module.exports = router;
