const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path if needed
const Notification = require('../models/Notification');
const Project = require('../models/Project');
const { protect } = require('../middlewares/authMiddleware');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Invite (create) user by email
router.post('/invite', protect, async (req, res) => {
  const { email, projectId } = req.body;
  if (!email || !projectId) {
    console.log('Invite failed: missing email or projectId', { email, projectId });
    return res.status(400).json({ message: 'Email and projectId are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    console.log('Invite failed: user not found for email', email);
    return res.status(404).json({ message: 'User not found' });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    console.log('Invite failed: project not found for id', projectId);
    return res.status(404).json({ message: 'Project not found' });
  }

  if (project.members.some((m) => m.toString() === user._id.toString())) {
    console.log('Invite failed: user already a member', email, project.name);
    return res.status(400).json({ message: 'User is already a project member' });
  }

  const existingInvite = await Notification.findOne({
    userId: user._id,
    type: 'project-invite',
    'data.projectId': projectId,
    read: false,
  });
  if (existingInvite) {
    console.log('Invite failed: user already has a pending invite', email, project.name);
    return res.status(400).json({ message: 'User already has a pending invitation for this project' });
  }

  const inviterName = req.user.name || req.user.email;
  const message = `You are invited to collaborate on the project "${project.name}" by ${inviterName}`;
  const notification = await Notification.create({
    userId: user._id,
    type: 'project-invite',
    message,
    data: { projectId, inviterName },
  });
  console.log('Notification created for user:', user.email, 'project:', project.name, 'notificationId:', notification._id);

  res.json({ message: 'Invitation sent' });
});

module.exports = router;
