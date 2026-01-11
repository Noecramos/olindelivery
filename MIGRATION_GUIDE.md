# 🚀 MIGRATION GUIDE: Google Sheets → Vercel Postgres

## ⏱️ Estimated Time: 30-45 minutes

---

## 📋 PHASE 1: Set Up Vercel Postgres (5 minutes)

### Step 1: Create Database

1. **Go to**: https://vercel.com/dashboard
2. **Log in** with your credentials
3. **Select project**: `olindelivery`
4. **Click**: "Storage" tab (top menu)
5. **Click**: "Create Database" button
6. **Select**: "Postgres"
7. **Provider**: Choose "Neon" (it's free!)
8. **Region**: Choose closest to your users (e.g., "US East" or "South America")
9. **Click**: "Create"

### Step 2: Verify Environment Variables

After creation, Vercel automatically adds these to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**You don't need to do anything** - Vercel handles this automatically!

---

## 📋 PHASE 2: Run Database Schema (5 minutes)

### Step 1: Install Vercel CLI (if not installed)

```bash
npm i -g vercel
```

### Step 2: Login to Vercel CLI

```bash
vercel login
```

### Step 3: Link Project

```bash
cd d:\Antigravity\olindelivery
vercel link
```

Select your project when prompted.

### Step 4: Pull Environment Variables

```bash
vercel env pull .env.local
```

This downloads the Postgres credentials to your local `.env.local` file.

### Step 5: Run Schema

```bash
vercel postgres sql -- --file=database/schema.sql
```

This creates all tables, indexes, and triggers.

**Expected output:**
```
✓ Created tables: restaurants, orders, products, categories
✓ Created indexes
✓ Created triggers
```

---

## 📋 PHASE 3: Install Dependencies (2 minutes)

```bash
npm install @vercel/postgres
```

This installs the Postgres client library.

---

## 📋 PHASE 4: Migrate Data (10 minutes)

### Step 1: Run Migration Script

```bash
node database/migrate.js
```

**Expected output:**
```
🚀 Starting migration from Google Sheets to Postgres...

📊 Migrating Restaurants...
  ✅ Migrated X restaurants

📊 Migrating Products...
  ✅ Migrated X products

📊 Migrating Categories...
  ✅ Migrated X categories

📊 Migrating Orders...
  ✅ Migrated X orders

✅ Migration completed successfully!
```

### Step 2: Verify Data

Go to Vercel Dashboard → Storage → Your Database → "Data" tab

You should see all your data there!

---

## 📋 PHASE 5: Update API Routes (I'll do this)

I'll create new API routes that use Postgres instead of Google Sheets.

Files to update:
- `app/api/restaurants/route.ts`
- `app/api/products/route.ts`
- `app/api/orders/route.ts`
- `app/api/categories/route.ts`

---

## 📋 PHASE 6: Test Locally (5 minutes)

```bash
npm run dev
```

Test:
1. Go to admin panel
2. Check if restaurants load
3. Check if products load
4. Try creating an order
5. Verify everything works

---

## 📋 PHASE 7: Deploy (2 minutes)

```bash
git add .
git commit -m "feat: Migrate from Google Sheets to Vercel Postgres"
git push origin main
```

Vercel will automatically deploy!

---

## ✅ SUCCESS CRITERIA

After migration, you should have:

- ✅ All restaurants in Postgres
- ✅ All products in Postgres
- ✅ All orders in Postgres
- ✅ All categories in Postgres
- ✅ No more 500 errors
- ✅ Fast page loads (<500ms)
- ✅ Reliable data persistence
- ✅ Proper validation working

---

## 🆘 TROUBLESHOOTING

### Error: "Command not found: vercel"

**Solution:**
```bash
npm install -g vercel
```

### Error: "Not linked to a project"

**Solution:**
```bash
vercel link
```

### Error: "POSTGRES_URL not found"

**Solution:**
```bash
vercel env pull .env.local
```

### Error: "Migration failed"

**Solution:**
1. Check `.env.local` has Postgres credentials
2. Verify database was created in Vercel
3. Check Google Sheets credentials still work

---

## 📞 NEXT STEPS

**After you complete Phase 1-4, tell me and I'll:**

1. ✅ Create new Postgres-based API routes
2. ✅ Update all components to use new APIs
3. ✅ Remove Google Sheets dependencies
4. ✅ Test everything
5. ✅ Deploy to production

---

## 🎯 START HERE

**Your action items RIGHT NOW:**

1. **Go to Vercel dashboard**
2. **Create Postgres database** (Phase 1)
3. **Run these commands:**
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull .env.local
   npm install @vercel/postgres
   vercel postgres sql -- --file=database/schema.sql
   node database/migrate.js
   ```

4. **Tell me when done!**

Then I'll update all the API routes and we'll be done! 🚀
