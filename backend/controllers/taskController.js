const Task = require('../models/Task');
const Notification = require('../models/Notification');

// Helper function to create task assignment notification
const createTaskAssignmentNotification = async (assignedUserId, taskId, projectId, assignerName, taskTitle, projectName) => {
  try {
    const notification = new Notification({
      userId: assignedUserId,
      type: 'task-assignment',
      message: `You have been assigned to the task "${taskTitle}" in project "${projectName}" by ${assignerName}`,
      data: {
        taskId,
        projectId,
        assignerName,
        taskTitle,
        projectName
      }
    });
    await notification.save();
  } catch (error) {
    console.error('Failed to create task assignment notification:', error);
  }
};

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

    // Check if user is trying to assign the task to someone
    if (assignedTo && assignedTo !== 'unassigned') {
      // Get the project to check if user is creator or admin
      const Project = require('../models/Project');
      const project = await Project.findById(req.params.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if user is admin
      const isAdmin = req.user.role === 'admin';
      
      // Check if user is project creator
      const isCreator = project.createdBy.toString() === req.user._id.toString();
      
      if (!isAdmin && !isCreator) {
        return res.status(403).json({ 
          message: 'Only project creators and admins can assign team members to tasks' 
        });
      }
    }

    const newTask = new Task({
      project: req.params.projectId,
      title,
      description,
      assignedTo: assignedTo === 'unassigned' ? null : assignedTo,
      priority,
      status,
      dueDate,
      labels,
      createdBy: req.user._id,
    });

    const savedTask = await newTask.save();

    // Create notification if task is assigned to someone
    if (assignedTo && assignedTo !== 'unassigned') {
      const Project = require('../models/Project');
      const project = await Project.findById(req.params.projectId);
      if (project) {
        await createTaskAssignmentNotification(
          assignedTo,
          savedTask._id,
          req.params.projectId,
          req.user.name,
          title,
          project.name
        );
      }
    }

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
    const { assignedTo } = req.body;

    // Check if user is trying to assign the task to someone
    if (assignedTo && assignedTo !== 'unassigned') {
      // Get the task to find the project
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Get the project to check if user is creator or admin
      const Project = require('../models/Project');
      const project = await Project.findById(task.project);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if user is admin
      const isAdmin = req.user.role === 'admin';
      
      // Check if user is project creator
      const isCreator = project.createdBy.toString() === req.user._id.toString();
      
      if (!isAdmin && !isCreator) {
        return res.status(403).json({ 
          message: 'Only project creators and admins can assign team members to tasks' 
        });
      }
    }

    // Get the current task to check if assignment is changing
    const currentTask = await Task.findById(req.params.taskId);
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Prepare update data
    const updateData = { ...req.body };
    if (assignedTo === 'unassigned') {
      updateData.assignedTo = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, updateData, { new: true })
      .populate('assignedTo', 'name email role avatar createdAt')
      .populate('createdBy', 'name email role avatar createdAt')
      .populate('comments.user', 'name email role avatar createdAt')
      .exec();

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    // Create notification if task assignment is changing
    if (assignedTo && assignedTo !== 'unassigned') {
      const currentAssignedTo = currentTask.assignedTo ? currentTask.assignedTo.toString() : null;
      const newAssignedTo = assignedTo;
      
      // Only create notification if assignment is actually changing
      if (currentAssignedTo !== newAssignedTo) {
        const Project = require('../models/Project');
        const project = await Project.findById(currentTask.project);
        if (project) {
          await createTaskAssignmentNotification(
            newAssignedTo,
            updatedTask._id,
            currentTask.project.toString(),
            req.user.name,
            updatedTask.title,
            project.name
          );
        }
      }
    }

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


