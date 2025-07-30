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
const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notification');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}));
app.use(express.json());



app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', projectTaskRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
