"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Trash2, Loader2, Edit2, X, Check, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { messageService } from "@/services/message-service"
import { socketService } from "@/services/socket-service"
import type { Message, Project } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface ProjectChatProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onMessageCountChange?: (count: number) => void
}

export function ProjectChat({ project, isOpen, onClose, onMessageCountChange }: ProjectChatProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [unseenCount, setUnseenCount] = useState(0)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({})
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSeenMessageId = useRef<string | null>(null)

  // Initialize Socket.IO connection
  useEffect(() => {
    if (isOpen) {
      socketService.connect()
      
      // Join project room
      socketService.joinProject(project.id)
      
             // Set up real-time event listeners
       socketService.onNewMessage((message) => {
         setMessages(prev => [...prev, message])
         // Update unseen count if message is not from current user and chat is not open
         if (!isOwnMessage(message) && !isOpen) {
           setUnseenCount(prev => {
             const newCount = prev + 1
             onMessageCountChange?.(newCount)
             return newCount
           })
         }
         // Mark as seen if chat is open
         if (isOpen) {
           lastSeenMessageId.current = message._id
           
           // Save the last seen message ID to localStorage
           const currentUserId = user?.id || user?._id
           if (currentUserId) {
             const lastSeenKey = `lastSeenMessage_${project.id}_${currentUserId}`
             localStorage.setItem(lastSeenKey, message._id)
           }
         }
       })

      socketService.onMessageUpdated((updatedMessage) => {
        setMessages(prev => prev.map(msg => 
          msg._id === updatedMessage._id ? updatedMessage : msg
        ))
      })

      socketService.onMessageDeleted((messageId) => {
        setMessages(prev => prev.filter(msg => msg._id !== messageId))
      })

      socketService.onUserTyping((data) => {
        if (data.userId !== (user?.id || user?._id)) {
          setTypingUsers(prev => ({ ...prev, [data.userId]: data.userName }))
        }
      })

      socketService.onUserStopTyping((userId) => {
        setTypingUsers(prev => {
          const newTypingUsers = { ...prev }
          delete newTypingUsers[userId]
          return newTypingUsers
        })
      })

      return () => {
        // Clean up event listeners
        socketService.offNewMessage()
        socketService.offMessageUpdated()
        socketService.offMessageDeleted()
        socketService.offUserTyping()
        socketService.offUserStopTyping()
        socketService.leaveProject(project.id)
      }
    }
  }, [isOpen, project.id, user])

     // Clear unseen count when chat is opened
   useEffect(() => {
     if (isOpen) {
       console.log('ProjectChat: Chat opened, clearing unseen count')
       setUnseenCount(0)
       onMessageCountChange?.(0)
       
       // Save the last seen message ID to localStorage
       if (messages.length > 0) {
         const lastMessage = messages[messages.length - 1]
         lastSeenMessageId.current = lastMessage._id
         
         const currentUserId = user?.id || user?._id
         if (currentUserId) {
           const lastSeenKey = `lastSeenMessage_${project.id}_${currentUserId}`
           localStorage.setItem(lastSeenKey, lastMessage._id)
           console.log('ProjectChat: Saved last seen message ID:', lastMessage._id)
         }
       }
     }
   }, [isOpen, onMessageCountChange, messages, project.id, user])

  // Prevent background scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Load messages when chat opens
  useEffect(() => {
    if (isOpen) {
      loadMessages()
    } else {
      // When chat is not open, initialize last seen message if not set
      const currentUserId = user?.id || user?._id
      if (currentUserId && !lastSeenMessageId.current) {
        const lastSeenKey = `lastSeenMessage_${project.id}_${currentUserId}`
        const savedLastSeen = localStorage.getItem(lastSeenKey)
        if (!savedLastSeen) {
          // If no last seen message is saved, get the latest message and mark it as seen
          messageService.getProjectMessages(project.id).then(messages => {
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 1]
              lastSeenMessageId.current = lastMessage._id
              localStorage.setItem(lastSeenKey, lastMessage._id)
              console.log('ProjectChat: Initialized last seen message ID:', lastMessage._id)
            }
          }).catch(error => {
            console.error('Failed to initialize last seen message:', error)
          })
        } else {
          lastSeenMessageId.current = savedLastSeen
        }
      }
    }
  }, [isOpen, project.id, user])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && isOpen) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight
      }
    }
  }, [messages, isOpen])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking on the backdrop (outside the card)
      if (isOpen && event.target === event.currentTarget) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

     const loadMessages = async () => {
     setIsLoading(true)
     try {
       const projectMessages = await messageService.getProjectMessages(project.id)
       setMessages(projectMessages)
       
       // When chat is opened, all messages are considered seen
       if (isOpen) {
         console.log('ProjectChat: Loading messages, chat is open, clearing count')
         setUnseenCount(0)
         onMessageCountChange?.(0)
         if (projectMessages.length > 0) {
           const lastMessage = projectMessages[projectMessages.length - 1]
           lastSeenMessageId.current = lastMessage._id
           
           // Save the last seen message ID to localStorage
           const currentUserId = user?.id || user?._id
           if (currentUserId) {
             const lastSeenKey = `lastSeenMessage_${project.id}_${currentUserId}`
             localStorage.setItem(lastSeenKey, lastMessage._id)
             console.log('ProjectChat: Saved last seen message ID on load:', lastMessage._id)
           }
         }
       } else {
         // Calculate unseen messages (messages not sent by current user)
         const currentUserId = user?.id || user?._id
         const unseenMessages = projectMessages.filter(message => {
           const senderId = message.sender.id || message.sender._id
           return currentUserId && senderId && currentUserId.toString() !== senderId.toString()
         })
         
         setUnseenCount(unseenMessages.length)
         onMessageCountChange?.(unseenMessages.length)
       }
     } catch (error) {
       console.error("Failed to load messages:", error)
       toast({
         title: "Error",
         description: "Failed to load messages. Please try again.",
         variant: "destructive"
       })
     } finally {
       setIsLoading(false)
     }
   }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const sentMessage = await messageService.sendMessage(project.id, newMessage.trim())
      setMessages(prev => [...prev, sentMessage])
      setNewMessage("")
      
      // Emit real-time message to other users
      socketService.sendMessage(project.id, sentMessage)
      
      // Stop typing indicator
      handleStopTyping()
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId)
      setMessages(prev => prev.filter(msg => msg._id !== messageId))
      
      // Emit real-time deletion to other users
      socketService.deleteMessage(project.id, messageId)
      
      toast({
        title: "Success",
        description: "Message deleted successfully."
      })
    } catch (error) {
      console.error("Failed to delete message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message._id)
    setEditContent(message.content)
    setIsEditing(false)
    setTimeout(() => editInputRef.current?.focus(), 100)
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditContent("")
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editContent.trim()) return

    setIsEditing(true)
    try {
      const updatedMessage = await messageService.updateMessage(editingMessageId, editContent.trim())
      setMessages(prev => prev.map(msg => 
        msg._id === editingMessageId ? updatedMessage : msg
      ))
      
      // Emit real-time update to other users
      socketService.updateMessage(project.id, updatedMessage)
      
      setEditingMessageId(null)
      setEditContent("")
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Message updated successfully."
      })
    } catch (error) {
      console.error("Failed to update message:", error)
      toast({
        title: "Error",
        description: "Failed to update message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      const currentUserId = user?.id || user?._id
      const userName = user?.name || ''
      if (currentUserId) {
        socketService.startTyping(project.id, currentUserId.toString(), userName)
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 2000)
  }

  const handleStopTyping = () => {
    setIsTyping(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    
    const currentUserId = user?.id || user?._id
    if (currentUserId) {
      socketService.stopTyping(project.id, currentUserId.toString())
    }
  }

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const isOwnMessage = (message: Message) => {
    const currentUserId = user?.id || user?._id
    const senderId = message.sender.id || message.sender._id
    return currentUserId && senderId && currentUserId.toString() === senderId.toString()
  }

  const shouldShowDate = (message: Message, index: number) => {
    if (index === 0) return true
    
    const currentDate = new Date(message.createdAt).toDateString()
    const previousDate = new Date(messages[index - 1].createdAt).toDateString()
    
    return currentDate !== previousDate
  }

  const getTypingIndicator = () => {
    const typingUserNames = Object.values(typingUsers)
    if (typingUserNames.length === 0) return null
    
    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing...`
    } else if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`
    } else {
      return `${typingUserNames[0]} and ${typingUserNames.length - 1} others are typing...`
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
             <Card className="w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
                 <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                  Project Discussion
                  {unseenCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500"
                    >
                      {unseenCount > 99 ? '99+' : unseenCount}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-white/90 font-medium">{project.name}</p>
                  <div className="flex items-center space-x-1 text-white/70">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">{project.members?.length || 0} members</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 bg-gray-50/50 overflow-hidden">
                     {/* Messages Area */}
           <div className="flex-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                      <span className="text-gray-600">Loading messages...</span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <div className="bg-white rounded-full p-6 w-20 h-20 mx-auto mb-4 shadow-sm">
                      <MessageCircle className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                    <p className="text-sm">Start the conversation by sending the first message!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div key={message._id} className="w-full">
                        {/* Date separator */}
                        {shouldShowDate(message, index) && (
                          <div className="flex items-center justify-center my-6">
                            <div className="bg-white px-4 py-2 rounded-full shadow-sm border">
                              <span className="text-xs font-medium text-gray-600">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Message */}
                        <div className={`flex w-full ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-start max-w-[75%] ${isOwnMessage(message) ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white shadow-sm mt-1">
                              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                                {message.sender.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`mx-2 ${isOwnMessage(message) ? 'text-right' : 'text-left'}`}>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-gray-700">
                                  {message.sender.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(message.createdAt)}
                                </span>
                              </div>
                              
                              {editingMessageId === message._id ? (
                                <div className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm border">
                                  <Input
                                    ref={editInputRef}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    onKeyPress={handleEditKeyPress}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 text-sm border-0 focus-visible:ring-0"
                                    disabled={isEditing}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSaveEdit()
                                    }}
                                    disabled={isEditing}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCancelEdit()
                                    }}
                                    disabled={isEditing}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className={`rounded-lg px-3 py-2 shadow-sm ${
                                    isOwnMessage(message)
                                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                      : 'bg-white text-gray-900 border border-gray-200'
                                  }`}>
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                  {isOwnMessage(message) && (
                                    <div className="flex items-center justify-end space-x-1 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStartEdit(message)
                                        }}
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteMessage(message._id)
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {getTypingIndicator() && (
                      <div className="flex items-center space-x-2 text-gray-500 text-sm italic">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span>{getTypingIndicator()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

                     {/* Message Input */}
           <div className="border-t bg-white p-6 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex space-x-3">
              <div className="flex-1 relative" onClick={(e) => e.stopPropagation()}>
                                 <Input
                   ref={inputRef}
                   value={newMessage}
                   onChange={(e) => {
                     setNewMessage(e.target.value)
                     handleTyping()
                   }}
                   onKeyPress={handleKeyPress}
                   onClick={(e) => e.stopPropagation()}
                   placeholder="Type your message..."
                   disabled={isSending}
                   className="pr-12 py-3 text-sm border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                 />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  Enter to send
                </div>
              </div>
                             <Button
                 onClick={(e) => {
                   e.stopPropagation()
                   handleSendMessage()
                 }}
                 disabled={!newMessage.trim() || isSending}
                 className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-sm"
               >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 