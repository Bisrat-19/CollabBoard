const express = require('express');
const router = express.Router({ mergeParams: true }); // important to get projectId from params
const { protect } = require('../middlewares/authMiddleware');
const {
  getTasksByProject,
  createTask,
} = require('../controllers/taskController');

router.get('/', protect, getTasksByProject);
router.post('/', protect, createTask);

module.exports = router;
