# Deployment Guide for UR Services

## Why GitHub Pages Doesn't Work

GitHub Pages only serves static HTML/CSS/JS files. Your application requires:
- Node.js runtime (custom server with Socket.io)
- PostgreSQL database
- Server-side API routes
- WebSocket connections

## Recommended Deployment Options

### Option 1: Vercel (Recommended - Easiest for Next.js)

Vercel is made by the creators of Next.js and provides the best integration.

**Steps:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project" and import your GitHub repository
4. Configure environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET` - Generate a random secret (use: `openssl rand -base64 32`)
   - `NODE_ENV` - Set to `production`
5. For the build command, Vercel will auto-detect Next.js
6. For the output directory, leave it as default
7. Deploy!

**Note:** Vercel uses serverless functions, so you'll need to adapt your Socket.io setup. Consider using Vercel's WebSocket support or migrate to a separate Socket.io server.

**Database:** Use a service like:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (integrated)
- [Supabase](https://supabase.com) (free tier available)
- [Neon](https://neon.tech) (serverless PostgreSQL)
- [Railway](https://railway.app) (PostgreSQL hosting)

---

### Option 2: Railway (Full Control)

Railway can host both your Next.js app and PostgreSQL database.

**Steps:**
1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project
3. Add a PostgreSQL database:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will provide a `DATABASE_URL`
4. Add your application:
   - Click "New" → "GitHub Repo" → Select your repository
   - Railway will auto-detect Next.js
5. Set environment variables:
   - `DATABASE_URL` - From the PostgreSQL service
   - `NEXTAUTH_URL` - Your Railway app URL
   - `NEXTAUTH_SECRET` - Generate a random secret
   - `NODE_ENV` - `production`
   - `PORT` - Railway will set this automatically
6. Update `server.ts` to use Railway's PORT:
   ```typescript
   const port = parseInt(process.env.PORT || "3000", 10)
   const hostname = process.env.HOSTNAME || "0.0.0.0"
   ```
7. Deploy!

---

### Option 3: Render

**Steps:**
1. Go to [render.com](https://render.com) and sign up
2. Create a new PostgreSQL database
3. Create a new Web Service:
   - Connect your GitHub repository
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`
4. Set environment variables (same as above)
5. Deploy!

---

## Important: Socket.io Configuration

Since most platforms use serverless functions, you may need to:

1. **Option A:** Use a separate Socket.io server (recommended for production)
   - Deploy Socket.io server separately (Railway, Render, or a VPS)
   - Update client to connect to the Socket.io server URL

2. **Option B:** Use Vercel's WebSocket support (if available)
   - Check Vercel's latest documentation for WebSocket support

3. **Option C:** Use polling fallback
   - Socket.io will automatically fall back to polling if WebSockets aren't available

---

## Environment Variables Checklist

Before deploying, ensure you have:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="https://your-deployed-url.com"
NEXTAUTH_SECRET="your-random-secret-key"
NODE_ENV="production"
PORT="3000"  # Usually set automatically by platform
```

---

## Database Migration

After setting up your database, run migrations:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to production database
DATABASE_URL="your-production-db-url" npm run db:push

# Or create and run migrations
DATABASE_URL="your-production-db-url" npm run db:migrate
```

---

## Quick Start: Vercel + Supabase (Recommended)

1. **Set up Supabase:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your database connection string

2. **Deploy to Vercel:**
   - Connect GitHub repo to Vercel
   - Add environment variables
   - Deploy

3. **Run migrations:**
   - Use Supabase SQL editor or run migrations locally with production DATABASE_URL

---

## Troubleshooting

- **Build fails:** Check that all dependencies are in `package.json`
- **Database connection errors:** Verify `DATABASE_URL` is correct
- **Socket.io not working:** Consider deploying Socket.io server separately
- **Environment variables:** Make sure all required vars are set in your platform
