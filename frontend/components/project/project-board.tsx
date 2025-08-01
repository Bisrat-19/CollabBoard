"use client"

import { useState, useEffect } from "react"
import type { Project, Board, Task } from "@/types"
import { taskService } from "@/services/task-service"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Users, Settings, Loader2, Plus, Calendar, TrendingUp, Clock, Menu } from "lucide-react"
import { TaskColumn } from "./task-column"
import { TaskDialog } from "./task-dialog"
import { CreateTaskDialog } from "./create-task-dialog"
import { ManageMembersDialog } from "./manage-members-dialog"
import { ProjectSettingsDialog } from "./project-settings-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProjectBoardProps {
  project: Project
  onBack: () => void
  onTaskUpdated?: () => void
  onProjectUpdated?: (updatedProject: Project) => void
  onProjectDeleted?: () => void
}

export function ProjectBoard({ project, onBack, onTaskUpdated, onProjectUpdated, onProjectDeleted }: ProjectBoardProps) {
  console.log('ProjectBoard: Received props:', { 
    project, 
    hasOnProjectUpdated: !!onProjectUpdated, 
    hasOnProjectDeleted: !!onProjectDeleted 
  })
  const { user } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [createTaskColumn, setCreateTaskColumn] = useState<string>("")
  const [currentProject, setCurrentProject] = useState<Project>(project)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  if (!project || !project.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
          <p className="text-gray-600 mb-4">Please select a project to view its board.</p>
          <Button
            onClick={onBack}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (project && project.id) {
      loadBoard();
    }
  }, [project?.id]);
  
  const loadBoard = async () => {
    if (!project || !project.id) return;
    try {
      const boardData = await taskService.getBoard(project.id);
      setBoard(boardData);
    } catch (error) {
      console.error("Failed to load board:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = (task: Task) => {
    if (!board) return

    setBoard((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === createTaskColumn ? { ...col, tasks: [...col.tasks, task] } : col,
        ),
      }
    })
    setShowCreateTask(false)
    
    // Notify parent component that a task was created
    if (onTaskUpdated) {
      onTaskUpdated();
    }
  }

  const handleTaskUpdated = async (updatedTask: Task) => {
    // Always normalize status and id
    const normalizedStatusMap: Record<string, 'todo' | 'in-progress' | 'done'> = {
      "To Do": "todo",
      "In Progress": "in-progress",
      "Done": "done",
      "todo": "todo",
      "in-progress": "in-progress",
      "done": "done"
    };
    const normalizedId = updatedTask.id;
    const normalizedStatus = normalizedStatusMap[updatedTask.status] || "todo";
    const safeTask: Task = { ...updatedTask, id: normalizedId, status: normalizedStatus };
    setBoard((prev) => {
      if (!prev) return prev;
      const newColumns = prev.columns.map((col) => {
        const filteredTasks = col.tasks.filter((task) => task.id !== normalizedId);
        if (col.id === normalizedStatus) {
          return {
            ...col,
            tasks: [...filteredTasks, safeTask]
          };
        }
        return {
          ...col,
          tasks: filteredTasks
        };
      });
      return {
        ...prev,
        columns: [...newColumns],
      };
    });
    if (onTaskUpdated) {
      onTaskUpdated();
    }
  }

  const handleCreateTask = (columnId: string) => {
    setCreateTaskColumn(columnId)
    setShowCreateTask(true)
  }

  const handleMembersUpdated = (updatedProject: Project) => {
    setCurrentProject(updatedProject)
    setShowMembersDialog(false)
    // Also reload the board to ensure all data is in sync
    loadBoard();
  }

  const handleProjectUpdated = (updatedProject: Project) => {
    console.log('ProjectBoard: handleProjectUpdated called with:', updatedProject)
    setCurrentProject(updatedProject)
    setShowSettingsDialog(false)
    // Notify parent component about the project update
    onProjectUpdated?.(updatedProject)
  }

  const handleProjectDeleted = () => {
    console.log('ProjectBoard: handleProjectDeleted called')
    // Notify parent component about the project deletion
    onProjectDeleted?.()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project board...</p>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Board not found</h3>
          <p className="text-gray-600 mb-4">Unable to load the project board</p>
          <Button
            onClick={onBack}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Calculate task statistics
  const totalTasks = board.columns.reduce((acc, col) => acc + col.tasks.length, 0)
  const completedTasks = board.columns.find((col) => col.id === "done")?.tasks.length || 0
  const inProgressTasks = board.columns.find((col) => col.id === "in-progress")?.tasks.length || 0
  const todoTasks = board.columns.find((col) => col.id === "todo")?.tasks.length || 0
  
  // Calculate completion rate using the same logic as project cards
  let completionRate: number
  if (totalTasks === 0) {
    completionRate = 5 // If no tasks exist, return 5%
  } else if (totalTasks === completedTasks) {
    completionRate = 100 // If all tasks are completed, return 100%
  } else if (completedTasks === 0 && inProgressTasks === 0) {
    completionRate = 5 // If completed and in-progress are 0, return 5%
  } else {
    completionRate = 60 // Otherwise, return 60%
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Responsive Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 lg:h-20">
            {/* Mobile Header */}
            <div className="flex items-center justify-between sm:hidden mb-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="hover:bg-purple-50 hover:text-purple-600 px-2 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-bold text-gray-900 truncate flex-1 mx-4">{currentProject.name}</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2 py-2">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowMembersDialog(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Project Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateTask("todo")}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop Header */}
            <div className="hidden sm:flex sm:items-center sm:flex-1">
              <Button
                variant="ghost"
                onClick={onBack}
                className="mr-4 hover:bg-purple-50 hover:text-purple-600 px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                                 <div className="min-w-0">
                   <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{currentProject.name}</h1>
                   <p className="text-sm text-gray-600 mt-1 hidden lg:block">Manage tasks and track progress across different stages</p>
                 </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {/* Team Members */}
              <div className="hidden lg:flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2">
                <div className="flex -space-x-2">
                  {currentProject.members.slice(0, 5).map((member, idx) => (
                    <Avatar key={member.id ? member.id : `member-${idx}`} className="h-8 w-8 border-2 border-white ring-1 ring-gray-200">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold">
                        {member?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {currentProject.members.length > 5 && (
                    <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white ring-1 ring-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-600 font-medium">+{currentProject.members.length - 5}</span>
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {currentProject.members.length} member{currentProject.members.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {/* Project Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 bg-transparent"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">Project Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowMembersDialog(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Project Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => handleCreateTask("todo")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">New Task</span>
                <span className="lg:hidden">Task</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Project Stats - Responsive Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm font-medium">Total Tasks</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{totalTasks}</p>
                </div>
                <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">In Progress</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{inProgressTasks}</p>
                </div>
                <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs sm:text-sm font-medium">Completed</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{completedTasks}</p>
                </div>
                <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-xs sm:text-sm font-medium">Progress</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{completionRate}%</p>
                </div>
                <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

                 

         {/* Project Description */}
         {currentProject.description && (
           <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
             <h3 className="text-sm font-semibold text-gray-700 mb-2">Project Description</h3>
             <p className="text-sm text-gray-600 leading-relaxed">{currentProject.description}</p>
           </div>
         )}

        {/* Board - Enhanced Responsive Scrollable */}
        <div className="flex space-x-3 sm:space-x-4 lg:space-x-6 overflow-x-auto pb-4 board-scroll smooth-scroll">
          {board.columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              onTaskClick={setSelectedTask}
              onCreateTask={() => handleCreateTask(column.id)}
            />
          ))}
        </div>
      </div>

      {/* Task Dialog */}
      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
          projectMembers={currentProject.members}
        />
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        onTaskCreated={handleTaskCreated}
        projectId={currentProject.id}
        columnId={createTaskColumn}
        projectMembers={currentProject.members}
      />

      {/* Manage Members Dialog */}
      <ManageMembersDialog
        open={showMembersDialog}
        onOpenChange={setShowMembersDialog}
        project={currentProject}
        onMembersUpdated={handleMembersUpdated}
        currentUser={user || undefined}
      />

      {/* Project Settings Dialog */}
      <ProjectSettingsDialog
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        project={currentProject}
        onProjectUpdated={handleProjectUpdated}
        onProjectDeleted={handleProjectDeleted}
      />
    </div>
  )
}
