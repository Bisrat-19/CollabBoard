"use client"

import type { Project } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, UserIcon } from "lucide-react"

interface TeamsViewProps {
  projects: Project[]
}

export function TeamsView({ projects }: TeamsViewProps) {
  // Get all unique team members across projects
  const allMembers = projects.reduce(
    (acc, project) => {
      project.members.forEach((member) => {
        if (!acc.find((m) => m.id === member.id)) {
          acc.push({
            ...member,
            projectCount: projects.filter((p) => p.members.some((pm) => pm.id === member.id)).length,
          })
        }
      })
      return acc
    },
    [] as Array<any>,
  )

  return (
    <div>
      {/* Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs lg:text-sm font-medium">Total Members</p>
                <p className="text-2xl lg:text-3xl font-bold">{allMembers.length}</p>
              </div>
              <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
                <Users className="h-4 w-4 lg:h-6 lg:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs lg:text-sm font-medium">Admins</p>
                <p className="text-2xl lg:text-3xl font-bold">{allMembers.filter((m) => m.role === "admin").length}</p>
              </div>
              <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
                <Crown className="h-4 w-4 lg:h-6 lg:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs lg:text-sm font-medium">Active Projects</p>
                <p className="text-2xl lg:text-3xl font-bold">{projects.length}</p>
              </div>
              <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
                <UserIcon className="h-4 w-4 lg:h-6 lg:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {allMembers.map((member, idx) => (
          <Card key={member.id ?? idx} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10 lg:h-12 lg:w-12">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                    {member?.name?.charAt(0) ?? "?"}

                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base lg:text-lg truncate">{member.name}</CardTitle>
                  <CardDescription className="truncate text-sm">{member.email}</CardDescription>
                </div>
                <Badge variant={member.role === "admin" ? "default" : "secondary"} className="flex-shrink-0">
                  {member.role === "admin" ? <Crown className="h-3 w-3 mr-1" /> : <UserIcon className="h-3 w-3 mr-1" />}
                  <span className="hidden sm:inline">{member.role}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Projects</span>
                  <span className="font-medium">{member.projectCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Joined</span>
                  <span className="font-medium text-xs lg:text-sm">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
