"use client"

import { useState, useEffect } from "react"
import type { Project, User } from "@/types"
import { projectService } from "@/services/project-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Search, UserPlus, X, Mail, Crown, UserIcon, Eye, Users, Plus, Trash2, Shield } from "lucide-react"
import { getApiUrl } from "@/lib/config"

interface ManageMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onMembersUpdated: (project: Project) => void
  currentUser?: User // Add current user prop
}

export function ManageMembersDialog({ open, onOpenChange, project, onMembersUpdated, currentUser }: ManageMembersDialogProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])

  // Check if current user is the project owner
  const currentUserId = currentUser?.id || currentUser?._id;
  const projectCreatorId = project.createdBy || project.ownerId;
  
  const isOwner = currentUserId && projectCreatorId && 
    (currentUserId.toString() === projectCreatorId.toString());

  useEffect(() => {
    if (open) {
      // Only fetch users if user is owner
      if (isOwner) {
        fetch(getApiUrl("/users"), { credentials: "include" })
          .then((res) => res.json())
          .then((data) => {
            // Ensure data is an array
            setAllUsers(Array.isArray(data) ? data : []);
          })
          .catch(() => {
            console.error("Failed to fetch users");
            setAllUsers([]);
          });
      }
    }
  }, [open, isOwner]);

  // Filter available users (exclude already added members, admin users, and current user)
  const filteredUsers = allUsers.filter(
    (user) =>
      user.role !== "admin" && // Exclude admin users
      !project.members.some((member) => member.id === user.id) && // Exclude existing members
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleRemoveMember = async (memberId: string) => {
    if (!isOwner) return; // Only owner can remove members
    
    setIsLoading(true)
    try {
      const updatedMembers = project.members.filter((member) => member.id !== memberId)
      const updatedProject = await projectService.updateProject(project.id, {
        ...project,
        members: updatedMembers,
      })
      onMembersUpdated(updatedProject)
      toast({
        title: "Member removed",
        description: "Team member has been removed from the project.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteByEmail = async () => {
    if (!isOwner) return; // Only owner can invite members
    
    if (!inviteEmail.trim()) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token");
      const emailToInvite = inviteEmail.trim(); // Store email before clearing
      const res = await fetch(getApiUrl("/users/invite"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ email: emailToInvite, projectId: project.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to invite user");
      }
      // Success: show toast
      setInviteEmail("");
      toast({
        title: "Invitation sent!",
        description: `Invitation has been sent to ${emailToInvite}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteUser = async (user: User) => {
    if (!isOwner) return; // Only owner can invite members
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/users/invite"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ email: user.email, projectId: project.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to invite user");
      }
      // Success: show toast
      toast({
        title: "Invitation sent!",
        description: `Invitation has been sent to ${user.name} (${user.email})`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
              {isOwner ? (
                <UserPlus className="h-5 w-5 text-white" />
              ) : (
                <Eye className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {isOwner ? "Manage Project Members" : "Project Members"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {isOwner 
                  ? `Add or remove team members from "${project.name}"`
                  : `View team members of "${project.name}"`
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Members */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Current Members</CardTitle>
                      <p className="text-sm text-gray-600">{project.members.length} team member{project.members.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {isOwner && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Owner
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {project.members.map((member, idx) => (
                    <div key={member.id ?? idx} className="group relative p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold text-sm">
                                {member?.name?.charAt(0)?.toUpperCase() ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            {member.role === "admin" && (
                              <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full">
                                <Crown className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                            <p className="text-sm text-gray-600 truncate">{member.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                                {member.role === "admin" ? (
                                  <Crown className="h-3 w-3 mr-1" />
                                ) : (
                                  <UserIcon className="h-3 w-3 mr-1" />
                                )}
                                {member.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {isOwner && member.id !== currentUserId && member._id !== currentUserId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMember(member.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add Members - Only show if user is owner */}
            {isOwner ? (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Plus className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Add New Members</CardTitle>
                      <p className="text-sm text-gray-600">Invite users to join the project</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  {/* Invite by Email */}
                  <div className="space-y-3">
                    <Label htmlFor="invite-email" className="text-sm font-medium text-gray-700">Invite by Email</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleInviteByEmail} 
                        disabled={!inviteEmail.trim() || isLoading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Search Users */}
                  <div className="space-y-3">
                    <Label htmlFor="search-users" className="text-sm font-medium text-gray-700">Search Existing Users</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search-users"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Available Users */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Available Users</Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {filteredUsers.map((user, idx) => (
                        <div key={user.id ?? idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-green-200 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-sm font-semibold">
                                {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                              <p className="text-xs text-gray-600 truncate">{user.email}</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleInviteUser(user)}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Invite
                          </Button>
                        </div>
                      ))}
                      {filteredUsers.length === 0 && searchTerm && (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No users found matching your search.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Show message for non-owners */
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Eye className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">View Only</h3>
                  <p className="text-sm text-gray-600 max-w-sm">
                    Only the project owner can add or remove members from this project.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
