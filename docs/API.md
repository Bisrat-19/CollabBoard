# 🔧 CollabBoard API Documentation

## Overview

The CollabBoard API is a RESTful service built with Express.js that provides endpoints for user authentication, project management, task tracking, real-time messaging, and administrative functions.

**Base URL:** `https://your-backend-domain.com`  
**API Version:** v1  
**Content-Type:** `application/json`

---

## Authentication

All API requests (except authentication endpoints) require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user" | "admin"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "createdAt": "date"
    },
    "token": "string"
  },
  "message": "User registered successfully"
}
```

**Validation Errors (400):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  },
  "message": "Login successful"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "createdAt": "date"
    }
  }
}
```

---

### Users

#### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of users per page
- `search` (optional): Search by username or email

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "string",
        "username": "string",
        "email": "string",
        "role": "string",
        "createdAt": "date"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

### Projects

#### Get User's Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by project status
- `search` (optional): Search by project name

**Response (200):**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "owner": {
          "_id": "string",
          "username": "string"
        },
        "members": [
          {
            "_id": "string",
            "username": "string",
            "email": "string"
          }
        ],
        "status": "active" | "archived",
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
  }
}
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "members": ["userId1", "userId2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "project": {
      "_id": "string",
      "name": "string",
      "description": "string",
      "owner": "string",
      "members": ["string"],
      "status": "active",
      "createdAt": "date"
    }
  },
  "message": "Project created successfully"
}
```

#### Get Project by ID
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

#### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "status": "active" | "archived"
}
```

#### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

#### Add Member to Project
```http
POST /api/projects/:id/members
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "string"
}
```

#### Remove Member from Project
```http
DELETE /api/projects/:id/members/:userId
Authorization: Bearer <token>
```

---

### Tasks

#### Get Project Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
```

**Query Parameters:**
- `projectId` (required): Project ID
- `status` (optional): Filter by task status
- `assignedTo` (optional): Filter by assigned user
- `priority` (optional): Filter by priority level

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "projectId": "string",
        "assignedTo": {
          "_id": "string",
          "username": "string"
        },
        "createdBy": {
          "_id": "string",
          "username": "string"
        },
        "priority": "low" | "medium" | "high",
        "status": "todo" | "in-progress" | "done",
        "dueDate": "date",
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
  }
}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "projectId": "string",
  "assignedTo": "string",
  "priority": "low" | "medium" | "high",
  "status": "todo" | "in-progress" | "done",
  "dueDate": "date"
}
```

#### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "assignedTo": "string",
  "priority": "low" | "medium" | "high",
  "status": "todo" | "in-progress" | "done",
  "dueDate": "date"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

---

### Messages

#### Get Project Messages
```http
GET /api/messages/:projectId
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of messages per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "string",
        "content": "string",
        "projectId": "string",
        "sender": {
          "_id": "string",
          "username": "string"
        },
        "createdAt": "date"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "string",
  "projectId": "string"
}
```

#### Update Message
```http
PUT /api/messages/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "string"
}
```

#### Delete Message
```http
DELETE /api/messages/:id
Authorization: Bearer <token>
```

---

### Notifications

#### Get User Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

**Query Parameters:**
- `read` (optional): Filter by read status
- `type` (optional): Filter by notification type

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "string",
        "type": "task_assigned" | "project_invite" | "message" | "system",
        "title": "string",
        "message": "string",
        "recipient": "string",
        "read": false,
        "data": {},
        "createdAt": "date"
      }
    ]
  }
}
```

#### Mark Notification as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All Notifications as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

#### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

---

### Admin

#### Get System Analytics
```http
GET /api/admin/analytics
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 120,
      "newThisMonth": 25
    },
    "projects": {
      "total": 45,
      "active": 38,
      "completed": 7
    },
    "tasks": {
      "total": 320,
      "completed": 280,
      "pending": 40
    },
    "messages": {
      "total": 1250,
      "thisWeek": 150
    }
  }
}
```

#### Promote User to Admin
```http
PUT /api/admin/users/:id/promote
Authorization: Bearer <token>
```

#### Demote Admin to User
```http
PUT /api/admin/users/:id/demote
Authorization: Bearer <token>
```

#### Get System Logs
```http
GET /api/admin/logs
Authorization: Bearer <token>
```

**Query Parameters:**
- `level` (optional): Filter by log level
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate resource)
- **500** - Internal Server Error

### Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_ERROR` - Invalid credentials
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Resource already exists
- `DATABASE_ERROR` - Database operation failed
- `INTERNAL_ERROR` - Unexpected server error

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authentication endpoints:** 5 requests per minute
- **General endpoints:** 100 requests per minute
- **Admin endpoints:** 50 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## WebSocket Events

### Connection
```javascript
// Connect to WebSocket
const socket = io('https://your-backend-domain.com', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Join Project Room
```javascript
socket.emit('join-project', { projectId: 'project-id' });
```

#### Leave Project Room
```javascript
socket.emit('leave-project', { projectId: 'project-id' });
```

#### Send Message
```javascript
socket.emit('send-message', {
  content: 'Hello world!',
  projectId: 'project-id'
});
```

#### Listen for New Messages
```javascript
socket.on('new-message', (message) => {
  console.log('New message:', message);
});
```

#### Listen for Task Updates
```javascript
socket.on('task-updated', (task) => {
  console.log('Task updated:', task);
});
```

#### Listen for Notifications
```javascript
socket.on('new-notification', (notification) => {
  console.log('New notification:', notification);
});
```

---

## SDK Examples

### JavaScript/TypeScript
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend-domain.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example: Create a project
const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```