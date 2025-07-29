import type { User } from "@/types"
import { getApiUrl } from "@/lib/config"

class AuthService {
  private currentUser: User | null = null

  private API_BASE = getApiUrl("/auth")

  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${this.API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Login failed")
    }

    const data = await response.json()
    this.currentUser = data.user
    localStorage.setItem("user", JSON.stringify(data.user))
    localStorage.setItem("token", data.token)
    return data.user
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const response = await fetch(`${this.API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, role: "user" }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || "Registration failed")
    }

    const data = await response.json()
    this.currentUser = data.user
    localStorage.setItem("user", JSON.stringify(data.user))
    localStorage.setItem("token", data.token)
    return data.user
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("token")
    if (!token) return null

    const response = await fetch(`${this.API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const user = await response.json()
    this.currentUser = user
    return user
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
