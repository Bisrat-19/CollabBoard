import type { User } from "@/types"

// Mock data for development
const mockUsers: User[] = [
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
]

class AuthService {
  private currentUser: User | null = null

  async login(email: string, password: string): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // In real app, validate password here
    this.currentUser = user
    localStorage.setItem("user", JSON.stringify(user))
    localStorage.setItem("token", "mock-jwt-token")

    return user
  }

  async register(name: string, email: string, password: string): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      throw new Error("User already exists")
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: "user",
      avatar: "/placeholder.svg?height=40&width=40",
      createdAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)
    this.currentUser = newUser
    localStorage.setItem("user", JSON.stringify(newUser))
    localStorage.setItem("token", "mock-jwt-token")

    return newUser
  }

  async getCurrentUser(): Promise<User | null> {
    const stored = localStorage.getItem("user")
    if (stored) {
      this.currentUser = JSON.parse(stored)
      return this.currentUser
    }
    return null
  }

  logout(): void {
    this.currentUser = null
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }
}

export const authService = new AuthService()
