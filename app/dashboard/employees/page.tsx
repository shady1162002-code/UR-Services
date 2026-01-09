"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { Trash2 } from "lucide-react"

interface Employee {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function EmployeesPage() {
  const { data: session } = useSession()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "AGENT" as "ADMIN" | "AGENT",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      setEmployees(data.employees || [])
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (session?.user.role !== "ADMIN") {
      setError("Only admins can add employees")
      return
    }

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create employee")
        return
      }

      setEmployees([...employees, data.employee])
      setFormData({ name: "", email: "", password: "", role: "AGENT" })
      setShowForm(false)
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || "Failed to delete employee")
        return
      }

      // Remove from list
      setEmployees(employees.filter((emp) => emp.id !== employeeId))
    } catch (error) {
      console.error("Delete employee error:", error)
      alert("An error occurred. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading employees...</div>
      </div>
    )
  }

  const isAdmin = session?.user.role === "ADMIN"

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage your team members</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Employee"}
          </Button>
        )}
      </div>

      {showForm && isAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Employee</CardTitle>
            <CardDescription>Create a new employee account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "ADMIN" | "AGENT" })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Create Employee
              </Button>
            </CardContent>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardHeader>
              <CardTitle className="text-lg">{employee.name}</CardTitle>
              <CardDescription>{employee.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role:</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      employee.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {employee.role}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Joined: {format(new Date(employee.createdAt), "MMM d, yyyy")}
                </div>
                {isAdmin && employee.id !== session?.user.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Employee
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
