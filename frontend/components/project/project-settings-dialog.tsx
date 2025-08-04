"use client"

import { useState } from "react"
import type { Project } from "@/types"
import { projectService } from "@/services/project-service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2, Edit3, Save, X, Settings, Users, Calendar, Shield, AlertTriangle } from "lucide-react"

interface ProjectSettingsDialogProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onProjectUpdated?: (updatedProject: Project) => void
  onProjectDeleted?: () => void
}

export function ProjectSettingsDialog({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
  onProjectDeleted,
}: ProjectSettingsDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
  })

  // Check if current user is the project creator
  const currentUserId = user?.id || user?._id;
  const projectCreatorId = project.createdBy || project.ownerId;
  
  const isCreator = currentUserId && projectCreatorId && 
    (currentUserId.toString() === projectCreatorId.toString());



  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const updatedProject = await projectService.updateProject(project.id || project._id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      })
      
      setIsEditing(false)
      
      // Test if callback exists
      if (onProjectUpdated) {
        onProjectUpdated(updatedProject)
      }
      
      toast({
        title: "Project Updated",
        description: "Project settings have been updated successfully.",
      })
    } catch (error: any) {
      console.error('ProjectSettingsDialog: Update failed:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await projectService.deleteProject(project.id || project._id)
      setShowDeleteDialog(false)
      onClose()
      onProjectDeleted?.()
      
      toast({
        title: "Project Deleted",
        description: "Project has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: project.name,
      description: project.description,
    })
    setIsEditing(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              Project Settings
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Manage your project details, permissions, and settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Project Overview Card */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Project Overview
                </h3>
                <Badge 
                  variant="secondary" 
                  className={isCreator ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"}
                >
                  {isCreator ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Creator
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-1" />
                      Member
                    </>
                  )}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Members</p>
                    <p className="font-medium text-gray-900">{project.members.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium text-gray-900">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Updated</p>
                    <p className="font-medium text-gray-900">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permission Notice */}
            {!isCreator && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Limited Access</h4>
                    <p className="text-sm text-yellow-700">
                      Only the project creator can modify project settings. You can view project details but cannot make changes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Project Details
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name" className="text-sm font-medium text-gray-700">
                    Project Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="project-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter project name"
                      disabled={!isCreator}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="mt-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">{project.name}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="project-description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="project-description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter project description"
                      rows={4}
                      disabled={!isCreator}
                      className="mt-1.5 resize-none"
                    />
                  ) : (
                    <div className="mt-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
                      <p className="text-gray-700 leading-relaxed">
                        {project.description || "No description provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Team Members Preview */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Team Members ({project.members.length})
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {project.members.slice(0, 8).map((member, idx) => (
                    <div
                      key={member.id ? member.id : `member-${idx}`}
                      className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {member?.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{member.name}</span>
                      {member.role === "admin" && (
                        <Badge variant="outline" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  ))}
                  {project.members.length > 8 && (
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                      <span className="text-sm text-gray-600">
                        +{project.members.length - 8} more
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between pt-6">
            <div className="flex gap-2">
              {isCreator && (
                <>
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Project
                    </Button>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              {isCreator && (
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
              )}
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{project.name}"</span>? 
              This action cannot be undone and will permanently remove the project and all its tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 