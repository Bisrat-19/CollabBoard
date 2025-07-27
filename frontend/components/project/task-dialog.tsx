"use client"

import { useState, useEffect } from "react"
import type { Task, User, UpdateTaskData } from "@/types"
import { taskService } from "@/services/task-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, UserIcon, Calendar, Tag, MessageCircle, Clock } from "lucide-react"
import { TaskComments } from "./task-comments"

interface TaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated: (task: Task) => void
  projectMembers: User[]
}

export function TaskDialog({ task, open, onOpenChange, onTaskUpdated, projectMembers }: TaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [editedTask, setEditedTask] = useState<Task>(task)
  const { toast } = useToast()

  // Update editedTask when task prop changes
  useEffect(() => {
    if (task) {
      setEditedTask(task)
    }
  }, [task])

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const statusMap: Record<string, string> = {
        "todo": "To Do",
        "in-progress": "In Progress",
        "done": "Done"
      };
      
      const updateData: UpdateTaskData = {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        status: statusMap[editedTask.status] as any || "To Do",
        dueDate: editedTask.dueDate,
        assignedToId: editedTask.assignedTo?.id || "unassigned",
        labels: editedTask.labels,
      }

      const updatedTask = await taskService.updateTask(task.id, updateData)
      
      // Convert backend status back to frontend format for the board
      const reverseStatusMap: Record<string, "todo" | "in-progress" | "done"> = {
        "To Do": "todo",
        "In Progress": "in-progress",
        "Done": "done"
      };
      
      const taskWithFrontendStatus: Task = {
        ...updatedTask,
        status: reverseStatusMap[updatedTask.status] || "todo"
      };
      
      onTaskUpdated(taskWithFrontendStatus)

      // Show specific message for assignment changes
      const assignmentMessage = editedTask.assignedTo 
        ? `Task assigned to ${editedTask.assignedTo.name}`
        : "Task unassigned";
      
      toast({
        title: "Task updated",
        description: `Task has been updated successfully. ${assignmentMessage}`,
      })
    } catch (error) {
      console.error("Task update error:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentAdded = (updatedTask: Task) => {
    // Convert backend status to frontend format if needed
    const reverseStatusMap: Record<string, "todo" | "in-progress" | "done"> = {
      "To Do": "todo",
      "In Progress": "in-progress",
      "Done": "done"
    };
    
    const taskWithFrontendStatus: Task = {
      ...updatedTask,
      status: reverseStatusMap[updatedTask.status] || "todo"
    };
    
    setEditedTask(taskWithFrontendStatus)
    onTaskUpdated(taskWithFrontendStatus)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200"
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low": return "text-green-600 bg-green-50 border-green-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "text-blue-600 bg-blue-50 border-blue-200"
      case "in-progress": return "text-orange-600 bg-orange-50 border-orange-200"
      case "done": return "text-green-600 bg-green-50 border-green-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Task Details</DialogTitle>
          <DialogDescription>View and edit the details of this task, including comments and assignments.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => setEditedTask((prev) => ({ ...prev, title: e.target.value }))}
                className="text-lg font-medium"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={editedTask.description}
                onChange={(e) =>
                  setEditedTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={6}
                placeholder="Describe the task in detail..."
              />
            </div>

            {/* Labels */}
            <div className="space-y-2">
              <Label htmlFor="labels" className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Labels
              </Label>
              <Input
                id="labels"
                value={editedTask.labels.join(", ")}
                onChange={(e) =>
                  setEditedTask((prev) => ({
                    ...prev,
                    labels: e.target.value
                      .split(",")
                      .map((l) => l.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Enter labels separated by commas"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {editedTask.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="bg-purple-100 text-purple-800">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold">Comments</h3>
              </div>
              <TaskComments task={editedTask} onCommentAdded={handleCommentAdded} />
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={editedTask.status}
                onValueChange={(value: "todo" | "in-progress" | "done") =>
                  setEditedTask((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <Badge className={`w-full justify-center ${getStatusColor(editedTask.status)}`}>
                {editedTask.status === "todo" ? "To Do" : 
                 editedTask.status === "in-progress" ? "In Progress" : "Done"}
              </Badge>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setEditedTask((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Badge className={`w-full justify-center ${getPriorityColor(editedTask.priority)}`}>
                {editedTask.priority.charAt(0).toUpperCase() + editedTask.priority.slice(1)}
              </Badge>
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Assigned To</Label>
              <Select
                value={editedTask.assignedTo?.id || "unassigned"}
                onValueChange={(value) => {
                  if (value === "unassigned") {
                    setEditedTask((prev) => ({ ...prev, assignedTo: undefined }))
                  } else {
                    const member = projectMembers.find((m) => m.id === value)
                    setEditedTask((prev) => ({ ...prev, assignedTo: member }))
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select assignee">
                    {editedTask.assignedTo ? (
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-semibold">
                            {editedTask.assignedTo.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{editedTask.assignedTo.name}</div>
                          <div className="text-xs text-gray-500">{editedTask.assignedTo.email}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        <div className="h-6 w-6 mr-2 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-3 w-3" />
                        </div>
                        Unassigned
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <div className="flex items-center">
                      <div className="h-6 w-6 mr-2 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="h-3 w-3 text-gray-500" />
                      </div>
                      Unassigned
                    </div>
                  </SelectItem>
                  {projectMembers.map((member, idx) => (
                    <SelectItem key={member.id || `member-${idx}`} value={member.id}>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs">
                            {member?.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={editedTask.dueDate ? editedTask.dueDate.split("T")[0] : ""}
                onChange={(e) =>
                  setEditedTask((prev) => ({
                    ...prev,
                    dueDate: e.target.value ? e.target.value : undefined,
                  }))
                }
              />
            </div>

            {/* Created By */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Created By</Label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold">
                    {editedTask.createdBy.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{editedTask.createdBy.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(editedTask.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={isLoading} 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
