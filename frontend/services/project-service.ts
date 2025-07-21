import type { Project } from "@/types"

// Mock data
const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete redesign of the company website with modern UI/UX",
    ownerId: "1",
    members: [
      {
        id: "1",
        name: "John Doe",
        email: "admin@collabboard.com",
        role: "admin",
        avatar: "/placeholder.svg?height=40&width=40",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "user@collabboard.com",
        role: "user",
        avatar: "/placeholder.svg?height=40&width=40",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Develop a cross-platform mobile application",
    ownerId: "1",
    members: [
      {
        id: "1",
        name: "John Doe",
        email: "admin@collabboard.com",
        role: "admin",
        avatar: "/placeholder.svg?height=40&width=40",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ],
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z",
  },
]

class ProjectService {
  async getProjects(): Promise<Project[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockProjects
  }

  async getProject(id: string): Promise<Project | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockProjects.find((p) => p.id === id) || null
  }

  async createProject(data: { name: string; description: string; ownerId: string }): Promise<Project> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newProject: Project = {
      id: Date.now().toString(),
      ...data,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockProjects.push(newProject)
    return newProject
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const projectIndex = mockProjects.findIndex((p) => p.id === id)
    if (projectIndex === -1) {
      throw new Error("Project not found")
    }

    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return mockProjects[projectIndex]
  }

  async deleteProject(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const projectIndex = mockProjects.findIndex((p) => p.id === id)
    if (projectIndex === -1) {
      throw new Error("Project not found")
    }

    mockProjects.splice(projectIndex, 1)
  }
}

export const projectService = new ProjectService()
