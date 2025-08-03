import { io, Socket } from 'socket.io-client';
import { getApiUrl } from '@/lib/config';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket && this.isConnected) return;

    const serverUrl = process.env.NODE_ENV === 'production' 
      ? 'https://collabboard-backend-bli2.onrender.com' 
      : 'http://localhost:5000';

    this.socket = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinProject(projectId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-project', projectId);
    }
  }

  leaveProject(projectId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-project', projectId);
    }
  }

  joinUserNotifications(userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-user-notifications', userId);
    }
  }

  sendMessage(projectId: string, message: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-message', { projectId, message });
    }
  }

  updateMessage(projectId: string, message: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update-message', { projectId, message });
    }
  }

  deleteMessage(projectId: string, messageId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('delete-message', { projectId, messageId });
    }
  }

  startTyping(projectId: string, userId: string, userName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { projectId, userId, userName });
    }
  }

  stopTyping(projectId: string, userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stop-typing', { projectId, userId });
    }
  }

  // Notification methods
  createNotification(userId: string, notification: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('notification-created', { userId, notification });
    }
  }

  updateNotification(userId: string, notification: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit('notification-updated', { userId, notification });
    }
  }

  deleteNotification(userId: string, notificationId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('notification-deleted', { userId, notificationId });
    }
  }

  sendProjectNotification(projectId: string, notification: any, targetUsers?: string[]) {
    if (this.socket && this.isConnected) {
      this.socket.emit('project-notification', { projectId, notification, targetUsers });
    }
  }

  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onMessageUpdated(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('message-updated', callback);
    }
  }

  onMessageDeleted(callback: (messageId: string) => void) {
    if (this.socket) {
      this.socket.on('message-deleted', callback);
    }
  }

  onUserTyping(callback: (data: { userId: string; userName: string }) => void) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onUserStopTyping(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
    }
  }

  // Notification event listeners
  onNewNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('new-notification', callback);
    }
  }

  onNotificationUpdated(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification-updated', callback);
    }
  }

  onNotificationDeleted(callback: (notificationId: string) => void) {
    if (this.socket) {
      this.socket.on('notification-deleted', callback);
    }
  }

  onProjectNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('project-notification', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new-message');
    }
  }

  offMessageUpdated() {
    if (this.socket) {
      this.socket.off('message-updated');
    }
  }

  offMessageDeleted() {
    if (this.socket) {
      this.socket.off('message-deleted');
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user-typing');
    }
  }

  offUserStopTyping() {
    if (this.socket) {
      this.socket.off('user-stop-typing');
    }
  }

  // Notification cleanup methods
  offNewNotification() {
    if (this.socket) {
      this.socket.off('new-notification');
    }
  }

  offNotificationUpdated() {
    if (this.socket) {
      this.socket.off('notification-updated');
    }
  }

  offNotificationDeleted() {
    if (this.socket) {
      this.socket.off('notification-deleted');
    }
  }

  offProjectNotification() {
    if (this.socket) {
      this.socket.off('project-notification');
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const socketService = new SocketService(); 