const { Server } = require('socket.io');

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: ['http://localhost:3000', 'https://collab-board-steel.vercel.app'],
        credentials: true
      }
    });
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      // Join project room
      socket.on('join-project', (projectId) => {
        socket.join(`project-${projectId}`);
      });

      // Leave project room
      socket.on('leave-project', (projectId) => {
        socket.leave(`project-${projectId}`);
      });

      // Join user's personal notification room
      socket.on('join-user-notifications', (userId) => {
        const roomName = `user-${userId}`;
        socket.join(roomName);
      });

      // Handle new message
      socket.on('send-message', (data) => {
        const { projectId, message } = data;
        // Broadcast message to all users in the project room
        socket.to(`project-${projectId}`).emit('new-message', message);
      });

      // Handle message update
      socket.on('update-message', (data) => {
        const { projectId, message } = data;
        socket.to(`project-${projectId}`).emit('message-updated', message);
      });

      // Handle message deletion
      socket.on('delete-message', (data) => {
        const { projectId, messageId } = data;
        socket.to(`project-${projectId}`).emit('message-deleted', messageId);
      });

      // Handle user typing
      socket.on('typing', (data) => {
        const { projectId, userId, userName } = data;
        socket.to(`project-${projectId}`).emit('user-typing', { userId, userName });
      });

      // Handle user stop typing
      socket.on('stop-typing', (data) => {
        const { projectId, userId } = data;
        socket.to(`project-${projectId}`).emit('user-stop-typing', userId);
      });

      // Handle notification events
      socket.on('notification-created', (data) => {
        const { userId, notification } = data;
        // Send notification to specific user
        socket.to(`user-${userId}`).emit('new-notification', notification);
      });

      socket.on('notification-updated', (data) => {
        const { userId, notification } = data;
        socket.to(`user-${userId}`).emit('notification-updated', notification);
      });

      socket.on('notification-deleted', (data) => {
        const { userId, notificationId } = data;
        socket.to(`user-${userId}`).emit('notification-deleted', notificationId);
      });

      // Handle project-related notifications
      socket.on('project-notification', (data) => {
        const { projectId, notification, targetUsers } = data;
        // Send to all project members
        socket.to(`project-${projectId}`).emit('project-notification', notification);
        // Also send to specific users if needed
        if (targetUsers && targetUsers.length > 0) {
          targetUsers.forEach(userId => {
            socket.to(`user-${userId}`).emit('new-notification', notification);
          });
        }
      });

      socket.on('disconnect', () => {
        // User disconnected
      });
    });
  }

  // Helper methods for sending notifications
  sendNotificationToUser(userId, notification) {
    this.io.to(`user-${userId}`).emit('new-notification', notification);
  }

  sendNotificationToProject(projectId, notification, targetUsers = []) {
    this.io.to(`project-${projectId}`).emit('project-notification', notification);
    targetUsers.forEach(userId => {
      this.io.to(`user-${userId}`).emit('new-notification', notification);
    });
  }

  updateNotificationForUser(userId, notification) {
    this.io.to(`user-${userId}`).emit('notification-updated', notification);
  }

  deleteNotificationForUser(userId, notificationId) {
    this.io.to(`user-${userId}`).emit('notification-deleted', notificationId);
  }

  getIO() {
    return this.io;
  }
}

module.exports = SocketService; 

