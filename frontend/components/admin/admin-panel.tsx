"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/types"
import { projectService } from "@/services/project-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, FolderOpen, Crown, Loader2, TrendingUp, Shield, Activity, Settings } from "lucide-react"
import { UserManagement } from "./user-management"
import { ProjectManagement } from "./project-management"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    maxProjectsPerUser: 10,
    storageLimit: 100, // GB
  })
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects()
      setProjects(data)
    } catch (error) {
      console.error("Failed to load projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSystemSettingsUpdate = (newSettings: typeof systemSettings) => {
    setSystemSettings(newSettings)
    setShowSettingsDialog(false)

    // In a real app, this would make an API call
    console.log("System settings updated:", newSettings)
  }

  const handleExportData = () => {
    // In a real app, this would trigger a data export
    const data = {
      projects,
      users: [], // This would come from your user service
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `collabboard-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleBackupSystem = () => {
    // In a real app, this would trigger a system backup
    console.log("System backup initiated")

    // Simulate backup process
    setTimeout(() => {
      console.log("System backup completed")
    }, 2000)
  }

  const totalUsers = projects.reduce((acc, project) => {
    const uniqueUsers = new Set()
    project.members.forEach((member) => uniqueUsers.add(member.id))
    return acc + uniqueUsers.size
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={onBack}
                className="mr-4 hover:bg-purple-50 hover:text-purple-600 px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-600">Manage users, projects, and system settings</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 px-3 py-1">
                <Shield className="h-3 w-3 mr-1" />
                Administrator
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px] bg-white border border-gray-200">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Total Projects</p>
                          <p className="text-3xl font-bold">{projects.length}</p>
                          <p className="text-xs text-purple-200 mt-1">Active collaborative projects</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl">
                          <FolderOpen className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Total Users</p>
                          <p className="text-3xl font-bold">{totalUsers}</p>
                          <p className="text-xs text-blue-200 mt-1">Registered team members</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl">
                          <Users className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-sm font-medium">Active Tasks</p>
                          <p className="text-3xl font-bold">24</p>
                          <p className="text-xs text-emerald-200 mt-1">Tasks in progress</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl">
                          <Activity className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-sm font-medium">System Health</p>
                          <p className="text-3xl font-bold">98%</p>
                          <p className="text-xs text-amber-200 mt-1">Overall performance</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Projects */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <FolderOpen className="h-5 w-5 mr-2 text-purple-600" />
                      Recent Projects
                    </CardTitle>
                    <CardDescription>Latest project activity and status</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {projects.slice(0, 5).map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-purple-50 hover:to-indigo-50 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                              <FolderOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{project.name}</p>
                              <p className="text-sm text-gray-600 line-clamp-1">{project.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Updated {new Date(project.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                            </Badge>
                            <div className="flex -space-x-2">
                              {project.members.slice(0, 3).map((member) => (
                                <Avatar key={member.id} className="h-8 w-8 border-2 border-white ring-1 ring-gray-200">
                                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                                    {member.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {project.members.length > 3 && (
                                <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white ring-1 ring-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-600 font-medium">
                                    +{project.members.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManagement projects={projects} onProjectsChange={setProjects} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Settings Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-purple-600" />
                    System Settings
                  </CardTitle>
                  <CardDescription>Configure system-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Temporarily disable user access</p>
                    </div>
                    <Badge variant={systemSettings.maintenanceMode ? "destructive" : "secondary"}>
                      {systemSettings.maintenanceMode ? "ON" : "OFF"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User Registration</p>
                      <p className="text-sm text-gray-600">Allow new user registrations</p>
                    </div>
                    <Badge variant={systemSettings.allowRegistration ? "default" : "secondary"}>
                      {systemSettings.allowRegistration ? "ENABLED" : "DISABLED"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Max Projects per User</p>
                      <p className="text-sm text-gray-600">Limit projects per user account</p>
                    </div>
                    <Badge variant="outline">{systemSettings.maxProjectsPerUser}</Badge>
                  </div>
                  <Button
                    onClick={() => setShowSettingsDialog(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Settings
                  </Button>
                </CardContent>
              </Card>

              {/* System Actions Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-600" />
                    System Actions
                  </CardTitle>
                  <CardDescription>Perform system maintenance and data operations</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 bg-transparent"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Export System Data
                  </Button>
                  <Button
                    onClick={handleBackupSystem}
                    variant="outline"
                    className="w-full justify-start hover:bg-green-50 hover:text-green-600 hover:border-green-200 bg-transparent"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Create System Backup
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 bg-transparent"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Send System Notification
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    View System Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* System Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>System Settings</DialogTitle>
              <DialogDescription>Configure system-wide settings and preferences.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleSystemSettingsUpdate({
                  maintenanceMode: formData.get("maintenanceMode") === "on",
                  allowRegistration: formData.get("allowRegistration") === "on",
                  maxProjectsPerUser: Number.parseInt(formData.get("maxProjectsPerUser") as string),
                  storageLimit: Number.parseInt(formData.get("storageLimit") as string),
                })
              }}
            >
              <div className="grid gap-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode" className="font-medium">
                      Maintenance Mode
                    </Label>
                    <p className="text-sm text-gray-600">Temporarily disable user access for maintenance</p>
                  </div>
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    name="maintenanceMode"
                    defaultChecked={systemSettings.maintenanceMode}
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRegistration" className="font-medium">
                      Allow Registration
                    </Label>
                    <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                  </div>
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    name="allowRegistration"
                    defaultChecked={systemSettings.allowRegistration}
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maxProjectsPerUser">Max Projects per User</Label>
                  <Input
                    id="maxProjectsPerUser"
                    name="maxProjectsPerUser"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={systemSettings.maxProjectsPerUser}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="storageLimit">Storage Limit (GB)</Label>
                  <Input
                    id="storageLimit"
                    name="storageLimit"
                    type="number"
                    min="10"
                    max="1000"
                    defaultValue={systemSettings.storageLimit}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowSettingsDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Settings</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
