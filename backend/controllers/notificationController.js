const Notification = require('../models/Notification');
const Project = require('../models/Project');

// Get Socket.IO instance
let socketService;
const setSocketService = (service) => {
  socketService = service;
};

// Get notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Get unread notification count
const getNotificationCount = async (req, res) => {
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
};

// Create a new notification (for internal use)
const createNotification = async (req, res) => {
  try {
    const { userId, type, message, data } = req.body;
    
    const notification = new Notification({
      userId,
      type,
      message,
      data
    });
    
    const savedNotification = await notification.save();
    
    // Send real-time notification if socket service is available
    if (socketService) {
      socketService.sendNotificationToUser(userId, savedNotification);
    }
    
    res.status(201).json(savedNotification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};

// Accept invitation
const acceptInvitation = async (req, res) => {
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
        
        // Send real-time update
        if (socketService) {
          socketService.updateNotificationForUser(req.user._id, notification);
        }
        
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
      
      // Send real-time update
      if (socketService) {
        socketService.updateNotificationForUser(req.user._id, notification);
      }
      
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
};

// Decline invitation
const declineInvitation = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.type === 'project-invite') {
      notification.read = true;
      await notification.save();
      
      // Send real-time update
      if (socketService) {
        socketService.updateNotificationForUser(req.user._id, notification);
      }
      
      return res.json({ message: 'Invitation declined' });
    }
    
    res.status(500).json({ message: 'Invalid notification type' });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ message: 'Failed to decline invitation' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.read = true;
    await notification.save();
    
    // Send real-time update
    if (socketService) {
      socketService.updateNotificationForUser(req.user._id, notification);
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    const notificationId = notification._id;
    await Notification.findByIdAndDelete(req.params.id);
    
    // Send real-time deletion
    if (socketService) {
      socketService.deleteNotificationForUser(req.user._id, notificationId);
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

module.exports = {
  getNotifications,
  getNotificationCount,
  createNotification,
  acceptInvitation,
  declineInvitation,
  markAsRead,
  deleteNotification,
  setSocketService
}; 