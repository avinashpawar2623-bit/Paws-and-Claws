const express = require("express");
const {
  getProfile,
  updateProfile,
  listUsers,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/", protect, allowRoles("admin"), listUsers);
router.delete("/:id", protect, allowRoles("admin"), deleteUser);

module.exports = router;
