"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getSavedCustomerName, saveCustomerName, getDeviceId } from "@/lib/device-storage"

interface Company {
  id: string
  name: string
  slug: string
}

interface Conversation {
  id: string
  status: string
  updatedAt: string
  messages: Array<{
    id: string
    content: string
    imageUrl?: string | null
    createdAt: string
  }>
  user: {
    id: string
    name: string
  } | null
}

export default function PublicChatPage() {
  const params = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [deviceId, setDeviceId] = useState<string>("")
  const [customerBlocked, setCustomerBlocked] = useState(false)
  const [previousConversations, setPreviousConversations] = useState<Conversation[]>([])
  const [showChat, setShowChat] = useState(false)
  const [showConversationList, setShowConversationList] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Get or create device ID
    if (typeof window !== "undefined") {
      const id = getDeviceId()
      setDeviceId(id)
      
      // Load saved customer name for this company
      if (params.slug) {
        const saved = getSavedCustomerName(params.slug as string)
        if (saved) {
          setCustomerName(saved.name)
          if (saved.email) {
            setCustomerEmail(saved.email)
          }
        }
      }
    }
  }, [params.slug])

  useEffect(() => {
    // Fetch company and conversations after deviceId is set
    if (params.slug) {
      fetchCompany()
    }
  }, [params.slug, deviceId])

  const fetchCompany = async () => {
    try {
      const url = deviceId 
        ? `/api/chat/${params.slug}?deviceId=${deviceId}`
        : `/api/chat/${params.slug}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || "Company not found")
        return
      }
      
      setCompany(data.company)
      
      // If we have previous conversations, show them
      if (data.conversations && data.conversations.length > 0) {
        setPreviousConversations(data.conversations)
        setShowConversationList(true)
        // Also update customer info if available
        if (data.customer) {
          setCustomerName(data.customer.name)
          if (data.customer.email) {
            setCustomerEmail(data.customer.email)
          }
          // Check if customer is blocked
          if (data.customer.blocked !== undefined) {
            setCustomerBlocked(data.customer.blocked)
          }
        }
      }
    } catch (error) {
      console.error("Fetch company error:", error)
      setError("Failed to load chat. Please check if the company exists.")
    } finally {
      setLoading(false)
    }
  }

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim() || !company) return

    try {
      // Save customer name to localStorage for future visits
      saveCustomerName(company.slug, customerName, customerEmail)

      const response = await fetch(`/api/chat/${params.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || undefined,
          deviceId: deviceId || undefined,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || "Failed to start conversation")
        return
      }

      setConversationId(data.conversation.id)
      setShowChat(true)
      setShowConversationList(false)
      setError("") // Clear any previous errors
    } catch (error) {
      console.error("Start chat error:", error)
      setError("Failed to start chat. Please try again.")
    }
  }

  const handleContinueConversation = async (conversationId: string) => {
    setConversationId(conversationId)
    setShowChat(true)
    setShowConversationList(false)
  }

  const handleNewChat = () => {
    setShowConversationList(false)
    setConversationId(null)
    setShowChat(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (error && !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (showChat && conversationId && company) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b border-gray-200 p-4 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="UR Services Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <h1 className="text-lg font-semibold">{company.name}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            conversationId={conversationId}
            customerName={customerName}
            isEmployee={false}
            customerBlocked={customerBlocked}
          />
        </div>
      </div>
    )
  }

  if (showConversationList && previousConversations.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Welcome back, {customerName}!</CardTitle>
            <CardDescription>Continue a previous conversation or start a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {previousConversations.map((conv) => {
                const lastMessage = conv.messages[0]
                const date = new Date(conv.updatedAt)
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleContinueConversation(conv.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            conv.status === "OPEN"
                              ? "bg-yellow-100 text-yellow-800"
                              : conv.status === "ASSIGNED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {conv.status}
                        </span>
                        {conv.user && (
                          <span className="text-sm text-gray-600">
                            with {conv.user.name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-gray-700 truncate">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
            <Button onClick={handleNewChat} className="w-full" variant="outline">
              Start New Conversation
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo.png"
              alt="UR Services Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-center">Chat with {company?.name}</CardTitle>
          <CardDescription className="text-center">Start a conversation with our team</CardDescription>
        </CardHeader>
        <form onSubmit={handleStartChat}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <Button type="submit" className="w-full">
              Start Chat
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
