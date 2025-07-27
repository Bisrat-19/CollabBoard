"use client"

import { useState, useEffect } from "react"
import type { Project } from "@/types"
import { projectService } from "@/services/project-service"
import { adminService } from "@/services/admin-service"
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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface AdminPanelProps {
  onBack: () => void
  onRefresh?: () => void
}

export function AdminPanel({ onBack, onRefresh }: AdminPanelProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    maxProjectsPerUser: 10,
    storageLimit: 100, // GB
  })
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [projectsData, settingsData] = await Promise.all([
        adminService.getAllProjects(),
        adminService.getSystemSettings(),
      ])
      setProjects(projectsData)
      setSystemSettings(settingsData)
    } catch (error) {
      console.error("Failed to load admin data:", error)
      toast({
        title: "Error",
        description: "Failed to load admin data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSystemSettingsUpdate = async (newSettings: typeof systemSettings) => {
    try {
      setIsUpdatingSettings(true)
      await adminService.updateSystemSettings(newSettings)
      setSystemSettings(newSettings)
      setShowSettingsDialog(false)
      toast({
        title: "Settings updated",
        description: "System settings have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update system settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingSettings(false)
    }
  }

  const handleExportData = async () => {
    try {
      const blob = await adminService.exportSystemData()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `collabboard-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Export successful",
        description: "System data has been exported successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export system data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBackupSystem = () => {
    // In a real app, this would trigger a system backup
    console.log("System backup initiated")

    // Simulate backup process
    setTimeout(() => {
      console.log("System backup completed")
      toast({
        title: "Backup completed",
        description: "System backup has been completed successfully.",
      })
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between h-auto sm:h-20 py-4 sm:py-0">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <Button
                variant="ghost"
                onClick={onBack}
                className="mr-0 sm:mr-4 mb-4 sm:mb-0 hover:bg-purple-50 hover:text-purple-600 px-3 py-2 self-start"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Manage users, projects, and system settings</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                <Shield className="h-3 w-3 mr-1" />
                Administrator
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-[500px] bg-white border border-gray-200">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 text-xs sm:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 text-xs sm:text-sm"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 text-xs sm:text-sm"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 text-xs sm:text-sm"
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-xs sm:text-sm font-medium">Total Projects</p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{projects.length}</p>
                          <p className="text-xs text-purple-200 mt-1 hidden sm:block">Active collaborative projects</p>
                        </div>
                        <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                          <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Users</p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{totalUsers}</p>
                          <p className="text-xs text-blue-200 mt-1 hidden sm:block">Registered team members</p>
                        </div>
                        <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-xs sm:text-sm font-medium">Active Tasks</p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold">24</p>
                          <p className="text-xs text-emerald-200 mt-1 hidden sm:block">Tasks in progress</p>
                        </div>
                        <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                          <Activity className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-xs sm:text-sm font-medium">System Health</p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold">98%</p>
                          <p className="text-xs text-amber-200 mt-1 hidden sm:block">Overall performance</p>
                        </div>
                        <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Projects */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                      Recent Projects
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Latest project activity and status</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {projects.slice(0, 5).map((project, index) => (
                        <div
                          key={project.id || `project-${index}`}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-purple-50 hover:to-indigo-50 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                              <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{project.name}</p>
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{project.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Updated {new Date(project.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                              {project.members.length} member{project.members.length !== 1 ? "s" : ""}
                            </Badge>
                            <div className="flex -space-x-1 sm:-space-x-2">
                              {project.members.slice(0, 3).map((member, memberIndex) => (
                                <Avatar 
                                  key={member.id || `member-${memberIndex}`} 
                                  className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-white ring-1 ring-gray-200"
                                >
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold text-xs">
                                    {member.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {project.members.length > 3 && (
                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 border-2 border-white ring-1 ring-gray-200 flex items-center justify-center">
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
            <ProjectManagement projects={projects} onProjectsChange={setProjects} onRefresh={onRefresh} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* System Settings Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                    System Settings
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Configure system-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Maintenance Mode</p>
                      <p className="text-xs sm:text-sm text-gray-600">Temporarily disable user access</p>
                    </div>
                    <Badge variant={systemSettings.maintenanceMode ? "destructive" : "secondary"} className="text-xs">
                      {systemSettings.maintenanceMode ? "ON" : "OFF"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm sm:text-base">User Registration</p>
                      <p className="text-xs sm:text-sm text-gray-600">Allow new user registrations</p>
                    </div>
                    <Badge variant={systemSettings.allowRegistration ? "default" : "secondary"} className="text-xs">
                      {systemSettings.allowRegistration ? "ENABLED" : "DISABLED"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Max Projects per User</p>
                      <p className="text-xs sm:text-sm text-gray-600">Limit projects per user account</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{systemSettings.maxProjectsPerUser}</Badge>
                  </div>
                  <Button
                    onClick={() => setShowSettingsDialog(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-sm"
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
                  <Switch
                    id="maintenanceMode"
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleSystemSettingsUpdate({ ...systemSettings, maintenanceMode: checked })}
                    disabled={isUpdatingSettings}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRegistration" className="font-medium">
                      Allow Registration
                    </Label>
                    <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={systemSettings.allowRegistration}
                    onCheckedChange={(checked) => handleSystemSettingsUpdate({ ...systemSettings, allowRegistration: checked })}
                    disabled={isUpdatingSettings}
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
                    value={systemSettings.maxProjectsPerUser}
                    onChange={(e) => handleSystemSettingsUpdate({ ...systemSettings, maxProjectsPerUser: Number.parseInt(e.target.value) })}
                    disabled={isUpdatingSettings}
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
                    value={systemSettings.storageLimit}
                    onChange={(e) => handleSystemSettingsUpdate({ ...systemSettings, storageLimit: Number.parseInt(e.target.value) })}
                    disabled={isUpdatingSettings}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowSettingsDialog(false)} disabled={isUpdatingSettings}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingSettings}>
                  {isUpdatingSettings ? "Saving..." : "Save Settings"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
