const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
dotenv.config();

require('./config/db');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');
const projectTaskRoutes = require('./routes/projectTask'); // new import
const taskRoutes = require('./routes/task');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const notificationModule = require('./routes/notification');
const notificationRoutes = notificationModule.router;
const setSocketService = notificationModule.setSocketService;
const messageRoutes = require('./routes/message');

// Import Socket.IO service
const SocketService = require('./socket-service');

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO service
const socketService = new SocketService(httpServer);

// Connect Socket.IO service with notification routes
setSocketService(socketService);

app.use(cors({
    origin: ['http://localhost:3000', 'https://collab-board-steel.vercel.app'],
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
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
