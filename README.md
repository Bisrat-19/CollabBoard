# 🚀 CollabBoard - Advanced Team Collaboration Platform

**CollabBoard** is a comprehensive full-stack team collaboration and project management platform that empowers teams to efficiently manage projects, assign tasks, track progress, communicate in real-time, and organize team members — all from a beautifully designed, modern interface.

🌐 **Live Demo:** [https://collab-board-steel.vercel.app/](https://collab-board-steel.vercel.app/)

![CollabBoard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-ISC-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Next.js](https://img.shields.io/badge/Next.js-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)

---

## 🎯 Project Overview

CollabBoard is designed to streamline team collaboration with advanced features including real-time messaging, task management, project organization, and comprehensive admin controls. The platform provides a seamless experience for teams of any size to work together effectively.

---

## 🛠️ Technology Stack

**Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Socket.IO Client
**Backend:** Node.js, Express.js, MongoDB Atlas, Socket.IO, JWT
**Database:** MongoDB Atlas (Cloud)

---

## ✨ Core Features

- 🔐 **Authentication & Authorization** - JWT-based with role-based access
- 👨‍💼 **Admin Dashboard** - User management, analytics, project oversight
- 📁 **Project Management** - Create, organize, and manage team projects
- ✅ **Task Management** - Kanban board with drag-and-drop functionality
- 💬 **Real-time Chat** - Project-specific messaging with Socket.IO
- 🔔 **Notifications** - Real-time alerts and updates
- 📊 **Analytics** - Team insights and project metrics
- 🎨 **Modern UI** - Responsive design with dark/light themes

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- MongoDB Atlas (Cloud Database)
- npm or yarn package manager

### **1. Clone the Repository**
```bash
git clone https://github.com/Bisrat-19/CollabBoard.git
cd CollabBoard
```

### **2. Backend Setup**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

**Environment Variables (.env):**
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

```bash
npm run dev
# Server will start 
```

### **3. Frontend Setup**
```bash
cd frontend
npm install

# Create .env.local file (if needed)
cp .env.example .env.local
```

```bash
npm run dev
# Frontend will start 
```

### **4. Database Setup**
- Set up MongoDB Atlas cluster
- Configure network access and database user
- The application will automatically create collections
- Initial admin user can be created through the registration process

---

## 📁 Project Structure

```
CollabBoard/
├── backend/                 # Express.js API server
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Authentication & validation
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── utils/              # Helper functions
│   ├── socket-service.js   # Real-time communication
│   └── server.js           # Main server file
├── frontend/               # Next.js application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   │   ├── admin/         # Admin-specific components
│   │   ├── auth/          # Authentication components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── layout/        # Layout components
│   │   ├── project/       # Project management components
│   │   └── ui/            # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── services/          # API services
│   ├── styles/            # Global styles
│   └── types/             # TypeScript type definitions
└── README.md
```

---

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### **Users**
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### **Projects**
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### **Tasks**
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### **Messages**
- `GET /api/messages/:projectId` - Get project messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

### **Notifications**
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### **Admin**
- `GET /api/admin/analytics` - Get system analytics
- `PUT /api/admin/users/:id/promote` - Promote user to admin
- `DELETE /api/admin/users/:id` - Remove user

---

## 🌐 Deployment

- **Frontend:** Deployed on Vercel
- **Backend:** Deployed on Render
- **Database:** MongoDB Atlas

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
