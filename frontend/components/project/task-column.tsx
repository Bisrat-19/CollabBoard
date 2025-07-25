"use client"

import type { Column, Task } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Calendar, MessageCircle } from "lucide-react"

interface TaskColumnProps {
  column: Column
  onTaskClick: (task: Task) => void
  onCreateTask: () => void
}

export function TaskColumn({ column, onTaskClick, onCreateTask }: TaskColumnProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200"
      case "medium":
        return "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border-amber-200"
      case "low":
        return "bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border-emerald-200"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="flex-shrink-0 w-80">
      <div className="board-column">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h3 className="font-bold text-gray-900 text-lg">{column.title}</h3>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 font-medium">
              {column.tasks.length}
            </Badge>
          </div>
          <Button size="sm" variant="ghost" onClick={onCreateTask} className="hover:bg-purple-50 hover:text-purple-600">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Task List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {column.tasks.map((task, idx) => (
            <Card
              key={task.id ? task.id : `task-${idx}`}
              className={`task-card priority-${task.priority} hover:scale-105`}
              onClick={() => onTaskClick(task)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 flex-1 mr-2">{task.title}</h4>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)} shrink-0`}>
                      {task.priority}
                    </Badge>
                  </div>

                  {task.description && <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>}

                  {task.assignedTo && (
                    <div className="flex items-center space-x-2 p-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                      <Avatar className="h-6 w-6 ring-2 ring-white">
                        <AvatarImage src={task.assignedTo.avatar || "/placeholder.svg"} alt={task.assignedTo.name} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                          {task.assignedTo.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-gray-700">Assigned to {task.assignedTo.name}</span>
                    </div>
                  )}

                  {task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {task.comments.length > 0 && (
                      <div className="flex items-center text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-md">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {task.comments.length}
                      </div>
                    )}
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
