const Notification = require("../models/Notification");

// 📥 Create Notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;

    const newNotification = new Notification({ userId, message });
    await newNotification.save();

    res.status(201).json({ success: true, notification: newNotification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 📤 Get User Notifications
exports.getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Mark as Read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(id, { status: "Read" }, { new: true });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ❌ Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'name')
      .sort({ timestamp: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all notifications', error: error.message });
  }
};