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

### **Frontend Technologies**
- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **State Management:** React Context API
- **Forms:** React Hook Form + Zod validation
- **Real-time Communication:** Socket.IO Client
- **HTTP Client:** Axios
- **Date Handling:** date-fns
- **Charts:** Recharts
- **Notifications:** Sonner

### **Backend Technologies**
- **Runtime:** Node.js with Express.js
- **Language:** JavaScript (ES6+)
- **Database:** MongoDB Atlas (Cloud Database)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Real-time Communication:** Socket.IO
- **CORS:** cors
- **Environment:** dotenv
- **Development:** nodemon

### **Database Schema**
- **Users:** Authentication, roles, profiles
- **Projects:** Team collaboration spaces
- **Tasks:** Work items with status tracking
- **Messages:** Real-time communication
- **Notifications:** System alerts and updates

---

## ✨ Core Features

### 🔐 **Authentication & Authorization**
- **Secure JWT-based authentication**
- **Role-based access control (Admin, Member)**
- **Protected routes and middleware**
- **Session management with credentials**

### 👨‍💼 **Admin Dashboard & Management**
- **User Management:**
  - List all users with detailed profiles
  - Promote users to admin role
  - Remove users from the system
  - View user activity and statistics
- **Analytics Dashboard:**
  - Total user count and growth metrics
  - Project statistics and engagement
  - Admin-to-user ratio tracking
  - System usage analytics
- **Project Management:**
  - Overview of all projects
  - Project member management
  - Project performance metrics

### 📁 **Project Management**
- **Project Creation & Organization:**
  - Create multiple projects with descriptions
  - Set project ownership and permissions
  - Organize projects by teams/departments
- **Team Member Management:**
  - Add/remove team members from projects
  - View detailed member profiles and roles
  - Track member activity and contributions
- **Project Settings:**
  - Update project details (name, description)
  - Delete projects (creator-only access)
  - Manage project permissions and access

### ✅ **Advanced Task Management**
- **Task Creation & Assignment:**
  - Create tasks with detailed descriptions
  - Assign tasks to team members
  - Set priority levels (Low, Medium, High)
  - Add due dates and labels
- **Kanban Board Interface:**
  - Drag-and-drop task organization
  - Status columns: Todo, In Progress, Done
  - Visual task progression tracking
- **Task Details & Collaboration:**
  - Rich task descriptions and attachments
  - Comment system for task discussions
  - Task history and activity tracking
  - Real-time task updates

### 💬 **Real-time Communication**
- **Project Chat System:**
  - Real-time messaging within projects
  - Message editing and deletion
  - Typing indicators
  - Message history and search
- **Socket.IO Integration:**
  - Live updates across all connected clients
  - Room-based messaging (project-specific)
  - Connection status management
  - Automatic reconnection handling

### 🔔 **Notification System**
- **Real-time Notifications:**
  - Task assignments and updates
  - Project invitations and changes
  - System announcements
  - Custom notification types
- **Notification Management:**
  - Mark notifications as read/unread
  - Delete notifications
  - Notification preferences
  - Push notifications support

### 📊 **Dashboard & Analytics**
- **Overview Dashboard:**
  - Summary cards with key metrics
  - Total members, admins, and projects
  - Recent activity feed
- **Team Insights:**
  - Team member cards with roles
  - Join dates and project involvement
  - Performance metrics
- **Project Analytics:**
  - Task completion rates
  - Team productivity metrics
  - Project timeline tracking

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

### **Backend Deployment (Render)**
- Connect your GitHub repository
- Set environment variables
- Deploy automatically on push

### **Frontend Deployment (Vercel)**
- Connect your GitHub repository
- Configure build settings
- Deploy automatically on push

### **Environment Variables for Production**
```env
MONGO_URI=your_production_mongodb_atlas_uri
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
