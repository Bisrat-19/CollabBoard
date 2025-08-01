"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { Project } from "@/types"
import { projectService } from "@/services/project-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Calendar, Settings, LogOut, Loader2, TrendingUp } from "lucide-react"
import { CreateProjectDialog } from "./create-project-dialog"
import { ProjectBoard } from "../project/project-board"
import { AdminPanel } from "../admin/admin-panel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Dashboard() {
  const { user, logout } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      console.log('Dashboard: Projects from service:', data);
      
      // Sort projects by createdAt in descending order (newest first)
      const sortedProjects = data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setProjects(sortedProjects as Project[]);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  }

     const handleProjectCreated = (project: Project) => {
     console.log('Dashboard: Project created:', project)
     // Add new project to the beginning of the list (newest first)
     setProjects((prev) => [project, ...prev])
     setShowCreateDialog(false)
   }

  if (selectedProject) {
    console.log('Dashboard: Rendering ProjectBoard with selectedProject:', selectedProject)
    
    const handleProjectUpdated = (updatedProject: Project) => {
      console.log('Dashboard: handleProjectUpdated called with:', updatedProject)
      // Update the project in the dashboard's project list
      setProjects(prev => {
        console.log('Dashboard: current projects:', prev)
        const updated = prev.map(p => {
          const pId = p.id || p._id;
          const updatedId = updatedProject.id || updatedProject._id;
          console.log('Dashboard: comparing', pId, 'with', updatedId, 'types:', typeof pId, typeof updatedId)
          const isMatch = pId === updatedId || pId?.toString() === updatedId?.toString();
          console.log('Dashboard: isMatch:', isMatch)
          return isMatch ? updatedProject : p;
        });
        console.log('Dashboard: updated projects:', updated)
        return updated;
      })
      // Update the selected project
      setSelectedProject(updatedProject)
    }

    const handleProjectDeleted = () => {
      console.log('Dashboard: handleProjectDeleted called')
      // Remove the project from the dashboard's project list
      const selectedId = selectedProject.id || selectedProject._id;
      console.log('Dashboard: removing project with id:', selectedId)
      setProjects(prev => {
        console.log('Dashboard: current projects before deletion:', prev)
        const filtered = prev.filter(p => {
          const pId = p.id || p._id;
          const isMatch = pId === selectedId || pId?.toString() === selectedId?.toString();
          return !isMatch;
        });
        console.log('Dashboard: projects after deletion:', filtered)
        return filtered;
      })
      // Go back to dashboard
      setSelectedProject(null)
    }

    return (
      <ProjectBoard 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)}
        onProjectUpdated={handleProjectUpdated}
        onProjectDeleted={handleProjectDeleted}
      />
    )
  }

  if (showAdminPanel && user?.role === "admin") {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">CollabBoard</h1>
            </div>

            <div className="flex items-center space-x-4">
              {user?.role === "admin" && (
                <Button variant="outline" onClick={() => setShowAdminPanel(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Projects</h2>
            <p className="text-gray-600 mt-1">Manage and collaborate on your projects</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first project</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                             <Card
                 key={project.id}
                                   className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-blue-100/50"
                 role="button"
                 tabIndex={0}
                 aria-label={`View ${project.name} project board`}
                 onClick={() => setSelectedProject(project)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault()
                     setSelectedProject(project)
                   }
                 }}
               >
                                 <CardHeader className="pb-3">
                   <div className="flex items-start justify-between">
                     <div className="flex-1 min-w-0">
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
                                           <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200 flex-shrink-0">
                        {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                      </Badge>
                   </div>
                 </CardHeader>
                 <CardContent className="pt-0">
                   <div className="space-y-4">
                     {/* Project Stats Row */}
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         {/* Progress Indicator */}
                                                   <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-medium text-gray-600">Progress</span>
                            <span className="text-sm font-bold text-blue-600">60%</span>
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
                            style={{ width: "60%" }}
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
                       </div>
                       
                       {/* Member Avatars */}
                       <div className="flex -space-x-2 mt-2">
                         {project.members.slice(0, 4).map((member) => (
                           <Avatar key={member.id} className="h-6 w-6 border-2 border-white ring-1 ring-gray-200 hover:scale-110 transition-transform">
                             <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                                         <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                              {member.name.charAt(0)}
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
            ))}
          </div>
        )}
      </main>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  )
}
