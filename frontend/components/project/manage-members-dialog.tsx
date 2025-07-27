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
import { Search, UserPlus, X, Mail, Crown, UserIcon } from "lucide-react"

// Mock available users for invitation
// const availableUsers: User[] = [
//   {
//     id: "3",
//     name: "Alice Johnson",
//     email: "alice@example.com",
//     role: "user",
//     avatar: "/placeholder.svg?height=40&width=40",
//     createdAt: "2024-01-01T00:00:00Z",
//   },
//   {
//     id: "4",
//     name: "Bob Wilson",
//     email: "bob@example.com",
//     role: "user",
//     avatar: "/placeholder.svg?height=40&width=40",
//     createdAt: "2024-01-01T00:00:00Z",
//   },
//   {
//     id: "5",
//     name: "Carol Davis",
//     email: "carol@example.com",
//     role: "user",
//     avatar: "/placeholder.svg?height=40&width=40",
//     createdAt: "2024-01-01T00:00:00Z",
//   },
//   {
//     id: "6",
//     name: "David Brown",
//     email: "david@example.com",
//     role: "user",
//     avatar: "/placeholder.svg?height=40&width=40",
//     createdAt: "2024-01-01T00:00:00Z",
//   },
// ]

interface ManageMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onMembersUpdated: (project: Project) => void
}

export function ManageMembersDialog({ open, onOpenChange, project, onMembersUpdated }: ManageMembersDialogProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])

  useEffect(() => {
    if (open) {
      // Fetch users from backend
      fetch("http://localhost:5000/api/users", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setAllUsers(data))
        .catch(() => setAllUsers([]));
    }
  }, [open]);

  // Filter available users (exclude already added members)
  const filteredUsers = allUsers.filter(
    (user) =>
      !project.members.some((member) => member.id === user.id) &&
      !selectedUsers.some((selected) => selected.id === user.id) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddUser = (user: User) => {
    setSelectedUsers((prev) => [...prev, user])
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId))
  }

  const handleRemoveMember = async (memberId: string) => {
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
    if (!inviteEmail.trim()) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token");
      const emailToInvite = inviteEmail.trim(); // Store email before clearing
      const res = await fetch("http://localhost:5000/api/users/invite", {
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

  const handleSaveChanges = async () => {
    if (selectedUsers.length === 0) return

    setIsLoading(true)
    try {
      const updatedMembers = [...project.members, ...selectedUsers]
      const updatedProject = await projectService.updateProject(project.id, {
        ...project,
        members: updatedMembers,
      })

      onMembersUpdated(updatedProject)
      setSelectedUsers([])
      toast({
        title: "Members added!",
        description: `${selectedUsers.length} member(s) have been added to the project.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add members. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Manage Project Members
          </DialogTitle>
          <DialogDescription>Add or remove team members from "{project.name}"</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Members */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Current Members ({project.members.length})</h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
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
                    {member.id !== project.ownerId && (
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

          {/* Add Members */}
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
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
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
                  <Button size="sm" onClick={() => handleAddUser(user)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Users ({selectedUsers.length})</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {selectedUsers.map((user, idx) => (
                    <div key={user.id ?? idx} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveUser(user.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            {selectedUsers.length > 0 && (
              <Button
                onClick={handleSaveChanges}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? "s" : ""}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
