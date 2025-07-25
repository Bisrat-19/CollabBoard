"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { Project } from "@/types"
import { projectService } from "@/services/project-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function EnhancedDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<Project | null>(null)
  const [activeView, setActiveView] = useState("dashboard")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      // Map _id to id for all projects
      const mapped = data.map((p: any) => ({
        id: p.id || p._id,
        name: p.name,
        description: p.description,
        members: p.members,
        ownerId: p.ownerId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      setProjects(mapped as Project[]);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleProjectCreated = (project: any) => {
    // Ensure the new project has an 'id' property
    const mappedProject = {
      ...project,
      id: project.id || project._id,
    };
    setProjects((prev) => [...prev, mappedProject]);
    setShowCreateDialog(false);
  }

  const handleManageMembers = (project: Project) => {
    setSelectedProjectForMembers(project)
    setShowMembersDialog(true)
  }

  const handleMembersUpdated = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)))
    setShowMembersDialog(false)
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
    setSelectedProject(null)
    setShowAdminPanel(false)
  }

  // Handle different views
  if (selectedProject) {
    return <ProjectBoard project={selectedProject} onBack={() => setSelectedProject(null)} />
  }

  if (showAdminPanel && user?.role === "admin") {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />
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
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">65%</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>

          {/* Members */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="flex -space-x-2">
                {project.members.slice(0, 3).map((member, index) => (
                  <Avatar
                    key={member.id ?? `${member.name}-${index}`}
                    className="h-6 w-6 lg:h-8 lg:w-8 border-2 border-white ring-1 ring-gray-200"
                  >
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                      {member?.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}

                {project.members.length > 3 && (
                  <div className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-gray-100 border-2 border-white ring-1 ring-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-medium">+{project.members.length - 3}</span>
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="ml-2 text-xs">
                {project.members.length} member{project.members.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="flex items-center text-xs lg:text-sm text-gray-500 flex-shrink-0">
              <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
              <span className="hidden sm:inline">{new Date(project.updatedAt).toLocaleDateString()}</span>
              <span className="sm:hidden">
                {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ProjectListItem = ({ project }: { project: Project }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
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
                    {project.members.slice(0, 3).map((member) => (
                      <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                          {member?.name?.charAt(0) ?? "?"}

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
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">65%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation
        activeView={activeView}
        onViewChange={handleViewChange}
        onCreateProject={() => setShowCreateDialog(true)}
        onShowAdminPanel={() => setShowAdminPanel(true)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {/* Render different views based on activeView */}
          {activeView === "dashboard" && (
            <>
              {/* Header - Updated greeting with notifications */}
              <div className="mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      Welcome, {user?.name?.split(" ")[0]}!
                    </h1>
                    <p className="text-gray-600 text-sm lg:text-base">
                      Here's what's happening with your projects today.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <NotificationsDropdown />
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-sm lg:text-base"
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-xs lg:text-sm font-medium">Total Projects</p>
                        <p className="text-2xl lg:text-3xl font-bold">{projects.length}</p>
                      </div>
                      <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
                        <TrendingUp className="h-4 w-4 lg:h-6 lg:w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-xs lg:text-sm font-medium">Active Tasks</p>
                        <p className="text-2xl lg:text-3xl font-bold">24</p>
                      </div>
                      <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
                        <Clock className="h-4 w-4 lg:h-6 lg:w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-xs lg:text-sm font-medium">Completed</p>
                        <p className="text-2xl lg:text-3xl font-bold">12</p>
                      </div>
                      <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
                        <Star className="h-4 w-4 lg:h-6 lg:w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100 text-xs lg:text-sm font-medium">Team Members</p>
                        <p className="text-2xl lg:text-3xl font-bold">
                          {projects.reduce((acc, project) => acc + project.members.length, 0)}
                        </p>
                      </div>
                      <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
                        <Users className="h-4 w-4 lg:h-6 lg:w-6" />
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
                      Get started by creating your first project
                    </p>
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </Card>
                ) : (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
                        : "space-y-4"
                    }
                  >
                    {projects.map((project, index) =>
                      viewMode === "grid" ? (
                        <ProjectCard key={project.id ?? project._id ?? index} project={project} />
                      ) : (
                        <ProjectListItem key={project.id ?? project._id ?? index} project={project} />
                      ),
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {activeView === "projects" && (
            <div>
              <div className="mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">All Projects</h1>
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

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {projects.map((project, index) => (
                    <ProjectCard key={project.id ?? project._id ?? index} project={project} />
                  ))}
                </div>
              )}
            </div>
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
              <TeamsView projects={projects} />
            </div>
          )}
        </div>
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
          project={selectedProjectForMembers}
          onMembersUpdated={handleMembersUpdated}
        />
      )}
    </div>
  )
}
