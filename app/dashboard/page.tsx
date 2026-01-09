"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

interface Conversation {
  id: string
  status: string
  customer: {
    id: string
    name: string
    email: string | null
  }
  user: {
    id: string
    name: string
  } | null
  messages: Array<{
    id: string
    content: string
    createdAt: string
  }>
  updatedAt: string
}

export default function ConversationsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations")
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
    } finally {
      setLoading(false)
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

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) return "No messages yet"
    return conversation.messages[0].content
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading conversations...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-600 mt-2">Manage your customer conversations</p>
      </div>

      <div className="space-y-4">
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No conversations yet</p>
            </CardContent>
          </Card>
        ) : (
          conversations.map((conversation) => (
            <Link key={conversation.id} href={`/dashboard/conversations/${conversation.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>{getInitials(conversation.customer.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {conversation.customer.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {format(new Date(conversation.updatedAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {getLastMessage(conversation)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            conversation.status === "OPEN"
                              ? "bg-yellow-100 text-yellow-800"
                              : conversation.status === "ASSIGNED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {conversation.status}
                        </span>
                        {conversation.user && (
                          <span className="text-xs text-gray-500">
                            Assigned to {conversation.user.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
