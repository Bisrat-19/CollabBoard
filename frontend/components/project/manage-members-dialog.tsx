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
import { useToast } from "@/hooks/use-toast"
import { Search, UserPlus, X, Mail, Crown, UserIcon, Eye } from "lucide-react"
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isOwner ? (
              <UserPlus className="h-5 w-5 mr-2" />
            ) : (
              <Eye className="h-5 w-5 mr-2" />
            )}
            {isOwner ? "Manage Project Members" : "Project Members"}
          </DialogTitle>
          <DialogDescription>
            {isOwner 
              ? `Add or remove team members from "${project.name}"`
              : `View team members of "${project.name}"`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Current Members ({project.members.length})</h3>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {project.members.map((member, idx) => (
                <div key={member.id ?? idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold">
                        {member?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                      {member.role === "admin" ? (
                        <Crown className="h-3 w-3 mr-1" />
                      ) : (
                        <UserIcon className="h-3 w-3 mr-1" />
                      )}
                      {member.role}
                    </Badge>
                    {isOwner && member.id !== currentUserId && member._id !== currentUserId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Members - Only show if user is owner */}
          {isOwner && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add New Members</h3>

              {/* Invite by Email */}
              <div className="space-y-2">
                <Label htmlFor="invite-email">Invite by Email</Label>
                <div className="flex space-x-2">
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={handleInviteByEmail} disabled={!inviteEmail.trim() || isLoading}>
                    <Mail className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </div>

              {/* Search Users */}
              <div className="space-y-2">
                <Label htmlFor="search-users">Search Existing Users</Label>
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
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {filteredUsers.map((user, idx) => (
                  <div key={user.id ?? idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-semibold">
                          {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleInviteUser(user)}
                      disabled={isLoading}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Invite
                    </Button>
                  </div>
                ))}
                {filteredUsers.length === 0 && searchTerm && (
                  <div className="text-center py-4 text-gray-500">
                    No users found matching your search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show message for non-owners */}
          {!isOwner && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">View Only</h3>
                <p className="text-sm">
                  Only the project owner can add or remove members from this project.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
