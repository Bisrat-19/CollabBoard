"use client"

import type { Column, Task } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Calendar, MessageCircle, Clock, Tag, User } from "lucide-react"

interface TaskColumnProps {
  column: Column
  onTaskClick: (task: Task) => void
  onCreateTask: () => void
}

export function TaskColumn({ column, onTaskClick, onCreateTask }: TaskColumnProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-sm"
      case "medium":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm"
      case "low":
        return "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-sm"
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-sm"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴"
      case "medium":
        return "🟡"
      case "low":
        return "🟢"
      default:
        return "⚪"
    }
  }

  return (
    <div className="flex-shrink-0 w-72 sm:w-80 lg:w-96">
      <div className="board-column">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">{column.title}</h3>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium text-xs border-0 shadow-sm">
              {column.tasks.length}
            </Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={onCreateTask} className="hover:bg-purple-50 hover:text-purple-600 p-1 sm:p-2 rounded-full">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Task List */}
        <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto custom-scrollbar pr-1 sm:pr-2">
          {column.tasks.map((task, idx) => (
            <Card
              key={task.id ? task.id : `task-${idx}`}
              className={`task-card priority-${task.priority} hover:scale-[1.02] cursor-pointer transition-all duration-200 hover:shadow-lg border-0 shadow-sm bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50`}
              onClick={() => onTaskClick(task)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="space-y-3 sm:space-y-4">
                  {/* Header: Title and Priority */}
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2 flex-1 leading-tight">
                      {task.title}
                    </h4>
                    <Badge variant="outline" className={`text-xs font-semibold px-2 py-1 ${getPriorityColor(task.priority)} shrink-0`}>
                      {getPriorityIcon(task.priority)} {task.priority}
                    </Badge>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs sm:text-sm text-gray-600 truncate leading-relaxed">
                        {task.description.length > 60
                          ? `${task.description.substring(0, 60)}...`
                          : task.description}
                      </p>
                    </div>
                  )}

                  {/* Labels */}
                  {task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {task.labels.slice(0, 3).map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200 font-medium px-2 py-1">
                          <Tag className="h-3 w-3 mr-1" />
                          {label}
                        </Badge>
                      ))}
                      {task.labels.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border border-gray-200 font-medium px-2 py-1">
                          +{task.labels.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Assigned User */}
                  {task.assignedTo && (
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                        <AvatarImage src={task.assignedTo.avatar} />
                        <AvatarFallback className="text-sm bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold">
                          {task.assignedTo.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          Assigned to {task.assignedTo.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {task.assignedTo.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer: Metadata */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-gray-600 bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                          <Calendar className="h-3 w-3 mr-1.5 text-amber-600" />
                          <span className="hidden sm:inline font-medium">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span className="sm:hidden font-medium">
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {task.comments.length > 0 && (
                        <div className="flex items-center text-xs text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 px-2.5 py-1.5 rounded-lg border border-blue-200">
                          <MessageCircle className="h-3 w-3 mr-1.5 text-blue-600" />
                          <span className="font-medium">{task.comments.length}</span>
                        </div>
                      )}
                      
                      {/* Created date */}
                      <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
                        <Clock className="h-3 w-3 mr-1.5" />
                        <span className="font-medium">
                          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
