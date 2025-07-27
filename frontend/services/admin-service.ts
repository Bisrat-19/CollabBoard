import type { User } from "@/types"

interface CreateUserData {
  name: string
  email: string
  password: string
  role: "admin" | "user"
}

interface UpdateUserData {
  name?: string
  email?: string
  role?: "admin" | "user"
  isActive?: boolean
}

class AdminService {
  private API_BASE = "http://localhost:5000/api/admin"

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${this.API_BASE}/users`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to fetch users")
      }

      const users = await response.json()
      return users.map((user: any) => ({
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        isActive: user.isActive !== false, // Default to true if not specified
      }))
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  }

  async getAllProjects(): Promise<any[]> {
    const response = await fetch(`${this.API_BASE}/projects`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch projects")
    }

    const projects = await response.json()
    return projects.map((project: any) => ({
      _id: project._id,
      id: project._id,
      name: project.name,
      description: project.description,
      ownerId: project.createdBy,
      members: project.members.map((member: any) => ({
        id: member._id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: member.role,
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }))
  }

  async deleteProject(projectId: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/projects/${projectId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete project")
    }
  }

  async updateProject(projectId: string, data: any): Promise<any> {
    const response = await fetch(`${this.API_BASE}/projects/${projectId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update project")
    }

    const project = await response.json()
    return {
      _id: project._id,
      id: project._id,
      name: project.name,
      description: project.description,
      ownerId: project.createdBy,
      members: project.members.map((member: any) => ({
        id: member._id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: member.role,
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }
  }

  async createProject(data: any): Promise<any> {
    const response = await fetch(`${this.API_BASE}/projects`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create project")
    }

    const project = await response.json()
    return {
      _id: project._id,
      id: project._id,
      name: project.name,
      description: project.description,
      ownerId: project.createdBy,
      members: project.members.map((member: any) => ({
        id: member._id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: member.role,
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }
  }

  // Create a new user
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE}/users`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create user")
      }

      const result = await response.json()
      return {
        id: result.user._id || result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        avatar: result.user.avatar,
        createdAt: result.user.createdAt,
        isActive: result.user.isActive !== false,
      }
    } catch (error) {
      console.error("Error creating user:", error)
      throw error
    }
  }

  // Update an existing user
  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update user")
      }

      const result = await response.json()
      return {
        id: result.user._id || result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        avatar: result.user.avatar,
        createdAt: result.user.createdAt,
        isActive: result.user.isActive !== false,
      }
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  }

  // Delete a user
  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  }

  // Get system statistics
  async getSystemStats(): Promise<{
    totalUsers: number
    totalProjects: number
    activeUsers: number
    systemHealth: string
  }> {
    try {
      // For now, we'll return mock data since the backend doesn't have this endpoint
      // In a real implementation, you would call the backend API
      return {
        totalUsers: 0,
        totalProjects: 0,
        activeUsers: 0,
        systemHealth: "healthy",
      }
    } catch (error) {
      console.error("Error fetching system stats:", error)
      throw error
    }
  }

  // Export system data
  async exportSystemData(): Promise<Blob> {
    try {
      const response = await fetch(`${this.API_BASE}/export`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to export data")
      }

      return await response.blob()
    } catch (error) {
      console.error("Error exporting data:", error)
      throw error
    }
  }

  // Update system settings
  async updateSystemSettings(settings: {
    maintenanceMode: boolean
    allowRegistration: boolean
    maxProjectsPerUser: number
    storageLimit: number
  }): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/settings`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update system settings")
      }
    } catch (error) {
      console.error("Error updating system settings:", error)
      throw error
    }
  }

  // Get system settings
  async getSystemSettings(): Promise<{
    maintenanceMode: boolean
    allowRegistration: boolean
    maxProjectsPerUser: number
    storageLimit: number
  }> {
    try {
      const response = await fetch(`${this.API_BASE}/settings`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to fetch system settings")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching system settings:", error)
      // Return default settings if API call fails
      return {
        maintenanceMode: false,
        allowRegistration: true,
        maxProjectsPerUser: 10,
        storageLimit: 100,
      }
    }
  }
}

export const adminService = new AdminService() 