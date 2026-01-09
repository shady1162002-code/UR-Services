"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ChatInterface } from "@/components/chat/chat-interface"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Conversation {
  id: string
  customer: {
    id: string
    name: string
    email: string | null
    blocked?: boolean
  }
  user: {
    id: string
    name: string
  } | null
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversation()
  }, [params.id])

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${params.id}`)
      const data = await response.json()
      setConversation(data.conversation)
    } catch (error) {
      console.error("Failed to fetch conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div>Loading conversation...</div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div>Conversation not found</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 p-4 bg-white">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Conversations
          </Button>
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          conversationId={conversation.id}
          customerName={conversation.customer.name}
          isEmployee={true}
          employeeName={session?.user.name}
        />
      </div>
    </div>
  )
}
