const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getProjectMessages,
  sendMessage,
  updateMessage,
  deleteMessage
} = require('../controllers/messageController');

// Get all messages for a project
router.get('/project/:projectId', protect, getProjectMessages);

// Send a new message to a project
router.post('/project/:projectId', protect, sendMessage);

// Update a message
router.put('/:messageId', protect, updateMessage);

// Delete a message
router.delete('/:messageId', protect, deleteMessage);

module.exports = router; 