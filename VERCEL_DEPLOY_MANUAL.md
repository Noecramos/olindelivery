# 🚀 VERCEL DEPLOYMENT - MANUAL STEPS

## ⚡ Quick Deploy via Vercel Dashboard

Since CLI installation is taking time, use the dashboard for faster deployment:

### Step 1: Go to Vercel
Visit: **https://vercel.com/new**

### Step 2: Import Repository
1. Click **"Import Git Repository"**
2. If not connected, authorize GitHub
3. Search for: **`olindelivery`**
4. Click **"Import"** on the `Noecramos/olindelivery` repository

### Step 3: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave as default)

**Build Settings:** (leave as default)
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these **4 variables**:

#### 1. GOOGLE_SHEET_ID
```
1mDDzPHxdBjdmTjcr8FjdMBKNmfFJbwLPgdNPWLxCwBs
```

#### 2. GOOGLE_SERVICE_ACCOUNT_EMAIL
```
olindelivery@olindelivery.iam.gserviceaccount.com
```

#### 3. GOOGLE_PRIVATE_KEY
**Important:** Copy from your `.env.local` file - the ENTIRE key including:
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
...entire key here...
-----END PRIVATE KEY-----
```

**Note:** Make sure to include the `\n` characters or paste it exactly as it appears in `.env.local`

#### 4. SUPER_ADMIN_PASSWORD
```
[Your master admin password]
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://olindelivery-xxx.vercel.app`

### Step 6: Test Deployment

Visit your new URL and test:
- ✅ Homepage loads
- ✅ Restaurant pages work
- ✅ Admin login works
- ✅ Super admin works
- ✅ Orders can be placed
- ✅ WhatsApp links work

### Step 7: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add: `olindelivery.noveimagem.com.br`
4. Follow DNS configuration instructions

## ⚠️ Known Limitations

### Image Uploads
- **Will work** but images **won't persist** after redeployment
- Vercel has read-only filesystem
- **Solution:** Implement cloud storage (Cloudinary, AWS S3, or Vercel Blob)

### For Now:
- Existing images in Google Sheets will work if they're external URLs
- New uploads will work temporarily but be lost on next deployment

## 🎯 Deployment Checklist

- [ ] Vercel account logged in
- [ ] Repository imported
- [ ] All 4 environment variables added
- [ ] Deployment started
- [ ] Build successful
- [ ] App tested and working
- [ ] Custom domain configured (optional)

## 📞 Need Help?

If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are correct
3. Make sure Google Sheets API is enabled
4. Check that private key is formatted correctly

---

**Start deployment now at: https://vercel.com/new** 🚀
