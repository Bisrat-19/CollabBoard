const Task = require('../models/Task');

// Get all tasks for a project
exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email')
      .exec();

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get tasks' });
  }
};

// Create a new task in a project
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, status, dueDate, labels } = req.body;
    const newTask = new Task({
      project: req.params.id,
      title,
      description,
      assignedTo,
      priority,
      status,
      dueDate,
      labels,
      createdBy: req.user._id,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// Get a specific task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email')
      .exec();

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get task' });
  }
};

// Update task by ID
exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email')
      .exec();

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// Delete task by ID
exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

// Add comment to a task
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = {
      user: req.user._id,
      content,
    };
    task.comments.push(comment);
    await task.save();

    // Populate the new comment user info before sending response
    await task.populate('comments.user', 'name email').execPopulate();

    res.status(201).json(task.comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Delete a comment by comment ID
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; // id = task id

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const commentIndex = task.comments.findIndex(c => c._id.toString() === commentId);
    if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });

    task.comments.splice(commentIndex, 1);
    await task.save();

    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};
