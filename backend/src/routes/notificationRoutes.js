const express = require("express");
const { param } = require("express-validator");
const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.use(protect);
router.get("/", listNotifications);
router.put("/read-all", markAllNotificationsRead);
router.put(
  "/:id/read",
  [param("id").isMongoId().withMessage("Invalid notification id."), validateRequest],
  markNotificationRead
);

module.exports = router;
