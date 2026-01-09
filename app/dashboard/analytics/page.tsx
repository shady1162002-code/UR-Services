"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, UserCheck, UserX } from "lucide-react"

interface Analytics {
  totalCustomers: number
  totalConversations: number
  activeConversations: number
  closedConversations: number
  blockedCustomers: number
  totalMessages: number
  recentCustomers: number // Customers in last 7 days
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      const data = await response.json()
      
      if (!response.ok) {
        console.error("Analytics error:", data.error)
        // Set default values on error
        setAnalytics({
          totalCustomers: 0,
          totalConversations: 0,
          activeConversations: 0,
          closedConversations: 0,
          blockedCustomers: 0,
          totalMessages: 0,
          recentCustomers: 0,
        })
        return
      }
      
      setAnalytics(data.analytics || {
        totalCustomers: 0,
        totalConversations: 0,
        activeConversations: 0,
        closedConversations: 0,
        blockedCustomers: 0,
        totalMessages: 0,
        recentCustomers: 0,
      })
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      // Set default values on error
      setAnalytics({
        totalCustomers: 0,
        totalConversations: 0,
        activeConversations: 0,
        closedConversations: 0,
        blockedCustomers: 0,
        totalMessages: 0,
        recentCustomers: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    )
  }

  // Use default values if analytics is null
  const displayAnalytics = analytics || {
    totalCustomers: 0,
    totalConversations: 0,
    activeConversations: 0,
    closedConversations: 0,
    blockedCustomers: 0,
    totalMessages: 0,
    recentCustomers: 0,
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Overview of your customer communication platform</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayAnalytics.recentCustomers} new in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.totalConversations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayAnalytics.activeConversations} active, {displayAnalytics.closedConversations} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.totalMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time messages sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.activeConversations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Open or assigned conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Customers</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.blockedCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Customers who cannot send messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAnalytics.closedConversations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed conversations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
