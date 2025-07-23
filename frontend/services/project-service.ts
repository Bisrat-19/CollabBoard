import type { Project } from "@/types"
import { authService } from "./auth-service"

class ProjectService {
  private API_BASE = "http://localhost:5000/api/projects"

  private async getAuthHeaders() {
    const token = authService.getToken()
    if (!token) throw new Error("Unauthorized")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  async getProjects(): Promise<Project[]> {
    const res = await fetch(this.API_BASE, {
      headers: await this.getAuthHeaders(),
    })

    if (!res.ok) throw new Error("Failed to fetch projects")
    return res.json()
  }

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${this.API_BASE}/${id}`, {
      headers: await this.getAuthHeaders(),
    })

    if (!res.ok) throw new Error("Project not found")
    return res.json()
  }

  async createProject(data: { name: string; description: string }): Promise<Project> {
    const res = await fetch(this.API_BASE, {
      method: "POST",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Failed to create project")
    }

    return res.json()
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${this.API_BASE}/${id}`, {
      method: "PUT",
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Failed to update project")
    }

    return res.json()
  }

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`${this.API_BASE}/${id}`, {
      method: "DELETE",
      headers: await this.getAuthHeaders(),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || "Failed to delete project")
    }
  }
}

export const projectService = new ProjectService()
