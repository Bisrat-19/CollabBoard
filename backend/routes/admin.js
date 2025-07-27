const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const {
  getAllUsers,
  getAllProjects,
  createProject,
  deleteProject,
  updateProject,
  createUser,
  updateUser,
  deleteUser,
  getSystemStats,
  getSystemSettings,
  updateSystemSettings,
  exportSystemData,
} = require('../controllers/adminController');

router.use(protect, isAdmin);

router.get('/users', getAllUsers);
router.get('/projects', getAllProjects);
router.post('/projects', createProject);
router.delete('/projects/:id', deleteProject);
router.put('/projects/:id', updateProject);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// System settings routes
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Data export route
router.get('/export', exportSystemData);

module.exports = router;
