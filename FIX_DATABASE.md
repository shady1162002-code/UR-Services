# Fix Database Connection - Step by Step Guide

## Problem
Registration fails because database tables don't exist. We can't connect to Supabase to create them.

## Solution Steps

### Option 1: Use Supabase Connection Pooler (RECOMMENDED)

1. Go to Supabase Dashboard → Settings → Database
2. Scroll to "Connection pooling" section
3. Click on "Session" mode tab (or "Transaction" mode)
4. Copy the connection string that looks like:
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-xx.pooler.supabase.com:6543/postgres
   ```
5. Update your `.env` file:
   - Replace DATABASE_URL with the pooler connection string
   - Make sure to URL-encode the password (e.g., @ becomes %40)
   - Add `?sslmode=require` at the end

### Option 2: Enable IP Restrictions

1. Go to Supabase Dashboard → Settings → Database
2. Find "Network Restrictions" section
3. Enable "Allow connections from anywhere" (or add your IP)
4. Save changes
5. Keep your current DATABASE_URL in .env

### Step 2: Push Database Schema

After fixing the connection, run:
```bash
npm run db:push
```

This will create all tables:
- companies
- users
- customers
- conversations
- messages

### Step 3: Verify

After `db:push` succeeds, try registering again. It should work!

## Alternative: Use Local PostgreSQL

If Supabase continues to have issues:

1. Install PostgreSQL locally
2. Create database: `CREATE DATABASE "ur-services";`
3. Update `.env`:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ur-services?schema=public"
   ```
4. Run `npm run db:push`
