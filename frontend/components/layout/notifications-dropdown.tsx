"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Clock, Users, MessageCircle, Calendar, CheckCircle } from "lucide-react"

const notifications = [
  {
    id: 1,
    title: "New task assigned to you",
    description: "Design Homepage Layout - Due in 2 days",
    time: "5 minutes ago",
    type: "task",
    icon: Clock,
    unread: true,
  },
  {
    id: 2,
    title: "Project deadline approaching",
    description: "Website Redesign project deadline is tomorrow",
    time: "1 hour ago",
    type: "deadline",
    icon: Calendar,
    unread: true,
  },
  {
    id: 3,
    title: "Team member joined project",
    description: "Alice Johnson joined Mobile App Development",
    time: "2 hours ago",
    type: "team",
    icon: Users,
    unread: true,
  },
  {
    id: 4,
    title: "Comment on your task",
    description: "Jane Smith commented on 'User Authentication'",
    time: "3 hours ago",
    type: "comment",
    icon: MessageCircle,
    unread: false,
  },
  {
    id: 5,
    title: "Task completed",
    description: "Project Setup and Planning has been completed",
    time: "1 day ago",
    type: "completed",
    icon: CheckCircle,
    unread: false,
  },
]

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter((n) => n.unread).length

  const getTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-600"
      case "deadline":
        return "bg-red-100 text-red-600"
      case "team":
        return "bg-green-100 text-green-600"
      case "comment":
        return "bg-purple-100 text-purple-600"
      case "completed":
        return "bg-emerald-100 text-emerald-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 bg-transparent"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 sm:w-96 p-0" align="end" sideOffset={8}>
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</h3>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
              {unreadCount} new
            </Badge>
          </div>
        </div>

        <div className="max-h-80 sm:max-h-96 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const IconComponent = notification.icon
                return (
                  <div
                    key={notification.id}
                    className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      notification.unread ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-1.5 sm:p-2 rounded-full ${getTypeColor(notification.type)}`}>
                        <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs sm:text-sm font-medium text-gray-900 ${
                              notification.unread ? "font-semibold" : ""
                            }`}
                          >
                            {notification.title}
                          </p>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{notification.description}</p>
                        <p className="text-xs text-gray-500 mt-1 sm:mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs sm:text-sm"
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
