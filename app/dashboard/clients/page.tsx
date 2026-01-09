"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Ban, Unlock, Trash2 } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string | null
  blocked: boolean
  createdAt: string
}

export default function ClientsPage() {
  const { data: session } = useSession()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      
      if (!response.ok) {
        console.error("Customers error:", data.error)
        setCustomers([])
        return
      }
      
      setCustomers(data.customers || [])
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleBlockToggle = async (customerId: string, currentlyBlocked: boolean) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !currentlyBlocked }),
      })

      if (response.ok) {
        fetchCustomers() // Refresh list
      } else {
        alert("Failed to update customer status")
      }
    } catch (error) {
      console.error("Block toggle error:", error)
      alert("An error occurred")
    }
  }

  const handleDeleteChatHistory = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete all chat history for this customer? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${customerId}/conversations`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Chat history deleted successfully")
        fetchCustomers() // Refresh list
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete chat history")
      }
    } catch (error) {
      console.error("Delete chat history error:", error)
      alert("An error occurred")
    }
  }

  const isAdmin = session?.user.role === "ADMIN"

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading clients...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600 mt-2">View all your customers</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No clients yet</p>
            </CardContent>
          </Card>
        ) : (
          customers.map((customer) => (
            <Card key={customer.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      {customer.blocked && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                          Blocked
                        </span>
                      )}
                    </div>
                    {customer.email && (
                      <CardDescription>{customer.email}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Joined: {format(new Date(customer.createdAt), "MMM d, yyyy")}
                  </p>
                  {isAdmin && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBlockToggle(customer.id, customer.blocked)}
                        className="flex-1"
                      >
                        {customer.blocked ? (
                          <>
                            <Unlock className="w-4 h-4 mr-2" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-2" />
                            Block
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteChatHistory(customer.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete History
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
