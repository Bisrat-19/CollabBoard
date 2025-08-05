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

### **Key Benefits**
- **Real-time Collaboration:** Instant messaging and live updates across all features
- **Scalable Architecture:** Built to handle teams from small startups to large enterprises
- **Modern UI/UX:** Intuitive interface with dark/light theme support
- **Role-based Access:** Granular permissions for different user types
- **Mobile Responsive:** Works seamlessly across all devices

---

## 🏗️ Architecture Overview

### **System Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React App     │    │ • REST API      │    │ • User Data     │
│ • Socket.IO     │    │ • Socket.IO     │    │ • Projects      │
│ • TypeScript    │    │ • JWT Auth      │    │ • Tasks         │
│ • Tailwind CSS  │    │ • Middleware    │    │ • Messages      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow**
1. **Authentication Flow:** JWT-based token management with refresh capabilities
2. **Real-time Communication:** WebSocket connections for live updates
3. **State Management:** React Context API for global state
4. **API Communication:** RESTful endpoints with Axios client

---

## 🛠️ Technology Stack

### **Frontend Technologies**
- **Framework:** Next.js (React)
- **Language:** TypeScript 
- **Styling:** Tailwind CSS 
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Real-time Communication:** Socket.IO Client
- **HTTP Client:** Axios 

### **Backend Technologies**
- **Runtime:** Node.js with Express.js 
- **Language:** JavaScript (ES6+)
- **Database:** MongoDB Atlas (Cloud Database)
- **Authentication:** JWT 
- **Real-time Communication:** Socket.IO 

### **Database Schema**
- **Users:** Authentication, roles, profiles
- **Projects:** Team collaboration spaces
- **Tasks:** Work items with status tracking
- **Messages:** Real-time communication
- **Notifications:** System alerts and updates

---

## ✨ Core Features

### **🔐 Authentication & Authorization**
- JWT-based authentication with secure token storage
- Role-based access control (User, Admin)
- Password hashing with bcryptjs
- Session management and token refresh

### **👨‍💼 Admin Dashboard**
- User management and analytics
- System-wide project oversight
- Performance metrics and insights
- User role management

### **📁 Project Management**
- Create, organize, and manage team projects
- Project-specific chat rooms
- Member invitation and management
- Project analytics and progress tracking

### **✅ Task Management**
- Kanban board with drag-and-drop functionality
- Task assignment and status tracking
- Priority levels and due dates
- Task comments and attachments

### **💬 Real-time Chat**
- Project-specific messaging with Socket.IO
- Message history and search
- File sharing capabilities
- Typing indicators and read receipts

### **🔔 Notifications**
- Real-time alerts and updates
- Email notifications (configurable)
- In-app notification center
- Customizable notification preferences

### **📊 Analytics**
- Team insights and project metrics
- Performance tracking
- Usage statistics
- Export capabilities

### **🎨 Modern UI**
- Responsive design with mobile-first approach
- Dark/light theme support
- Accessibility compliant
- Modern component library

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- MongoDB Atlas (Cloud Database)
- npm or yarn package manager
- Git

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

## 📚 Documentation

For detailed information about CollabBoard, check out our comprehensive documentation:

- 🔧 **[API Reference](./docs/API.md)** - Complete API documentation with endpoints, examples, and WebSocket events
- 🚀 **[Deployment Guide](./docs/DEPLOYMENT.md)** - Step-by-step deployment instructions for multiple platforms
- 🤝 **[Contributing Guidelines](./docs/CONTRIBUTING.md)** - How to contribute to the project

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
