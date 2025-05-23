const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Create a notification
router.post("/", notificationController.createNotification);

// Get all notifications for a user
router.get("/user/:userId", notificationController.getNotificationsByUser);

// Mark a notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Delete a notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
