"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  Star,
  MoreHorizontal,
  Loader2,
  Filter,
  Grid,
  List,
  Clock,
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

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      
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
      
      // Map _id to id for all projects and normalize members
      const mappedProjects = (projectsData || []).map((p: any) => ({
        _id: p._id,
        id: p.id || p._id,
        name: p.name,
        description: p.description,
        members: (p.members || []).map((m: any) => ({
          ...m,
          id: m.id || m._id,
          _id: m._id || m.id,
        })),
        ownerId: p.ownerId,
        createdBy: p.createdBy,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))
      
      // Map _id to id for all tasks
      const mappedTasks = (tasksData || []).map((t: any) => ({
        ...t,
        id: t.id || t._id,
      }))
      
      // Sort projects by createdAt in descending order (newest first)
      const sortedProjects = mappedProjects.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      setProjects(sortedProjects)
      setTasks(mappedTasks)
      setCollaboratingUsers(collaboratingUsersData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
     // Add new project to the beginning of the list (newest first)
     setProjects((prev) => [mappedProject, ...prev]);
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

  // Function to calculate project progress
  const calculateProjectProgress = useCallback((projectId: string) => {
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
  }, [tasks])

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const activeProjects = projects.filter(project => {
      const projectProgress = calculateProjectProgress(project.id)
      return projectProgress < 100
    }).length
    
    const completedProjects = projects.filter(project => {
      const projectProgress = calculateProjectProgress(project.id)
      return projectProgress === 100
    }).length

    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === "done").length
    const inProgressTasks = tasks.filter(task => task.status === "in-progress").length
    const todoTasks = tasks.filter(task => task.status === "todo").length

    return {
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks
    }
  }, [projects, tasks, calculateProjectProgress])

  // Handle different views
  if (selectedProject) {
    return <ProjectBoard 
      project={selectedProject} 
      onBack={() => setSelectedProject(null)} 
      onTaskUpdated={() => loadData()}
      onProjectUpdated={(updatedProject) => {
        // Update the project in the dashboard's project list
        setProjects(prev => {
          const updated = prev.map(p => {
            const pId = p.id || p._id;
            const updatedId = updatedProject.id || updatedProject._id;
            const isMatch = pId === updatedId || pId?.toString() === updatedId?.toString();
            return isMatch ? updatedProject : p;
          });
          return updated;
        })
        // Update the selected project
        setSelectedProject(updatedProject)
      }}
      onProjectDeleted={() => {
        // Remove the project from the dashboard's project list
        const selectedId = selectedProject.id || selectedProject._id;
        setProjects(prev => {
          const filtered = prev.filter(p => {
            const pId = p.id || p._id;
            const isMatch = pId === selectedId || pId?.toString() === selectedId?.toString();
            return !isMatch;
          });
          return filtered;
        })
        // Go back to dashboard
        setSelectedProject(null)
      }}
    />
  }

  if (showAdminPanel && user?.role === "admin") {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} onRefresh={refreshData} />
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card 
      className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-md hover:shadow-blue-100/50"
      role="button"
      tabIndex={0}
      aria-label={`View ${project.name} project board`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setSelectedProject(project)
        }
      }}
    >
       
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
                     <div className="flex-1 min-w-0" onClick={() => setSelectedProject(project)}>
                           <CardTitle className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500 flex-shrink-0" />
                {project.name}
              </CardTitle>
            <CardDescription className="mt-1 text-sm truncate">
              {project.description && project.description.length > 50
                ? `${project.description.substring(0, 50)}...`
                : project.description}
            </CardDescription>
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
           {/* Project Stats Row */}
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               {/* Progress Indicator */}
                               <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-bold text-blue-600">{calculateProjectProgress(project.id)}%</span>
                </div>
             </div>
             
             {/* Last Updated */}
             <div className="flex items-center text-xs text-gray-500">
               <Calendar className="h-3 w-3 mr-1" />
               {new Date(project.updatedAt).toLocaleDateString()}
             </div>
           </div>

           {/* Progress Bar */}
           <div className="relative">
                           <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                 <div 
                   className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                   style={{ width: `${calculateProjectProgress(project.id)}%` }}
                 ></div>
              </div>
           </div>

           {/* Team Members Section */}
           <div className="border-t border-gray-100 pt-3">
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-2">
                 <Users className="h-4 w-4 text-gray-400" />
                 <span className="text-xs font-medium text-gray-600">Team</span>
               </div>
                               <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                  {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                </Badge>
             </div>
             
             {/* Member Avatars */}
             <div className="flex -space-x-2 mt-2">
               {project.members.slice(0, 4).map((member, index) => (
                 <Avatar
                   key={member.id ?? `${member.name}-${index}`}
                   className="h-6 w-6 border-2 border-white ring-1 ring-gray-200 hover:scale-110 transition-transform"
                 >
                   <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                     {member?.name?.charAt(0)?.toUpperCase() ?? "?"}
                   </AvatarFallback>
                 </Avatar>
               ))}

               {project.members.length > 4 && (
                 <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white ring-1 ring-gray-200 flex items-center justify-center hover:scale-110 transition-transform">
                   <span className="text-xs text-gray-600 font-medium">+{project.members.length - 4}</span>
                 </div>
               )}
             </div>
           </div>
         </div>
       </CardContent>
    </Card>
  )

  const ProjectListItem = ({ project }: { project: Project }) => (
    <Card 
      className="group hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer border-0 bg-gradient-to-r from-white to-gray-50 shadow-md hover:shadow-blue-100/50"
      role="button"
      tabIndex={0}
      aria-label={`View ${project.name} project board`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setSelectedProject(project)
        }
      }}
    >
             <CardContent className="p-4 lg:p-6">
         <div className="flex items-center space-x-4" onClick={() => setSelectedProject(project)}>
           {/* Project Icon */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
               <TrendingUp className="h-6 w-6 text-white" />
             </div>
           
           {/* Project Info */}
           <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-blue-500 flex-shrink-0" />
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {project.name}
                </h3>
              </div>
             
             <p className="text-sm text-gray-600 truncate mb-2">
               {project.description && project.description.length > 40
                 ? `${project.description.substring(0, 40)}...`
                 : project.description}
             </p>
             
             {/* Project Stats */}
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4">
                 {/* Progress */}
                                   <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-bold text-blue-600">{calculateProjectProgress(project.id)}%</span>
                  </div>
                 
                 {/* Team Members */}
                 <div className="flex items-center space-x-1">
                   <Users className="h-3 w-3 text-gray-400" />
                   <span className="text-xs text-gray-600">{project.members.length}</span>
                 </div>
                 
                 {/* Last Updated */}
                 <div className="flex items-center space-x-1">
                   <Calendar className="h-3 w-3 text-gray-400" />
                   <span className="text-xs text-gray-500">{new Date(project.updatedAt).toLocaleDateString()}</span>
                 </div>
               </div>
               
               {/* Action Buttons */}
               <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={(e) => {
                     e.stopPropagation()
                     handleManageMembers(project)
                   }}
                   className="h-6 w-6 p-0"
                 >
                   <Users className="h-3 w-3" />
                 </Button>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={(e) => {
                     e.stopPropagation()
                     setSelectedProject(project)
                   }}
                   className="h-6 w-6 p-0"
                 >
                   <TrendingUp className="h-3 w-3" />
                 </Button>
               </div>
             </div>
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
                        <p className="text-blue-100 text-xs lg:text-sm font-medium">Active</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{dashboardStats.activeProjects}</p>
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
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{dashboardStats.completedProjects}</p>
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
          currentUser={user || undefined}
        />
      )}
    </>
  )
}
