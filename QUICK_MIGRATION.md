# 🚀 QUICK START - Postgres Migration

## ⚡ Commands to Run (Copy & Paste)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link project
cd d:\Antigravity\olindelivery
vercel link

# 4. Pull environment variables
vercel env pull .env.local

# 5. Install Postgres client
npm install @vercel/postgres

# 6. Create database schema
vercel postgres sql -- --file=database/schema.sql

# 7. Migrate data
node database/migrate.js

# 8. Test locally
npm run dev
```

## ✅ Checklist

- [ ] Created Postgres database in Vercel dashboard
- [ ] Ran all 8 commands above
- [ ] Verified data in Vercel dashboard
- [ ] Told assistant migration is complete
- [ ] Assistant updates API routes
- [ ] Test everything works
- [ ] Deploy to production

## 🎯 Your Task NOW

1. **Go to**: https://vercel.com/dashboard
2. **Create Postgres database** (Storage → Create Database → Postgres → Neon)
3. **Run the 8 commands** above
4. **Tell me**: "Migration complete!"

Then I'll update all the code! 🚀
