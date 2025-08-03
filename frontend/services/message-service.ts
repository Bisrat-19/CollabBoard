import { getApiUrl } from "@/lib/config";
import type { Message } from "@/types";

class MessageService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getProjectMessages(projectId: string): Promise<Message[]> {
    const response = await fetch(getApiUrl(`/messages/project/${projectId}`), {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch messages");
    }

    return response.json();
  }

  async sendMessage(projectId: string, content: string): Promise<Message> {
    const response = await fetch(getApiUrl(`/messages/project/${projectId}`), {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send message");
    }

    const message = await response.json();
    return message;
  }

  async updateMessage(messageId: string, content: string): Promise<Message> {
    const response = await fetch(getApiUrl(`/messages/${messageId}`), {
      method: "PUT",
      headers: this.getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update message");
    }

    const message = await response.json();
    return message;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const response = await fetch(getApiUrl(`/messages/${messageId}`), {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete message");
    }
  }
}

export const messageService = new MessageService(); 