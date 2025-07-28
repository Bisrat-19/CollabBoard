"use client"

import { useState, useEffect } from "react"
import type { Project, Task } from "@/types"
import { projectService } from "@/services/project-service"
import { taskService } from "@/services/task-service"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  MoreHorizontal,
  Loader2,
  Filter,
  Grid,
  List,
} from "lucide-react"
import { CreateProjectDialog } from "./create-project-dialog"
import { ProjectBoard } from "../project/project-board"
import { AdminPanel } from "../admin/admin-panel"
import { SidebarNavigation } from "../layout/sidebar-navigation"
import { NotificationsDropdown } from "../layout/notifications-dropdown"
import { ManageMembersDialog } from "../project/manage-members-dialog"
import { TeamsView } from "./teams-view"

interface CollaboratingUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  createdAt: string
  projectCount: number
}

export function EnhancedDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [collaboratingUsers, setCollaboratingUsers] = useState<CollaboratingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<Project | null>(null)
  const [activeView, setActiveView] = useState("dashboard")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const handler = () => loadData();
    window.addEventListener("projectListShouldRefresh", handler);
    return () => window.removeEventListener("projectListShouldRefresh", handler);
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      console.log("Loading data...")
      
      const [projectsData, tasksData, collaboratingUsersData] = await Promise.all([
        projectService.getProjects().catch(err => {
          console.error("Failed to load projects:", err)
          return []
        }),
        taskService.getAllTasks().catch(err => {
          console.error("Failed to load tasks:", err)
          return []
        }),
        projectService.getCollaboratingUsers().catch(err => {
          console.error("Failed to load collaborating users:", err)
          return []
        })
      ])
      
      console.log("Projects data:", projectsData)
      console.log("Tasks data:", tasksData)
      console.log("Collaborating users data:", collaboratingUsersData)
      
      // Map _id to id for all projects
      const mappedProjects = (projectsData || []).map((p: any) => ({
        _id: p._id,
        id: p.id || p._id,
        name: p.name,
        description: p.description,
        members: p.members,
        ownerId: p.ownerId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))
      
      // Map _id to id for all tasks
      const mappedTasks = (tasksData || []).map((t: any) => ({
        ...t,
        id: t.id || t._id,
      }))
      
      setProjects(mappedProjects)
      setTasks(mappedTasks)
      setCollaboratingUsers(collaboratingUsersData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to refresh data (can be called from other components)
  const refreshData = () => {
    loadData()
  }

  const handleProjectCreated = (project: any) => {
    // Ensure the new project has an 'id' property
    const mappedProject = {
      ...project,
      id: project.id || project._id,
    };
    setProjects((prev) => [...prev, mappedProject]);
    setShowCreateDialog(false);
    // Reload data to get updated statistics
    loadData();
  }

  const handleManageMembers = (project: Project) => {
    setSelectedProjectForMembers(project)
    setShowMembersDialog(true)
  }

  const handleMembersUpdated = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)))
    setShowMembersDialog(false)
    // Reload data to get updated statistics
    loadData();
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
  }

  // Calculate dashboard statistics
  const activeTasks = tasks.filter(task => task.status === "todo" || task.status === "in-progress").length
  const completedTasks = tasks.filter(task => task.status === "done").length
  const totalTasks = tasks.length

  // Function to calculate project progress
  const calculateProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(task => {
      const taskProjectId = task.project?.id || task.project?._id
      return taskProjectId === projectId || taskProjectId?.toString() === projectId?.toString()
    })
    
    const totalProjectTasks = projectTasks.length
    const completedProjectTasks = projectTasks.filter(task => task.status === "done").length
    const inProgressProjectTasks = projectTasks.filter(task => task.status === "in-progress").length

    // If no tasks exist, return 5%
    if (totalProjectTasks === 0) {
      return 5
    }

    // If all tasks are completed, return 100%
    if (totalProjectTasks === completedProjectTasks) {
      return 100
    }

    // If completed and in-progress are 0, return 5%
    if (completedProjectTasks === 0 && inProgressProjectTasks === 0) {
      return 5
    }

    // Otherwise, return 60%
    return 60
  }

  // Handle different views
  if (selectedProject) {
    return <ProjectBoard 
      project={selectedProject} 
      onBack={() => setSelectedProject(null)} 
      onTaskUpdated={() => loadData()}
    />
  }

  if (showAdminPanel && user?.role === "admin") {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} onRefresh={refreshData} />
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0" onClick={() => setSelectedProject(project)}>
            <CardTitle className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
              {project.name}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2 text-sm">{project.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleManageMembers(project)}>
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                <TrendingUp className="h-4 w-4 mr-2" />
                View Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0" onClick={() => setSelectedProject(project)}>
        <div className="space-y-4">
          {/* Date - Moved to top */}
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(project.updatedAt).toLocaleDateString()}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{calculateProjectProgress(project.id)}%</span>
            </div>
            <Progress value={calculateProjectProgress(project.id)} className="h-2" />
          </div>

          {/* Members */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {project.members.slice(0, 3).map((member, index) => (
                <Avatar
                  key={member.id ?? `${member.name}-${index}`}
                  className="h-6 w-6 lg:h-8 lg:w-8 border-2 border-white ring-1 ring-gray-200"
                >
                  <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold">
                    {member?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              ))}

              {project.members.length > 3 && (
                <div className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-gray-100 border-2 border-white ring-1 ring-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">+{project.members.length - 3}</span>
                </div>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {project.members.length} member{project.members.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ProjectListItem = ({ project }: { project: Project }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white">
      <CardContent className="p-4 lg:p-6">
          <div className="flex items-center space-x-4 flex-1 min-w-0" onClick={() => setSelectedProject(project)}>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors truncate">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-1">{project.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <div className="flex -space-x-1">
                    {project.members.slice(0, 3).map((member, idx) => (
                      <Avatar key={member.id || `member-${idx}`} className="h-6 w-6 border-2 border-white">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold">
                          {member?.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {project.members.length}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">Updated {new Date(project.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleManageMembers(project)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedProject(project)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <TrendingUp className="h-4 w-4" />
                </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <div className="h-screen bg-gray-50 md:flex relative">
        <SidebarNavigation
          activeView={activeView}
          onViewChange={handleViewChange}
          onCreateProject={() => setShowCreateDialog(true)}
          onShowAdminPanel={() => setShowAdminPanel(true)}
        />

        <main className="w-full md:flex-1 h-full p-4 lg:p-8 overflow-y-auto">
          {activeView === "dashboard" && (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600 text-sm lg:text-base">Welcome! Here's what's happening with your projects.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <NotificationsDropdown />
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">New Project</span>
                      <span className="sm:hidden">New</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-xs lg:text-sm font-medium">Total Projects</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{projects.length}</p>
                      </div>
                      <div className="bg-white/20 p-1.5 sm:p-2 lg:p-3 rounded-xl">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-xs lg:text-sm font-medium">Active Tasks</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{activeTasks}</p>
                      </div>
                      <div className="bg-white/20 p-1.5 sm:p-2 lg:p-3 rounded-xl">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-xs lg:text-sm font-medium">Completed</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{completedTasks}</p>
                      </div>
                      <div className="bg-white/20 p-1.5 sm:p-2 lg:p-3 rounded-xl">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100 text-xs lg:text-sm font-medium">Team Members</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                          {collaboratingUsers.length}
                        </p>
                      </div>
                      <div className="bg-white/20 p-1.5 sm:p-2 lg:p-3 rounded-xl">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Projects Section */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Your Projects</h2>
                    <Badge variant="secondary" className="text-xs">
                      {projects.length} projects
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-8 w-8 p-0"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-8 w-8 p-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : projects.length === 0 ? (
                  <Card className="p-8 lg:p-12 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-6 text-sm lg:text-base">
                      Get started by creating your first project to organize your team's work.
                    </p>
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </Card>
                ) : (
                  <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" : "space-y-4"}>
                    {viewMode === "grid" ? projects.map((project) => <ProjectCard key={project.id} project={project} />) : projects.map((project) => <ProjectListItem key={project.id} project={project} />)}
                  </div>
                )}
              </div>
            </>
          )}

          {activeView === "teams" && (
            <div>
              <div className="mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Team Members</h1>
                    <p className="text-gray-600 text-sm lg:text-base">Manage your team and see who's working on what</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <NotificationsDropdown />
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">New Project</span>
                      <span className="sm:hidden">New</span>
                    </Button>
                  </div>
                </div>
              </div>
              <TeamsView projects={projects} collaboratingUsers={collaboratingUsers} />
            </div>
          )}

          {activeView === "projects" && (
            <div>
              <div className="mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
                    <p className="text-gray-600 text-sm lg:text-base">Manage and organize all your projects</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <NotificationsDropdown />
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">New Project</span>
                      <span className="sm:hidden">New</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Projects Section */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">All Projects</h2>
                    <Badge variant="secondary" className="text-xs">
                      {projects.length} projects
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-8 w-8 p-0"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="h-8 w-8 p-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : projects.length === 0 ? (
                  <Card className="p-8 lg:p-12 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-6 text-sm lg:text-base">
                      Get started by creating your first project to organize your team's work.
                    </p>
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </Card>
                ) : (
                  <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" : "space-y-4"}>
                    {viewMode === "grid" ? projects.map((project) => <ProjectCard key={project.id} project={project} />) : projects.map((project) => <ProjectListItem key={project.id} project={project} />)}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={handleProjectCreated}
      />

      {selectedProjectForMembers && (
        <ManageMembersDialog
          open={showMembersDialog}
          onOpenChange={setShowMembersDialog}
          project={selectedProjectForMembers!}
          onMembersUpdated={handleMembersUpdated}
        />
      )}
    </>
  )
}
