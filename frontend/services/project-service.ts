import type { Project } from "@/types"
import { authService } from "./auth-service"
import { getApiUrl } from "@/lib/config"

class ProjectService {
  private API_BASE = getApiUrl("/projects")

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
    
    const projects = await res.json()
    console.log('ProjectService: Raw projects from backend:', projects)
    
    // Normalize all projects to ensure consistent structure
    return projects.map((project: any) => ({
      _id: project._id,
      id: project.id || project._id,
      name: project.name,
      description: project.description,
      members: project.members || [],
      ownerId: project.ownerId,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }))
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

    const project = await res.json()
    console.log('ProjectService: Created project response:', project)
    
    // Normalize the response to ensure consistent structure
    return {
      _id: project._id,
      id: project.id || project._id,
      name: project.name,
      description: project.description,
      members: project.members || [],
      ownerId: project.ownerId,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }
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

    const project = await res.json()
    console.log('ProjectService: Updated project response:', project)
    
    // Normalize the response to ensure consistent structure
    return {
      _id: project._id,
      id: project.id || project._id,
      name: project.name,
      description: project.description,
      members: project.members || [],
      ownerId: project.ownerId,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }
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

  async getCollaboratingUsers(): Promise<any[]> {
    const res = await fetch(`${this.API_BASE}/collaborating-users`, {
      headers: await this.getAuthHeaders(),
    })

    if (!res.ok) throw new Error("Failed to fetch collaborating users")
    return res.json()
  }
}

export const projectService = new ProjectService()
