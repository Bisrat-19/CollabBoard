const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Project = require('../models/Project');
const { protect } = require('../middlewares/authMiddleware');

// Get notifications for logged-in user
router.get('/', protect, async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

// Accept invitation
router.post('/:id/accept', protect, async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification || notification.userId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  if (notification.type === 'project-invite') {
    const { projectId } = notification.data;
    const project = await Project.findById(projectId);
    if (project && !project.members.includes(req.user._id)) {
      project.members.push(req.user._id);
      await project.save();
    }
    notification.read = true;
    await notification.save();
    return res.json({ message: 'Invitation accepted', project });
  }
  res.status(400).json({ message: 'Invalid notification type' });
});

// Decline invitation
router.post('/:id/decline', protect, async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification || notification.userId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  if (notification.type === 'project-invite') {
    notification.read = true;
    await notification.save();
    return res.json({ message: 'Invitation declined' });
  }
  res.status(400).json({ message: 'Invalid notification type' });
});

module.exports = router; 