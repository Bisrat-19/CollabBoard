const express = require('express');
const router = express.Router();
const {
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

// Get all tasks for a project
router.get('/:id/tasks', protect, getTasksByProject);

// Create new task in a project
router.post('/:id/tasks', protect, createTask);

// Get, update, delete a task by task ID
router.get('/tasks/:id', protect, getTaskById);
router.put('/tasks/:id', protect, updateTask);
router.delete('/tasks/:id', protect, deleteTask);

// Comments on tasks
router.get('/tasks/:id/comments', protect, (req, res) => {
  // Could implement if needed, currently comments are part of task object
  res.status(501).json({ message: 'Not implemented separately' });
});
router.post('/tasks/:id/comments', protect, addComment);
router.delete('/tasks/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
