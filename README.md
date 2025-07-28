# 🚀 CollabBoard

**CollabBoard** is a full-stack team collaboration and project management tool that helps teams efficiently manage projects, assign tasks, track progress, and organize team members — all from a beautifully designed interface.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js , Tailwind CSS, TypeScript, shadcn/ui
- **Backend:** Express.js (Node.js)
- **Database:** MongoDB (MongoDB Atlas)
- **Authentication:** JWT (JSON Web Tokens)
- **UI Libraries:** shadcn/ui, lucide-react

---

## 🔑 Core Features

### 👤 Authentication & Authorization
- Secure login and registration with JWT
- Role-based access (Admin, Member)

### 🧑‍💼 Admin Capabilities
- Manage users: list, promote, remove
- View analytics: user count, project stats, admin ratio

### 📁 Project Management
- Create and manage multiple projects
- Add or remove team members from projects
- View detailed team member profiles

### ✅ Task Management
- Create, assign, update, and track tasks per project
- Organized board-style view for tasks

### 📊 Dashboard Insights
- Summary cards: Total Members, Admins, Projects
- Team member cards with roles, join date, and project involvement

---

## 🧪 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/Bisrat-19/CollabBoard.git
cd CollabBoard
```

### 2. Backend

```bash
cd backend
npm install
# Create .env file with:
# MONGO_URI=your_mongodb_url
# JWT_SECRET=your_jwt_secret
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
