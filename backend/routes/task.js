const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getAllTasksForUser,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
} = require('../controllers/taskController');

router.get('/', protect, getAllTasksForUser);
router.get('/:taskId', protect, getTaskById);
router.put('/:taskId', protect, updateTask);
router.delete('/:taskId', protect, deleteTask);
router.post('/:taskId/comments', protect, addComment);
router.delete('/:taskId/comments/:commentId', protect, deleteComment);

module.exports = router;