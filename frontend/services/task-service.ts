import type { Task, CreateTaskData, UpdateTaskData, Comment, Board, Column } from "@/types"
import { authService } from "./auth-service";

const API_BASE = "http://localhost:5000/api";

function groupTasksToBoard(tasks: Task[], projectId: string): Board {
  const columns: Column[] = [
    { id: "todo", title: "To Do", order: 0, tasks: [] },
    { id: "in-progress", title: "In Progress", order: 1, tasks: [] },
    { id: "done", title: "Done", order: 2, tasks: [] },
  ];
  // Map backend status to column id using a reverse map
  const statusToColId: Record<string, string> = {
    "To Do": "todo",
    "In Progress": "in-progress",
    "Done": "done",
  };
  for (const task of tasks) {
    const colId = statusToColId[task.status] || "todo";
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
    let tasks: Task[] = await res.json();
    // Map _id to id for all tasks
    tasks = tasks.map((t: any) => ({ ...t, id: t.id || t._id }));
    return groupTasksToBoard(tasks, projectId);
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
    if (data.assignedToId && data.assignedToId !== "unassigned") {
      payload.assignedTo = data.assignedToId;
    }
    delete payload.assignedToId;
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create task");
    const rawTask = await res.json();
    const task = { ...rawTask, id: rawTask.id || rawTask._id };
    return task;
  },

  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    const token = authService.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: "PUT",
      headers,
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update task");
    const rawTask = await res.json();
    const task = { ...rawTask, id: rawTask.id || rawTask._id };
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
