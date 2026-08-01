const express = require("express");

const router = express.Router();

const adminAuth = require("../middleware/adminAuth");

const {
  getAllNotifications,
  deleteNotification,
  markAsRead,
} = require("../controllers/adminNotificationController");

// Get all notifications
router.get("/", adminAuth, getAllNotifications);

// Mark one notification as read
router.put("/:id/read", adminAuth, markAsRead);

// Delete one notification
router.delete("/:id", adminAuth, deleteNotification);

module.exports = router;