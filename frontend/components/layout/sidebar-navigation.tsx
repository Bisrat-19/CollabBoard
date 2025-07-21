"use client"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  Search,
  Plus,
  ChevronDown,
  Crown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"

interface SidebarNavigationProps {
  activeView: string
  onViewChange: (view: string) => void
  onCreateProject: () => void
  onShowAdminPanel: () => void
}

export function SidebarNavigation({
  activeView,
  onViewChange,
  onCreateProject,
  onShowAdminPanel,
}: SidebarNavigationProps) {
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "projects", label: "My Projects", icon: FolderOpen },
    { id: "teams", label: "Teams", icon: Users },
  ]

  const handleViewChange = (view: string) => {
    onViewChange(view)
    setIsMobileOpen(false) // Close mobile menu when navigating
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md hover:bg-purple-50 hover:text-purple-600"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isCollapsed ? "w-20" : "w-80"
        } bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white flex-col h-screen transition-all duration-300 ease-in-out relative
        ${isMobileOpen ? "fixed left-0 top-0 z-50 flex" : "hidden lg:flex"}
        `}
      >
        {/* Collapse/Expand Button - Desktop Only */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-10 bg-white text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-full w-6 h-6 p-0 shadow-lg border border-purple-200 hidden lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* User Profile - At Top */}
        <div className="p-4 lg:p-6 border-b border-purple-500/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full p-3 h-auto hover:bg-white/10">
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} w-full`}>
                  <Avatar className="h-8 w-8 lg:h-10 lg:w-10 ring-2 ring-white/20">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="bg-purple-500 text-white text-sm lg:text-base">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-white text-sm lg:text-base">{user?.name}</p>
                        <p className="text-xs lg:text-sm text-purple-200 truncate">{user?.email}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-purple-200" />
                    </>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="w-[200px] truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header */}
        {!isCollapsed && (
          <div className="px-4 lg:px-6 py-4 border-b border-purple-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-xl flex items-center justify-center">
                <FolderOpen className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold">CollabBoard</h1>
                <p className="text-purple-200 text-xs lg:text-sm">Project Management</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full bg-white/10 border border-purple-400/30 rounded-xl pl-10 pr-4 py-2 text-sm lg:text-base text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>
        )}

        {/* Navigation - Vertical List */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-visible">
          <div className="space-y-2 mb-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleViewChange(item.id)}
                className={`nav-item w-full text-sm lg:text-base ${
                  activeView === item.id
                    ? "bg-white/20 text-white font-medium"
                    : "text-purple-100 hover:bg-white/10 hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : "justify-start"}`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && item.label}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="space-y-3">
              <h3 className="text-purple-200 text-xs lg:text-sm font-medium uppercase tracking-wider">Quick Actions</h3>
              <Button
                onClick={onCreateProject}
                className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-start text-sm lg:text-base"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-3" />
                New Project
              </Button>

              {user?.role === "admin" && (
                <Button
                  onClick={onShowAdminPanel}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none justify-start text-sm lg:text-base"
                >
                  <Crown className="h-4 w-4 mr-3" />
                  Admin Panel
                </Button>
              )}
            </div>
          )}

          {/* Collapsed Quick Actions */}
          {isCollapsed && (
            <div className="space-y-2">
              <Button
                onClick={onCreateProject}
                className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-center p-3"
                variant="outline"
                title="New Project"
              >
                <Plus className="h-4 w-4" />
              </Button>

              {user?.role === "admin" && (
                <Button
                  onClick={onShowAdminPanel}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none justify-center p-3"
                  title="Admin Panel"
                >
                  <Crown className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
