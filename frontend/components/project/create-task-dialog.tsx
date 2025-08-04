"use client"

import type React from "react"

import { useState } from "react"
import type { Task, User, CreateTaskData } from "@/types"
import { taskService } from "@/services/task-service"
import { useAuth } from "@/contexts/auth-context"
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
import { Loader2, UserIcon, Calendar, Tag, AlertCircle, Plus, Target, Clock, UserCheck, Sparkles, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated: (task: Task) => void
  projectId: string
  columnId: string
  projectMembers: User[]
  project?: any // Add project prop to check creator
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
  projectId,
  columnId,
  projectMembers,
  project,
}: CreateTaskDialogProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateTaskData>({
    title: "",
    description: "",
    priority: "medium",
    assignedToId: "unassigned",
    dueDate: undefined,
    labels: [],
  })
  const [labelsInput, setLabelsInput] = useState("")

  // Check if current user can assign tasks (project creator or admin)
  const canAssignTasks = () => {
    if (!user || !project) return false
    
    // Check if user is admin
    if (user.role === 'admin') return true
    
    // Check if user is project creator
    const currentUserId = user.id || user._id
    const projectCreatorId = project.createdBy || project.ownerId
    
    return currentUserId && projectCreatorId && 
      currentUserId.toString() === projectCreatorId.toString()
  }

  const isAuthorizedToAssign = canAssignTasks()

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
       setLabelsInput("")

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "🔥"
      case "medium": return "⚡"
      case "low": return "🌱"
      default: return "📋"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Plus className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold">Create New Task</DialogTitle>
          </div>
          <DialogDescription className="text-blue-100 text-sm leading-relaxed">
            Add a new task to your project board with all the details needed to get started.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Task Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="What needs to be done?"
                required
                className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Provide more details about this task, requirements, or any specific instructions..."
                rows={3}
                className="min-h-[100px] text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 resize-none"
              />
            </div>

            {/* Priority and Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Priority Level
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="low" value="low">Low Priority</SelectItem>
                    <SelectItem key="medium" value="medium">Medium Priority</SelectItem>
                    <SelectItem key="high" value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                  <span className="text-lg">{getPriorityIcon(formData.priority)}</span>
                  <Badge className={`text-xs font-medium ${getPriorityColor(formData.priority)}`}>
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  Assign To
                  {!isAuthorizedToAssign && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </Label>
                
                {isAuthorizedToAssign ? (
                  <Select
                    value={formData.assignedToId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, assignedToId: value }))}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                      <SelectValue placeholder="Select team member">
                        {formData.assignedToId && formData.assignedToId !== "unassigned" && (
                          <div className="flex items-center">
                            {(() => {
                              const member = projectMembers.find((m) => m.id === formData.assignedToId)
                              return member ? (
                                <>
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-semibold">
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
                          <div className="h-6 w-6 mr-2 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="h-3 w-3 text-gray-500" />
                          </div>
                          <span className="text-sm">Unassigned</span>
                        </div>
                      </SelectItem>
                      {projectMembers.map((member, idx) => (
                        <SelectItem key={member.id || `member-${idx}`} value={member.id}>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-semibold">
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
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-gray-900">Unassigned</div>
                        <div className="text-xs text-gray-500">Task will be created without assignment</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Only project creators and admins can assign team members to tasks
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-3">
              <Label htmlFor="dueDate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
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
                className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {/* Labels */}
            <div className="space-y-3">
              <Label htmlFor="labels" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-600" />
                Labels (Optional)
              </Label>
                             <Input
                 id="labels"
                 value={labelsInput}
                 onChange={(e) => {
                   const inputValue = e.target.value;
                   setLabelsInput(inputValue);
                   
                   // Process labels from input
                   const labels = inputValue
                     .split(",")
                     .map((l) => l.trim())
                     .filter(Boolean);
                   
                   setFormData((prev) => ({
                     ...prev,
                     labels,
                   }));
                 }}
                 placeholder="Enter labels separated by commas (e.g., bug, feature, design)"
                 className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
               />
              {formData.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  {formData.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="bg-blue-100 text-blue-800 text-xs font-medium">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Task Preview */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Task Preview:</span>
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Status: <span className="font-medium text-gray-700">To Do</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Priority: <span className="font-medium text-gray-700">{formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Assigned: <span className="font-medium text-gray-700">
                    {formData.assignedToId === "unassigned" ? "Unassigned" : 
                     projectMembers.find(m => m.id === formData.assignedToId)?.name || "Unknown"}
                  </span></span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto border-2 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.title.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-11 px-6 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
