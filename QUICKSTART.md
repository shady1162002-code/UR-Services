# Quick Start Guide

## Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   - Create a PostgreSQL database
   - Update `.env` with your database URL:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/ur-services?schema=public"
     NEXTAUTH_URL="http://localhost:3000"
     NEXTAUTH_SECRET="generate-a-random-secret-key-here"
     ```

3. **Initialize Database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## First Steps

1. **Register a Company**
   - Go to `http://localhost:3000/register`
   - Fill in company name, your name, email, and password
   - Click "Register"

2. **Login**
   - Go to `http://localhost:3000/login`
   - Use the credentials you just created

3. **Get Your Chat Link**
   - Navigate to Settings in the dashboard
   - Copy your public chat link (format: `/chat/{your-company-slug}`)

4. **Test Customer Chat**
   - Open the chat link in an incognito window
   - Enter a customer name and start chatting
   - Messages will appear in real-time in both windows

## Key Features to Test

- ✅ Company registration and login
- ✅ Dashboard navigation
- ✅ Real-time chat (customer and employee sides)
- ✅ Employee management (admin only)
- ✅ Conversation assignment
- ✅ Client listing

## Troubleshooting

**Socket.io not connecting?**
- Make sure you're using `npm run dev` (not `next dev`)
- The custom server is required for Socket.io to work

**Database errors?**
- Ensure PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Run `npm run db:push` to sync schema

**Authentication issues?**
- Make sure NEXTAUTH_SECRET is set in `.env`
- Clear browser cookies and try again
