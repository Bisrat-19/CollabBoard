const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getCollaboratingUsers,
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/collaborating-users', getCollaboratingUsers);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
