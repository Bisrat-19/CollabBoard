const Project = require('../models/Project');

// Create project
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    await project.save();
    await project.populate('members', 'name email avatar role createdAt');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get projects for logged in user
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    }).populate('members', 'name email avatar role createdAt');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single project by id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email avatar role createdAt');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.members.some((member) => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can update' });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.status = req.body.status || project.status;
    if (req.body.members) project.members = req.body.members;

    await project.save();
    await project.populate('members', 'name email avatar role createdAt');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
