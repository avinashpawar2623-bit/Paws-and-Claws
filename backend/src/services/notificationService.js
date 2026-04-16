const Notification = require("../models/Notification");

const createNotification = async ({
  userId,
  type,
  title,
  message,
  referenceType = "",
  referenceId = "",
  metadata = {},
}) => {
  if (!userId) return null;

  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    referenceType,
    referenceId,
    metadata,
  });

  return notification;
};

module.exports = { createNotification };
