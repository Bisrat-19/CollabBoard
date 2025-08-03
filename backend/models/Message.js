const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text'
  }
}, {
  timestamps: true
});

// Index for efficient querying by project
messageSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema); 