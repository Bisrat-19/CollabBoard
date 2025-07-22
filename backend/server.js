const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

require('./config/db');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');
const projectTaskRoutes = require('./routes/projectTask'); // new import
const taskRoutes = require('./routes/task');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());



app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
// Mount project task routes for listing/creating tasks within projects
app.use('/api/projects/:projectId/tasks', projectTaskRoutes);
// Mount task routes for task-specific operations
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
