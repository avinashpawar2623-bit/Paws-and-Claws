const express = require("express");
const {
  getProfile,
  updateProfile,
  listUsers,
  deleteUser,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateUserStatus,
  listAuditLogs,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const { body, param } = require("express-validator");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/wishlist", protect, getWishlist);
router.post(
  "/wishlist",
  protect,
  [body("productId").isMongoId().withMessage("Invalid product id."), validateRequest],
  addToWishlist
);
router.delete(
  "/wishlist/:productId",
  protect,
  [param("productId").isMongoId().withMessage("Invalid product id."), validateRequest],
  removeFromWishlist
);
router.get("/", protect, allowRoles("admin"), listUsers);
router.get("/audit-logs", protect, allowRoles("admin"), listAuditLogs);
router.put(
  "/:id/status",
  protect,
  allowRoles("admin"),
  [
    param("id").isMongoId().withMessage("Invalid user id."),
    body("isSuspended").isBoolean().withMessage("isSuspended must be boolean."),
    body("suspendedReason").optional().isString().isLength({ max: 250 }),
    validateRequest,
  ],
  updateUserStatus
);
router.delete("/:id", protect, allowRoles("admin"), deleteUser);

module.exports = router;
