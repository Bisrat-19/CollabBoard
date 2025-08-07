import type { Task, CreateTaskData, UpdateTaskData, Comment, Board, Column, User } from "@/types"
import { authService } from "./auth-service";
import { getApiUrl } from "@/lib/config";

const API_BASE = getApiUrl("");

// Helper function to normalize user data
const normalizeUser = (user: any): User | undefined => {
  if (!user) return undefined;
  
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
};

// Helper function to normalize task data
const normalizeTask = (task: any): Task => {
  // Map backend status to column id using a reverse map
  const statusToColId: Record<string, string> = {
    "To Do": "todo",
    "In Progress": "in-progress",
    "Done": "done",
  };

  return {
    id: task._id || task.id,
    title: task.title,
    description: task.description,
    assignedTo: task.assignedTo ? normalizeUser(task.assignedTo) : undefined,
    priority: task.priority || "medium",
    status: (statusToColId[task.status] || "todo") as "todo" | "in-progress" | "done",
    dueDate: task.dueDate,
    labels: task.labels || [],
    comments: (task.comments || []).map((comment: any) => ({
      id: comment._id || comment.id || `comment-${Date.now()}-${Math.random()}`,
      content: comment.content || "",
      author: normalizeUser(comment.user || comment.author) || {
        id: "unknown",
        name: "Unknown User",
        email: "",
        role: "user",
        avatar: "",
        createdAt: comment.createdAt || new Date().toISOString(),
      },
      createdAt: comment.createdAt || new Date().toISOString(),
    })),
    createdBy: normalizeUser(task.createdBy) || {
      id: "unknown",
      name: "Unknown User", 
      email: "",
      role: "user",
      avatar: "",
      createdAt: task.createdAt || new Date().toISOString(),
    },
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    project: task.project ? {
      id: task.project._id || task.project.id,
      _id: task.project._id,
      name: task.project.name || "Unknown Project",
      description: task.project.description || "",
    } : undefined,
  };
};

function groupTasksToBoard(tasks: Task[], projectId: string): Board {
  const columns: Column[] = [
    { id: "todo", title: "To Do", order: 0, tasks: [] },
    { id: "in-progress", title: "In Progress", order: 1, tasks: [] },
    { id: "done", title: "Done", order: 2, tasks: [] },
  ];

  for (const task of tasks) {
    // task.status is already normalized to "todo", "in-progress", "done"
    const colId = task.status || "todo";
    const col = columns.find((c) => c.id === colId);
    if (col) col.tasks.push(task);
  }
  return { id: projectId, projectId, columns };
}

export const taskService = {
  async getBoard(projectId: string): Promise<Board> {
    const token = authService.getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
      headers,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch tasks");
    let tasks: any[] = await res.json();
    
    // Normalize all tasks before grouping them
    const normalizedTasks = tasks.map((task: any) => normalizeTask(task));
    
    return groupTasksToBoard(normalizedTasks, projectId);
  },

  async getAllTasks(): Promise<Task[]> {
    const token = authService.getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/tasks`, {
      headers,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch tasks");
    let tasks: any[] = await res.json();
    
    // Use the normalizeTask function to properly normalize all task data
    const normalizedTasks = tasks.map((task: any) => normalizeTask(task));
    
    return normalizedTasks;
  },

  async createTask(projectId: string, columnId: string, data: CreateTaskData): Promise<Task> {
    const token = authService.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    // Map columnId to backend status
    const statusMap: Record<string, string> = {
      "todo": "To Do",
      "in-progress": "In Progress",
      "done": "Done"
    };
    const status = statusMap[columnId] || "To Do";
    const payload: any = {
      ...data,
      status,
    };
    if (data.assignedToId) {
      if (data.assignedToId === "unassigned") {
        payload.assignedTo = "unassigned"; // Send "unassigned" for backend validation
      } else {
        payload.assignedTo = data.assignedToId;
      }
    }
    delete payload.assignedToId;
    
    console.log("Creating task with payload:", payload);
    
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Task creation failed:", errorData);
      throw new Error(errorData.message || "Failed to create task");
    }
    
    const rawTask = await res.json();
    const task = { ...rawTask, id: rawTask.id || rawTask._id };
    console.log("Task created successfully:", task);
    return task;
  },

  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    const token = authService.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    // Prepare payload for backend
    const payload: any = { ...data };
    
    // Map frontend status to backend status format
    const statusMap: Record<string, string> = {
      "todo": "To Do",
      "in-progress": "In Progress", 
      "done": "Done"
    };
    
    if (data.status) {
      payload.status = statusMap[data.status] || data.status;
    }
    
    // Handle assignedTo field properly
    if (data.assignedToId) {
      if (data.assignedToId === "unassigned") {
        payload.assignedTo = null; // Remove assignment
      } else {
        payload.assignedTo = data.assignedToId; // Set assignment
      }
      delete payload.assignedToId; // Remove from payload
    }
    
    console.log("Updating task with payload:", payload);
    
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Task update failed:", errorData);
      throw new Error(errorData.message || "Failed to update task");
    }
    
    const rawTask = await res.json();
    // Normalize status and assignedTo
    const reverseStatusMap = {
      "To Do": "todo",
      "In Progress": "in-progress",
      "Done": "done"
    };
    const task = {
      ...rawTask,
      id: rawTask.id || rawTask._id,
      status: reverseStatusMap[String(rawTask.status) as keyof typeof reverseStatusMap] || rawTask.status,
      assignedTo: rawTask.assignedTo && typeof rawTask.assignedTo === 'object' ? {
        ...rawTask.assignedTo,
        id: rawTask.assignedTo.id || rawTask.assignedTo._id,
        _id: rawTask.assignedTo._id || rawTask.assignedTo.id,
      } : undefined
    };
    console.log("Task updated successfully:", task);
    return task;
  },

  async deleteTask(taskId: string): Promise<void> {
    const token = authService.getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete task");
  },

  async addComment(taskId: string, content: string, authorId: string): Promise<Comment[]> {
    const token = authService.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    // Backend returns the full comments array
    return await res.json();
  },
};
