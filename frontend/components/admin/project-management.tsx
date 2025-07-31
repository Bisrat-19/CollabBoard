"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/types"
import { adminService } from "@/services/admin-service"
import { projectService } from "@/services/project-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Search, MoreHorizontal, FolderPlus, Trash2, Edit, Loader2, FolderOpen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProjectManagementProps {
  projects: Project[]
  onProjectsChange: (projects: Project[]) => void
  onRefresh?: () => void
}

export function ProjectManagement({ projects, onProjectsChange, onRefresh }: ProjectManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Form states for add/edit project
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const projectsData = await adminService.getAllProjects()
      onProjectsChange(projectsData)
    } catch (error) {
      console.error("Failed to load projects:", error)
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteProject = async (projectId: string) => {
    try {
      await adminService.deleteProject(projectId)
      onProjectsChange(projects.filter((p) => p.id !== projectId))
      onRefresh?.()

      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateProject = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const newProject = await adminService.createProject(formData)
      onProjectsChange([...projects, newProject])
      onRefresh?.()
      setShowCreateDialog(false)
      setFormData({ name: "", description: "" })

      toast({
        title: "Project created",
        description: "Project has been created successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description,
    })
    setShowEditDialog(true)
  }

  const handleUpdateProject = async () => {
    if (!editingProject || !formData.name || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const updatedProject = await adminService.updateProject(editingProject.id, formData)
      onProjectsChange(projects.map((p) => (p.id === editingProject.id ? updatedProject : p)))
      onRefresh?.()
      setShowEditDialog(false)
      setEditingProject(null)
      setFormData({ name: "", description: "" })

      toast({
        title: "Project updated",
        description: "Project has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "" })
    setEditingProject(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Project Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage all projects and their settings</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-sm"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Projects Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="flex items-center">
            <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
            All Projects
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">View and manage all projects</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Project</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Description</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Members</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Created</TableHead>
                  <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow key="loading">
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="mt-2 text-sm">Loading projects...</p>
                    </TableCell>
                  </TableRow>
                ) : projects.length === 0 ? (
                  <TableRow key="no-projects">
                    <TableCell colSpan={5} className="text-center py-8">
                      <FolderOpen className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="mt-2 text-sm text-gray-600">No projects found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  projects
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((project, index) => (
                    <TableRow key={project.id || `project-${index}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{project.name}</p>
                            <p className="text-xs text-gray-500 sm:hidden truncate">{project.description?.length > 30 ? `${project.description.substring(0, 30)}...` : project.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">
                        <p className="truncate">{project.description?.length > 60 ? `${project.description.substring(0, 60)}...` : project.description}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex -space-x-1 sm:-space-x-2">
                          {project.members.slice(0, 3).map((member, memberIndex) => (
                            <Avatar key={member.id || `member-${memberIndex}`} className="h-6 w-6 border-2 border-white">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold text-xs">
                                {member.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {project.members.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-gray-600 font-medium">
                                +{project.members.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 sm:w-40">
                            <DropdownMenuItem onClick={() => handleEditProject(project)} className="text-xs sm:text-sm">
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-xs sm:text-sm text-red-600">
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Start a new project for your team to collaborate on.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCreateProject()
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  name="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  name="description"
                  placeholder="Describe your project"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4 mr-2" />}
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project information and settings.</DialogDescription>
          </DialogHeader>
          {editingProject && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateProject()
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-project-name">Project Name</Label>
                  <Input
                    id="edit-project-name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-project-description">Description</Label>
                  <Textarea
                    id="edit-project-description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4 mr-2" />}
                  {isSubmitting ? "Updating..." : "Update Project"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
