import type { Task, CreateTaskData, UpdateTaskData, Comment, Board, Column } from "@/types"

// Mock board data
const mockBoard: Board = {
  id: "1",
  projectId: "1",
  columns: [
    {
      id: "todo",
      title: "To Do",
      order: 0,
      tasks: [
        {
          id: "1",
          title: "Design Homepage Layout",
          description: "Create wireframes and mockups for the new homepage design",
          priority: "high",
          status: "todo",
          dueDate: "2024-02-15",
          labels: ["design", "frontend"],
          comments: [],
          createdBy: {
            id: "1",
            name: "John Doe",
            email: "admin@collabboard.com",
            role: "admin",
            avatar: "/placeholder.svg?height=40&width=40",
            createdAt: "2024-01-01T00:00:00Z",
          },
          assignedTo: {
            id: "2",
            name: "Jane Smith",
            email: "user@collabboard.com",
            role: "user",
            avatar: "/placeholder.svg?height=40&width=40",
            createdAt: "2024-01-01T00:00:00Z",
          },
          createdAt: "2024-01-20T00:00:00Z",
          updatedAt: "2024-01-20T00:00:00Z",
        },
        {
          id: "2",
          title: "Set up Development Environment",
          description: "Configure development tools and dependencies",
          priority: "medium",
          status: "todo",
          labels: ["setup", "development"],
          comments: [],
          createdBy: {
            id: "1",
            name: "John Doe",
            email: "admin@collabboard.com",
            role: "admin",
            avatar: "/placeholder.svg?height=40&width=40",
            createdAt: "2024-01-01T00:00:00Z",
          },
          createdAt: "2024-01-21T00:00:00Z",
          updatedAt: "2024-01-21T00:00:00Z",
        },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      order: 1,
      tasks: [
        {
          id: "3",
          title: "Implement User Authentication",
          description: "Build login and registration functionality",
          priority: "high",
          status: "in-progress",
          dueDate: "2024-02-10",
          labels: ["backend", "security"],
          comments: [
            {
              id: "1",
              content: "Started working on the JWT implementation",
              author: {
                id: "2",
                name: "Jane Smith",
                email: "user@collabboard.com",
                role: "user",
                avatar: "/placeholder.svg?height=40&width=40",
                createdAt: "2024-01-01T00:00:00Z",
              },
              createdAt: "2024-01-22T10:30:00Z",
            },
          ],
          createdBy: {
            id: "1",
            name: "John Doe",
            email: "admin@collabboard.com",
            role: "admin",
            avatar: "/placeholder.svg?height=40&width=40",
            createdAt: "2024-01-01T00:00:00Z",
          },
          assignedTo: {
            id: "2",
            name: "Jane Smith",
            email: "user@collabboard.com",
            role: "user",
            avatar: "/placeholder.svg?height=40&width=40",
            createdAt: "2024-01-01T00:00:00Z",
          },
          createdAt: "2024-01-19T00:00:00Z",
          updatedAt: "2024-01-22T10:30:00Z",
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      order: 2,
      tasks: [
        {
          id: "4",
          title: "Project Setup and Planning",
          description: "Initial project setup and requirement gathering",
          priority: "low",
          status: "done",
          labels: ["planning"],
          comments: [],
          createdBy: {
            id: "1",
            name: "John Doe",
            email: "admin@collabboard.com",
            role: "admin",
            avatar: "/placeholder.svg?height=40&width=40",
            createdAt: "2024-01-01T00:00:00Z",
          },
          createdAt: "2024-01-15T00:00:00Z",
          updatedAt: "2024-01-18T00:00:00Z",
        },
      ],
    },
  ],
}

class TaskService {
  async getBoard(projectId: string): Promise<Board> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockBoard
  }

  async createTask(projectId: string, columnId: string, data: CreateTaskData): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const newTask: Task = {
      id: Date.now().toString(),
      ...data,
      status: columnId as "todo" | "in-progress" | "done",
      comments: [],
      createdBy: {
        id: "1",
        name: "John Doe",
        email: "admin@collabboard.com",
        role: "admin",
        avatar: "/placeholder.svg?height=40&width=40",
        createdAt: "2024-01-01T00:00:00Z",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const column = mockBoard.columns.find((c) => c.id === columnId)
    if (column) {
      column.tasks.push(newTask)
    }

    return newTask
  }

  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    let task: Task | undefined
    let oldColumn: Column | undefined
    let newColumn: Column | undefined

    // Find the task
    for (const column of mockBoard.columns) {
      const foundTask = column.tasks.find((t) => t.id === taskId)
      if (foundTask) {
        task = foundTask
        oldColumn = column
        break
      }
    }

    if (!task || !oldColumn) {
      throw new Error("Task not found")
    }

    // Update task data
    Object.assign(task, data, { updatedAt: new Date().toISOString() })

    // Move task if status changed
    if (data.status && data.status !== task.status) {
      newColumn = mockBoard.columns.find((c) => c.id === data.status)
      if (newColumn && newColumn !== oldColumn) {
        oldColumn.tasks = oldColumn.tasks.filter((t) => t.id !== taskId)
        newColumn.tasks.push(task)
      }
    }

    return task
  }

  async deleteTask(taskId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    for (const column of mockBoard.columns) {
      const taskIndex = column.tasks.findIndex((t) => t.id === taskId)
      if (taskIndex !== -1) {
        column.tasks.splice(taskIndex, 1)
        return
      }
    }

    throw new Error("Task not found")
  }

  async addComment(taskId: string, content: string, authorId: string): Promise<Comment> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    let task: Task | undefined
    for (const column of mockBoard.columns) {
      task = column.tasks.find((t) => t.id === taskId)
      if (task) break
    }

    if (!task) {
      throw new Error("Task not found")
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: {
        id: "2",
        name: "Jane Smith",
        email: "user@collabboard.com",
        role: "user",
        avatar: "/placeholder.svg?height=40&width=40",
        createdAt: "2024-01-01T00:00:00Z",
      },
      createdAt: new Date().toISOString(),
    }

    task.comments.push(newComment)
    task.updatedAt = new Date().toISOString()

    return newComment
  }
}

export const taskService = new TaskService()
