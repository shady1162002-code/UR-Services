import { Server as SocketIOServer } from "socket.io"
import { Server as HTTPServer } from "http"
import { prisma } from "./prisma"

let io: SocketIOServer | null = null

export function initializeSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    // Join conversation room
    socket.on("join-conversation", async (conversationId: string) => {
      socket.join(`conversation:${conversationId}`)
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
    })

    // Leave conversation room
    socket.on("leave-conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
      console.log(`Socket ${socket.id} left conversation ${conversationId}`)
    })

    // Handle new message
    socket.on("new-message", async (data: {
      conversationId: string
      content?: string
      imageUrl?: string
      senderType: "CUSTOMER" | "EMPLOYEE"
      senderId?: string
    }) => {
      try {
        // Check if customer is blocked
        if (data.senderType === "CUSTOMER") {
          const conversation = await prisma.conversation.findUnique({
            where: { id: data.conversationId },
            include: { customer: true },
          })
          if (conversation?.customer.blocked) {
            socket.emit("error", { message: "You have been blocked from sending messages" })
            return
          }
        }

        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            content: data.content || "",
            imageUrl: data.imageUrl || null,
            senderType: data.senderType,
            senderId: data.senderId || null,
          },
          include: {
            conversation: {
              include: {
                customer: true,
              },
            },
          },
        })

        // Update conversation
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { updatedAt: new Date() },
        })

        // Broadcast to all clients in the conversation room
        io?.to(`conversation:${data.conversationId}`).emit("message-received", message)
      } catch (error) {
        console.error("Error handling new message:", error)
        socket.emit("error", { message: "Failed to send message" })
      }
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

  return io
}

export function getIO(): SocketIOServer | null {
  return io
}
