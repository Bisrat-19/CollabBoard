"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Clock, Users, MessageCircle, Calendar, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Notification } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/config"

export function NotificationsDropdown() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotificationCount = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/notifications/count"), {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/notifications"), {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        // Update count from notifications
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification count on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      // Set up polling for real-time updates
      const interval = setInterval(fetchNotificationCount, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Also fetch when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const handleAccept = async (notificationId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(getApiUrl(`/notifications/${notificationId}/accept`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        const result = await res.json();
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
        );
        // Update count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Show success message with project name if available
        const projectName = result.project?.name || "the project";
        toast({ 
          title: "Invitation accepted!", 
          description: `You have successfully joined ${projectName}. The page will update to show your new project.` 
        });
        // Trigger dashboard/project list refresh invisibly
        window.dispatchEvent(new Event("projectListShouldRefresh"));
        setIsOpen(false);
      } else {
        const error = await res.json();
        toast({ 
          title: "Error", 
          description: error.message || "Failed to accept invitation",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Accept invitation error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDecline = async (notificationId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(getApiUrl(`/notifications/${notificationId}/decline`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        // Update count
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast({ title: "Invitation declined", description: "You have declined the invitation." });
      } else {
        const error = await res.json();
        toast({ 
          title: "Error", 
          description: error.message || "Failed to decline invitation",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to decline invitation",
        variant: "destructive"
      });
    }
  };

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
          {loading ? (
            <div className="p-6 sm:p-8 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1.5 sm:p-2 rounded-full bg-purple-100 text-purple-600`}>
                      <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs sm:text-sm font-medium text-gray-900 ${
                            !notification.read ? "font-semibold" : ""
                          }`}
                        >
                          {notification.type === "project-invite" && notification.data?.inviterName && notification.data?.projectId
                            ? notification.message
                            : notification.message}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                      {notification.type === "project-invite" && !notification.read && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleAccept(notification._id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 text-gray-700"
                            onClick={() => handleDecline(notification._id)}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
