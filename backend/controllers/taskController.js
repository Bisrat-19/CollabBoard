const Task = require('../models/Task');

// Get all tasks for the current user across all projects
exports.getAllTasksForUser = async (req, res) => {
  try {
    // First get all projects where the user is a member
    const Project = require('../models/Project');
    const userProjects = await Project.find({
      members: req.user._id,
    });

    const projectIds = userProjects.map(project => project._id);

    // Get all tasks from these projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', '_id name description')
      .populate('assignedTo', 'name email role avatar createdAt')
      .populate('createdBy', 'name email role avatar createdAt')
      .populate('comments.user', 'name email role avatar createdAt')
      .exec();

    res.status(200).json(tasks);
  } catch (err) {
    console.error('GetAllTasksForUser error:', err);
    res.status(500).json({ message: 'Failed to get tasks' });
  }
};

// Get all tasks for a project
exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email role avatar createdAt')
      .populate('createdBy', 'name email role avatar createdAt')
      .populate('comments.user', 'name email role avatar createdAt')
      .exec();

    res.status(200).json(tasks);
  } catch (err) {
    console.error('GetTasksByProject error:', err);
    res.status(500).json({ message: 'Failed to get tasks' });
  }
};

// Create a new task in a project
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, status, dueDate, labels } = req.body;

    const newTask = new Task({
      project: req.params.projectId,
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

    // Populate before returning
    const populatedTask = await Task.findById(savedTask._id)
    .populate('assignedTo', 'name email role avatar createdAt')
    .populate('createdBy', 'name email role avatar createdAt')
    .populate('comments.user', 'name email role avatar createdAt');

  res.status(201).json(populatedTask);
  } catch (err) {
    console.error('CreateTask error:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// Get a specific task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'name email role avatar createdAt')
      .populate('createdBy', 'name email role avatar createdAt')
      .populate('comments.user', 'name email role avatar createdAt')
      .exec();

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
  } catch (err) {
    console.error('GetTaskById error:', err);
    res.status(500).json({ message: 'Failed to get task' });
  }
};

// Update task by ID
exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true })
      .populate('assignedTo', 'name email role avatar createdAt')
      .populate('createdBy', 'name email role avatar createdAt')
      .populate('comments.user', 'name email role avatar createdAt')
      .exec();

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(updatedTask);
  } catch (err) {
    console.error('UpdateTask error:', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// Delete task by ID
exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.taskId);
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    console.error('DeleteTask error:', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

// Add comment to a task
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = {
      user: req.user._id,
      content: content.trim(),
    };

    task.comments.push(comment);
    await task.save();

    await task.populate({
      path: "comments.user",
      select: "name email role avatar createdAt",
    });

    res.status(201).json(task.comments);
  } catch (err) {
    console.error("AddComment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// Delete a comment by comment ID
exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    // Use pull to remove comment from the array
    task.comments.pull(comment._id);
    await task.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};


