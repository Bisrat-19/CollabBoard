import { Key } from "react"

export interface User {
  id: string
  _id?: string // Add _id field for backend compatibility
  name: string
  email: string
  role: "admin" | "user"
  avatar?: string
  createdAt: string
  isActive?: boolean
}

export interface Project {
  _id: Key | null | undefined
  id: string
  name: string
  description: string
  ownerId: string
  createdBy?: string // Add createdBy field for backend compatibility
  members: User[]
  createdAt: string
  updatedAt: string
}

export interface Board {
  id: string
  projectId: string
  columns: Column[]
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
  order: number
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo?: User
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "done"
  dueDate?: string
  labels: string[]
  comments: Comment[]
  createdBy: User
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    _id?: string
    name: string
    description: string
  }
}

export interface Comment {
  id: string
  content: string
  author: User
  createdAt: string
}

export interface CreateTaskData {
  title: string
  description: string
  assignedToId?: string
  priority: "low" | "medium" | "high"
  dueDate?: string
  labels: string[]
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: "todo" | "in-progress" | "done"
}

export interface Notification {
  _id: string;
  userId: string;
  type: string; // e.g., 'project-invite', 'task-assignment'
  message: string;
  data?: { 
    projectId?: string; 
    inviterName?: string;
    taskId?: string;
    assignerName?: string;
    taskTitle?: string;
    projectName?: string;
  };
  read: boolean;
  createdAt: string;
}

export interface Message {
  _id: string;
  projectId: string;
  sender: User;
  content: string;
  messageType: 'text' | 'system';
  createdAt: string;
  updatedAt: string;
}
