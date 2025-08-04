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
      console.log('User connected:', socket.id);

      // Join project room
      socket.on('join-project', (projectId) => {
        socket.join(`project-${projectId}`);
        console.log(`User ${socket.id} joined project ${projectId}`);
      });

      // Leave project room
      socket.on('leave-project', (projectId) => {
        socket.leave(`project-${projectId}`);
        console.log(`User ${socket.id} left project ${projectId}`);
      });

      // Join user's personal notification room
      socket.on('join-user-notifications', (userId) => {
        const roomName = `user-${userId}`;
        socket.join(roomName);
        console.log(`User ${socket.id} joined notification room: ${roomName}`);
        
        // Log the rooms this socket is in
        const rooms = Array.from(socket.rooms);
        console.log(`Socket ${socket.id} is now in rooms:`, rooms);
      });

      // Handle new message
      socket.on('send-message', (data) => {
        const { projectId, message } = data;
        // Broadcast message to all users in the project room
        socket.to(`project-${projectId}`).emit('new-message', message);
        console.log(`Message sent to project ${projectId}:`, message.content);
      });

      // Handle message update
      socket.on('update-message', (data) => {
        const { projectId, message } = data;
        socket.to(`project-${projectId}`).emit('message-updated', message);
        console.log(`Message updated in project ${projectId}:`, message.content);
      });

      // Handle message deletion
      socket.on('delete-message', (data) => {
        const { projectId, messageId } = data;
        socket.to(`project-${projectId}`).emit('message-deleted', messageId);
        console.log(`Message deleted in project ${projectId}:`, messageId);
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
        console.log(`Notification sent to user ${userId}:`, notification.message);
      });

      socket.on('notification-updated', (data) => {
        const { userId, notification } = data;
        socket.to(`user-${userId}`).emit('notification-updated', notification);
        console.log(`Notification updated for user ${userId}:`, notification.message);
      });

      socket.on('notification-deleted', (data) => {
        const { userId, notificationId } = data;
        socket.to(`user-${userId}`).emit('notification-deleted', notificationId);
        console.log(`Notification deleted for user ${userId}:`, notificationId);
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
        console.log(`Project notification sent to project ${projectId}:`, notification.message);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  // Helper methods for sending notifications
  sendNotificationToUser(userId, notification) {
    console.log(`Attempting to send notification to user room: user-${userId}`);
    this.io.to(`user-${userId}`).emit('new-notification', notification);
    console.log(`Notification emitted to room user-${userId}`);
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