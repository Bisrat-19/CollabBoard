"use client"

import { useState } from "react"
import type { Task } from "@/types"
import { taskService } from "@/services/task-service"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, Send, Loader2 } from "lucide-react"

interface TaskCommentsProps {
  task: Task
  onCommentAdded: (task: Task) => void
}

export function TaskComments({ task, onCommentAdded }: TaskCommentsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Normalize comments to always have an 'author' property
  const normalizedComments = task.comments.map((comment) => ({
    ...comment,
    author: comment.author || comment.user,
  }))

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    if (!task.id) {
      toast({
        title: "Error",
        description: "Task ID is missing. Cannot add comment.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Backend returns the full comments array
      const comments = await taskService.addComment(task.id, newComment, user.id);

      const updatedTask = {
        ...task,
        comments, // replace with full array
        updatedAt: new Date().toISOString(),
      };

      onCommentAdded(updatedTask);
      setNewComment("");

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5 text-gray-500" />
        <h3 className="font-medium">Comments ({task.comments.length})</h3>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {normalizedComments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          normalizedComments.map((comment, idx) => (
            <div key={comment.id ?? comment._id ?? idx} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-semibold">
                  {comment.author?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{comment.author.name}</span>
                  <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment */}
      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <Button onClick={handleAddComment} disabled={!newComment.trim() || isLoading || !task.id} size="sm">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Add Comment
        </Button>
      </div>
    </div>
  )
}
