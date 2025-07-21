export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  avatar?: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  ownerId: string
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
