"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)
  const chatLink = session?.user.companySlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/chat/${session.user.companySlug}`
    : ""

  const copyToClipboard = async () => {
    if (chatLink) {
      try {
        await navigator.clipboard.writeText(chatLink)
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000) // Reset after 2 seconds
      } catch (error) {
        console.error("Failed to copy:", error)
      }
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your company settings</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Public Chat Link</CardTitle>
            <CardDescription>
              Share this link with your customers to start conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={chatLink} readOnly className="flex-1" />
              <Button 
                onClick={copyToClipboard} 
                variant="outline"
                className={`transition-all duration-300 ${
                  copied 
                    ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100" 
                    : ""
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 animate-in fade-in duration-200" />
                    <span className="animate-in fade-in duration-200">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Customers can use this link to start a chat with your team without needing to sign up.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Your company details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {session?.user.companySlug || "Loading..."}
                </p>
              </div>
              <div>
                <Label>Your Role</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {session?.user.role || "Loading..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
