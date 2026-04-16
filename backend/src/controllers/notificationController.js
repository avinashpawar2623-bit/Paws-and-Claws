const Notification = require("../models/Notification");

const listNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  return res.status(200).json({ success: true, notifications, unreadCount });
};

const markNotificationRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found." });
  }
  if (notification.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Forbidden." });
  }

  notification.isRead = true;
  await notification.save();

  return res.status(200).json({ success: true, notification });
};

const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  return res.status(200).json({ success: true, message: "All notifications marked as read." });
};

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
