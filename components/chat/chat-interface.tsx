"use client"

import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Image as ImageIcon, X } from "lucide-react"
import { format } from "date-fns"

interface Message {
  id: string
  content: string
  imageUrl: string | null
  senderType: "CUSTOMER" | "EMPLOYEE"
  senderId: string | null
  createdAt: string
}

interface ChatInterfaceProps {
  conversationId: string
  customerName: string
  isEmployee?: boolean
  employeeName?: string
  customerBlocked?: boolean
}

export function ChatInterface({
  conversationId,
  customerName,
  isEmployee = false,
  employeeName,
  customerBlocked = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Fetch initial messages
    fetchMessages()

    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
    const newSocket = io(socketUrl, {
      path: "/api/socket",
    })

    newSocket.on("connect", () => {
      console.log("Connected to socket")
      newSocket.emit("join-conversation", conversationId)
    })

    newSocket.on("message-received", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    setSocket(newSocket)

    return () => {
      newSocket.emit("leave-conversation", conversationId)
      newSocket.disconnect()
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      const data = await response.json()
      const messages = data.conversation?.messages || []
      // Ensure all messages have imageUrl field
      const messagesWithImages = messages.map((msg: any) => ({
        ...msg,
        imageUrl: msg.imageUrl || null,
      }))
      setMessages(messagesWithImages)
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedImage) return

    setUploading(true)
    let imageUrl: string | null = null

    try {
      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData()
        formData.append("file", selectedImage)
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image")
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      const messageContent = newMessage.trim()
      setNewMessage("")
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      if (isEmployee) {
        // For employees, use API (has auth)
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            content: messageContent || undefined,
            imageUrl: imageUrl || undefined,
            senderType: "EMPLOYEE",
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to send message")
        }

        const data = await response.json()
        // Add the message to the list immediately for better UX
        if (data.message) {
          setMessages((prev) => [...prev, data.message])
        }
      } else {
        // Check if customer is blocked
        if (customerBlocked) {
          alert("You are blocked from sending messages")
          return
        }
        
        // For customers, use socket (no auth needed)
        if (socket) {
          socket.emit("new-message", {
            conversationId,
            content: messageContent || undefined,
            imageUrl: imageUrl || undefined,
            senderType: "CUSTOMER",
          })
        } else {
          throw new Error("Socket not connected")
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(customerName)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{customerName}</h3>
            {isEmployee && employeeName && (
              <p className="text-sm text-gray-500">You ({employeeName})</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isFromCustomer = message.senderType === "CUSTOMER"
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isFromCustomer ? "" : "flex-row-reverse"}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {isFromCustomer
                    ? getInitials(customerName)
                    : getInitials(employeeName || "Agent")}
                </AvatarFallback>
              </Avatar>
              <div className={`flex-1 ${isFromCustomer ? "" : "flex flex-col items-end"}`}>
                <div
                  className={`inline-block max-w-[70%] rounded-lg p-3 ${
                    isFromCustomer
                      ? "bg-white border border-gray-200"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.imageUrl && (
                    <div className="mb-2">
                      <Image
                        src={message.imageUrl}
                        alt="Message attachment"
                        width={300}
                        height={300}
                        className="rounded-lg object-cover max-w-full h-auto"
                        unoptimized
                      />
                    </div>
                  )}
                  {message.content && (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1 block">
                  {format(new Date(message.createdAt), "h:mm a")}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {customerBlocked && !isEmployee && (
        <div className="border-t border-gray-200 p-4 bg-red-50">
          <div className="text-center text-red-600 font-semibold">
            You are Blocked
          </div>
          <p className="text-center text-sm text-red-500 mt-1">
            You cannot send messages. Please contact support.
          </p>
        </div>
      )}
      {(!customerBlocked || isEmployee) && (
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover max-w-[200px] max-h-[200px]"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </label>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={customerBlocked && !isEmployee}
            />
            <Button 
              type="submit" 
              disabled={(!newMessage.trim() && !selectedImage) || uploading || (customerBlocked && !isEmployee)}
            >
              {uploading ? (
                "Sending..."
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
