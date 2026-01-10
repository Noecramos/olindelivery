# 🗄️ Vercel Blob Storage Setup

## ✅ **What Was Changed:**

The image upload system has been migrated from **local filesystem** to **Vercel Blob Storage** to fix the "read-only file system" error on Vercel.

### **Before (Filesystem - ❌ Doesn't work on Vercel):**
```typescript
// Tried to write to /var/task/public/uploads/
await writeFile(filepath, buffer);
```

### **After (Vercel Blob - ✅ Works everywhere):**
```typescript
// Uploads to Vercel's cloud storage
const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
});
```

---

## 🔧 **Setup Required:**

### **1. Enable Vercel Blob on Your Project:**

Go to your Vercel project dashboard:
https://vercel.com/noe-ramos-projects/olindelivery

1. Click on **"Storage"** tab
2. Click **"Create Database"**
3. Select **"Blob"**
4. Click **"Continue"**
5. Name it: `olindelivery-images`
6. Click **"Create"**

### **2. Connect to Your Project:**

After creating the Blob store:
1. Click **"Connect to Project"**
2. Select your project: `olindelivery`
3. Click **"Connect"**

This will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable to your project.

### **3. Redeploy:**

After connecting, trigger a new deployment:
```bash
git push origin main
```

Or manually redeploy from Vercel dashboard.

---

## 📋 **Environment Variable (Auto-Added):**

When you connect Blob storage, Vercel automatically adds:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

**You don't need to manually add this!** It's added automatically when you connect the storage.

---

## 🎯 **How It Works:**

### **Upload Flow:**
1. User uploads image via admin panel
2. API validates file (type, size)
3. File is uploaded to Vercel Blob
4. Vercel returns a permanent URL: `https://xxxxx.public.blob.vercel-storage.com/filename.jpg`
5. This URL is saved to Google Sheets
6. Images are served directly from Vercel's CDN

### **Benefits:**
- ✅ **Persistent** - Images never disappear on redeployment
- ✅ **Fast** - Served from global CDN
- ✅ **Scalable** - No storage limits on serverless
- ✅ **Secure** - Built-in access control
- ✅ **Free tier** - 500MB storage included

---

## 📊 **Vercel Blob Free Tier:**

- **Storage:** 500 MB
- **Bandwidth:** 1 GB/month
- **Requests:** Unlimited

For a delivery app with ~20 restaurants, this is more than enough!

---

## 🔄 **Migration Notes:**

### **Existing Images:**
- Old images using `/api/images/[filename]` will still work locally
- For production, you'll need to re-upload restaurant images
- Or manually migrate existing images to Blob storage

### **Local Development:**
- Vercel Blob works in development too!
- Just run `vercel env pull` to get the token locally
- Or the upload will fail gracefully with a clear error message

---

## 🚀 **Quick Setup Commands:**

```bash
# Pull environment variables (including BLOB_READ_WRITE_TOKEN)
vercel env pull

# Test locally
npm run dev

# Deploy to production
git add .
git commit -m "Implement Vercel Blob storage for images"
git push origin main
```

---

## 📝 **Testing:**

After setup, test the upload:

1. Go to: https://olindelivery.vercel.app/admin/super
2. Login with: `admin123`
3. Try to upload a restaurant image
4. Should receive a URL like: `https://xxxxx.public.blob.vercel-storage.com/...`

---

## ⚠️ **Important:**

- **Don't commit** the `BLOB_READ_WRITE_TOKEN` to Git
- It's automatically added by Vercel when you connect storage
- For local dev, use `vercel env pull` to get it

---

## 📚 **Documentation:**

- Vercel Blob Docs: https://vercel.com/docs/storage/vercel-blob
- SDK Reference: https://vercel.com/docs/storage/vercel-blob/using-blob-sdk

---

**Status:** ✅ Code updated, waiting for Blob storage setup on Vercel
