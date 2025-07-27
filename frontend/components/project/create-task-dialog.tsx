"use client"

import type React from "react"

import { useState } from "react"
import type { Task, User, CreateTaskData } from "@/types"
import { taskService } from "@/services/task-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, UserIcon, Calendar, Tag, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated: (task: Task) => void
  projectId: string
  columnId: string
  projectMembers: User[]
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
  projectId,
  columnId,
  projectMembers,
}: CreateTaskDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateTaskData>({
    title: "",
    description: "",
    priority: "medium",
    labels: [],
    assignedToId: "unassigned",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const task = await taskService.createTask(projectId, columnId, formData)
      onTaskCreated(task)

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        labels: [],
        assignedToId: "unassigned",
      })

      // Show specific message for assignment
      const assignedMember = projectMembers.find(m => m.id === formData.assignedToId);
      const assignmentMessage = assignedMember 
        ? ` and assigned to ${assignedMember.name}`
        : "";

      toast({
        title: "Task created!",
        description: `${task.title} has been created successfully${assignmentMessage}.`,
      })
    } catch (error) {
      console.error("Create task error:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200"
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low": return "text-green-600 bg-green-50 border-green-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">Add a new task to the project board with all necessary details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:gap-6 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
                className="text-base sm:text-lg"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the task in detail..."
                rows={3}
                className="min-h-[80px] sm:min-h-[100px]"
              />
            </div>

            {/* Priority and Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="low" value="low">Low</SelectItem>
                    <SelectItem key="medium" value="medium">Medium</SelectItem>
                    <SelectItem key="high" value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Badge className={`w-full justify-center text-xs sm:text-sm ${getPriorityColor(formData.priority)}`}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Assign To</Label>
                <Select
                  value={formData.assignedToId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, assignedToId: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select team member">
                      {formData.assignedToId && formData.assignedToId !== "unassigned" && (
                        <div className="flex items-center">
                          {(() => {
                            const member = projectMembers.find((m) => m.id === formData.assignedToId)
                            return member ? (
                              <>
                                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 mr-2">
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-semibold">
                                    {member?.name?.charAt(0)?.toUpperCase() ?? "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate">{member.name}</span>
                              </>
                            ) : null
                          })()}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="unassigned" value="unassigned">
                      <div className="flex items-center">
                        <div className="h-5 w-5 sm:h-6 sm:w-6 mr-2 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-3 w-3 text-gray-500" />
                        </div>
                        <span className="text-sm">Unassigned</span>
                      </div>
                    </SelectItem>
                    {projectMembers.map((member, idx) => (
                      <SelectItem key={member.id || `member-${idx}`} value={member.id}>
                        <div className="flex items-center">
                          <Avatar className="h-5 w-5 sm:h-6 sm:w-6 mr-2">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-semibold">
                              {member?.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{member.name}</div>
                            <div className="text-xs text-gray-500 truncate">{member.email}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date (Optional)
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate ? formData.dueDate.split("T")[0] : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: e.target.value || undefined,
                  }))
                }
              />
            </div>

            {/* Labels */}
            <div className="space-y-2">
              <Label htmlFor="labels" className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Labels (Optional)
              </Label>
              <Input
                id="labels"
                value={formData.labels.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
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
                {formData.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.title.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
