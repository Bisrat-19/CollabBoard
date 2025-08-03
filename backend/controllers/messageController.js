const Message = require('../models/Message');
const Project = require('../models/Project');

// Get all messages for a project
exports.getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if user is a member of the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isMember = project.members.some(member => 
      member.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this project.' });
    }
    
    // Get messages with sender information
    const messages = await Message.find({ projectId })
      .populate('sender', '_id name email avatar role')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages for performance
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Get project messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Check if user is a member of the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isMember = project.members.some(member => 
      member.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    
    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this project.' });
    }
    
    // Create new message
    const newMessage = new Message({
      projectId,
      sender: req.user._id,
      content: content.trim(),
      messageType: 'text'
    });
    
    const savedMessage = await newMessage.save();
    
    // Populate sender information before returning
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', '_id name email avatar role');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Update a message (only sender can edit their own message)
exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is the sender of the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }
    
    // Update the message
    message.content = content.trim();
    message.updatedAt = new Date();
    await message.save();
    
    // Populate sender information before returning
    const updatedMessage = await Message.findById(messageId)
      .populate('sender', '_id name email avatar role');
    
    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ message: 'Failed to update message' });
  }
};

// Delete a message (only sender can delete their own message)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is the sender of the message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }
    
    await Message.findByIdAndDelete(messageId);
    
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
}; 