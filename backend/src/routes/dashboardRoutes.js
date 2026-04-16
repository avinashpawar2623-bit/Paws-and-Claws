const express = require("express");
const {
  getAdminDashboard,
  getVendorDashboard,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");

const router = express.Router();

router.get("/admin", protect, allowRoles("admin"), getAdminDashboard);
router.get("/vendor", protect, allowRoles("vendor", "admin"), getVendorDashboard);

module.exports = router;
