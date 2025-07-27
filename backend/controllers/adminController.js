const User = require('../models/User');
const Project = require('../models/Project');

// Get all users (paginated)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all projects (admin only)
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('members', 'name email avatar role createdAt');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete project (admin only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update project (admin only)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    if (req.body.members) project.members = req.body.members;

    await project.save();
    await project.populate('members', 'name email avatar role createdAt');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create project (admin only)
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

// Create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    res.json({ message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get system settings
exports.getSystemSettings = async (req, res) => {
  try {
    // For now, return default settings
    // In a real app, you would store these in a database
    const settings = {
      maintenanceMode: false,
      allowRegistration: true,
      maxProjectsPerUser: 10,
      storageLimit: 100,
    };
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update system settings
exports.updateSystemSettings = async (req, res) => {
  try {
    const { maintenanceMode, allowRegistration, maxProjectsPerUser, storageLimit } = req.body;
    
    // For now, just return success
    // In a real app, you would save these to a database
    const settings = {
      maintenanceMode: maintenanceMode || false,
      allowRegistration: allowRegistration !== false,
      maxProjectsPerUser: maxProjectsPerUser || 10,
      storageLimit: storageLimit || 100,
    };
    
    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Export system data
exports.exportSystemData = async (req, res) => {
  try {
    const [users, projects] = await Promise.all([
      User.find().select('-password'),
      Project.find().populate('members', 'name email'),
    ]);

    const exportData = {
      users,
      projects,
      exportDate: new Date().toISOString(),
      totalUsers: users.length,
      totalProjects: projects.length,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=collabboard-export-${new Date().toISOString().split('T')[0]}.json`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
