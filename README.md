# UR Services - Multi-Tenant Customer Communication Platform

A full-stack SaaS platform for customer communication, similar to Intercom/Tawk.to, built with Next.js, TypeScript, Prisma, and WebSockets.

## Features

- **Company Registration**: Companies can sign up and get a unique public chat link
- **Public Chat**: Customers can chat with companies without authentication
- **Company Dashboard**: Manage conversations, clients, employees, and settings
- **Employee Management**: Add employees with admin/agent roles
- **Real-time Chat**: WebSocket-based real-time messaging
- **Multi-tenant**: Complete data isolation between companies

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Credentials + JWT)
- **Real-time**: Socket.io
- **UI Components**: Radix UI + Custom components

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your database URL and NextAuth secret:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ur-services?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NODE_ENV="development"
```

3. Set up the database:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── companies/    # Company registration
│   │   ├── employees/    # Employee management
│   │   ├── conversations/# Conversation CRUD
│   │   ├── messages/     # Message creation
│   │   ├── chat/         # Public chat API
│   │   └── customers/    # Customer listing
│   ├── chat/[slug]/      # Public chat page
│   ├── dashboard/        # Company dashboard
│   │   ├── conversations/# Conversation list & detail
│   │   ├── clients/      # Customer list
│   │   ├── employees/    # Employee management
│   │   └── settings/     # Company settings
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # Reusable UI components
│   ├── chat/             # Chat components
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── access-control.ts # Multi-tenant access control
│   ├── socket-server.ts  # Socket.io server setup
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── server.ts             # Custom server with Socket.io
└── middleware.ts         # NextAuth middleware

```

## Database Schema

- **Company**: Stores company information with unique slug
- **User**: Employees (admin/agent roles) belonging to companies
- **Customer**: Customers who chat with companies
- **Conversation**: Chat conversations between customers and companies
- **Message**: Individual messages in conversations

## API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Companies
- `POST /api/companies/register` - Register new company

### Employees
- `GET /api/employees` - List employees (requires auth)
- `POST /api/employees` - Create employee (requires admin)

### Conversations
- `GET /api/conversations` - List conversations (requires auth)
- `GET /api/conversations/[id]` - Get conversation details
- `PATCH /api/conversations/[id]` - Assign conversation to employee

### Messages
- `POST /api/messages` - Create message

### Chat (Public)
- `GET /api/chat/[slug]` - Get company by slug
- `POST /api/chat/[slug]` - Create conversation for customer

### Customers
- `GET /api/customers` - List customers (requires auth)

## Usage

### For Companies

1. **Register**: Go to `/register` and create your company account
2. **Login**: Access your dashboard at `/dashboard`
3. **Get Chat Link**: Find your public chat link in Settings
4. **Add Employees**: Add team members in the Employees section
5. **Manage Conversations**: View and respond to customer chats

### For Customers

1. **Access Chat**: Visit `/chat/{company-slug}` (provided by the company)
2. **Enter Details**: Provide your name and optional email
3. **Start Chatting**: Begin real-time conversation with the company

## WebSocket Events

### Client → Server
- `join-conversation`: Join a conversation room
- `leave-conversation`: Leave a conversation room
- `new-message`: Send a new message

### Server → Client
- `message-received`: Receive a new message
- `error`: Error occurred

## Security Features

- Multi-tenant data isolation
- Role-based access control (Admin/Agent)
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes with middleware

## Development

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Base URL of your application
- `NEXTAUTH_SECRET`: Secret key for JWT signing (generate a random string)
- `NODE_ENV`: Environment (development/production)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
