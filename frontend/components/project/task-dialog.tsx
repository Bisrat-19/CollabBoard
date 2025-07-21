"use client"

import { useState } from "react"
import type { Task, User, UpdateTaskData } from "@/types"
import { taskService } from "@/services/task-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, UserIcon } from "lucide-react"
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

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const updateData: UpdateTaskData = {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        status: editedTask.status,
        dueDate: editedTask.dueDate,
        assignedToId: editedTask.assignedTo?.id,
        labels: editedTask.labels,
      }

      const updatedTask = await taskService.updateTask(task.id, updateData)
      onTaskUpdated(updatedTask)

      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
      })
    } catch (error) {
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
    setEditedTask(updatedTask)
    onTaskUpdated(updatedTask)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => setEditedTask((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedTask.description}
                onChange={(e) =>
                  setEditedTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labels">Labels</Label>
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
              <div className="flex flex-wrap gap-1 mt-2">
                {editedTask.labels.map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-4">
              <TaskComments task={editedTask} onCommentAdded={handleCommentAdded} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editedTask.status}
                onValueChange={(value: "todo" | "in-progress" | "done") =>
                  setEditedTask((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setEditedTask((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select
                value={editedTask.assignedTo?.id || "unassigned"}
                onValueChange={(value) => {
                  const member = projectMembers.find((m) => m.id === value)
                  setEditedTask((prev) => ({ ...prev, assignedTo: member }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee">
                    {editedTask.assignedTo ? (
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={editedTask.assignedTo.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs">
                            {editedTask.assignedTo.name.charAt(0)}
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
                  {projectMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs">
                            {member.name.charAt(0)}
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

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
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

            <div className="space-y-2">
              <Label>Created By</Label>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={editedTask.createdBy.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{editedTask.createdBy.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{editedTask.createdBy.name}</p>
                  <p className="text-xs text-gray-500">{new Date(editedTask.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
