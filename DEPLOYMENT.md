# Deployment Guide - GitHub & Vercel

## 🚀 Quick Deployment Steps

### Step 1: Prepare for Deployment

1. **Stop the development server** (Ctrl+C)

2. **Build the project** to check for errors:
```powershell
npm run build
```

### Step 2: Push to GitHub

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Complete OlinDelivery app with WhatsApp integration and image upload"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/olindelivery.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Via Vercel CLI (Recommended)

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Option B: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next
5. Add Environment Variables (see below)
6. Click "Deploy"

### Step 4: Configure Environment Variables on Vercel

Add these environment variables in Vercel Dashboard:

```
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key_here
SUPER_ADMIN_PASSWORD=your_master_password
```

**Important:** For `GOOGLE_PRIVATE_KEY`, copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Step 5: Configure Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain: `olindelivery.noveimagem.com.br`
4. Follow DNS configuration instructions

## ⚠️ Important Notes

### File Upload Limitation

**Current Setup:** Images are saved to local filesystem (`public/uploads/`)

**Problem:** Vercel has a read-only filesystem. Uploaded images will be lost on each deployment.

**Solutions:**

#### Option 1: Use Vercel Blob Storage (Recommended)
```bash
npm install @vercel/blob
```

#### Option 2: Use Cloudinary (Free tier available)
```bash
npm install cloudinary
```

#### Option 3: Use AWS S3

For now, the app will work but **uploaded images won't persist** between deployments.

### What Works on Vercel:
- ✅ All pages and routing
- ✅ Google Sheets integration
- ✅ WhatsApp links
- ✅ Order management
- ✅ Restaurant admin panels
- ⚠️ Image uploads (will work but won't persist)

### What Needs Update for Production:
- 🔄 Image storage (move to cloud storage)
- 🔄 Update upload route to use cloud storage

## 📋 Pre-Deployment Checklist

- [ ] All environment variables copied to Vercel
- [ ] Google Sheets API credentials working
- [ ] Super admin password set
- [ ] Build completes without errors (`npm run build`)
- [ ] All pages tested locally
- [ ] WhatsApp links tested
- [ ] Image upload tested (note: won't persist on Vercel)

## 🔧 Troubleshooting

### Build Fails
```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force .next
npm run build
```

### Environment Variables Not Working
- Make sure to redeploy after adding env vars
- Check that private key includes newlines (`\n`)
- Verify Google Sheets API is enabled

### Images Not Loading
- Expected on Vercel with current setup
- Implement cloud storage solution (see above)

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test Google Sheets connection
4. Check browser console for errors

---

**Ready to deploy?** Run the commands above! 🚀
