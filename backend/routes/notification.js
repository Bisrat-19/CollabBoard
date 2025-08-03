const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Project = require('../models/Project');
const { protect } = require('../middlewares/authMiddleware');

// Get notifications for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user._id, 
      read: false 
    });
    res.json({ count });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ message: 'Failed to fetch notification count' });
  }
});

// Accept invitation
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.type === 'project-invite') {
      const { projectId } = notification.data;
      const project = await Project.findById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is already a member
      if (project.members.some(member => member.toString() === req.user._id.toString())) {
        // User is already a member, just mark notification as read
        notification.read = true;
        await notification.save();
        return res.json({ message: 'Already a member of this project', project });
      }
      
      // Add user to project members
      project.members.push(req.user._id);
      await project.save();
      
      // Mark notification as read
      notification.read = true;
      await notification.save();
      
      // Populate project data before returning
      await project.populate('members', 'name email avatar role createdAt');
      
      return res.json({ 
        message: 'Invitation accepted', 
        project: project,
        notification: notification 
      });
    }
    
    res.status(400).json({ message: 'Invalid notification type' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Failed to accept invitation' });
  }
});

// Decline invitation
router.post('/:id/decline', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.type === 'project-invite') {
      notification.read = true;
      await notification.save();
      return res.json({ message: 'Invitation declined' });
    }
    
    res.status(500).json({ message: 'Invalid notification type' });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ message: 'Failed to decline invitation' });
  }
});

// Mark notification as read
router.post('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.read = true;
    await notification.save();
    
    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

module.exports = router; 