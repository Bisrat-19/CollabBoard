const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getNotifications,
  getNotificationCount,
  createNotification,
  acceptInvitation,
  declineInvitation,
  markAsRead,
  deleteNotification,
  setSocketService
} = require('../controllers/notificationController');

// Get notifications for logged-in user
router.get('/', protect, getNotifications);

// Get unread notification count
router.get('/count', protect, getNotificationCount);

// Create a new notification (for internal use)
router.post('/', protect, createNotification);

// Accept invitation
router.post('/:id/accept', protect, acceptInvitation);

// Decline invitation
router.post('/:id/decline', protect, declineInvitation);

// Mark notification as read
router.put('/:id/read', protect, markAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

module.exports = { router, setSocketService }; 
