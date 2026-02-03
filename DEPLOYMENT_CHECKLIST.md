# 🚀 ZAPPY Deployment Checklist

## ✅ Pre-Deployment Updates

### 1. **Database Updates** (Run these in production)

After deployment, update the database via Super Admin panel or API:

#### **Option A: Via Super Admin Panel** (Recommended)
1. Go to: `https://olindelivery.vercel.app/admin/super`
2. Enter super admin password
3. Click **"Customização do App"** tab
4. Update these fields:
   - **Header Image**: `/header-zappy.png`
   - **Footer Text**: `© 2026 Noviapp Mobile Apps • ZAPPY®`
5. Click **"Salvar Configurações"**

#### **Option B: Via API Calls**
```bash
# Update footer
curl -X POST https://olindelivery.vercel.app/api/update-footer

# Update header
curl -X POST https://olindelivery.vercel.app/api/update-header-zappy
```

---

### 2. **Vercel Blob Storage** (Optional - for email logo)

The email template currently references:
```
https://rfbwcz2lzvkh4d7s.public.blob.vercel-storage.com/olindelivery-favicon.jpg
```

**Options:**
- **Keep it**: Old logo still works, just shows in emails
- **Update it**: Upload new ZAPPY logo to Vercel Blob
  1. Go to Vercel Dashboard → Storage → Blob
  2. Upload `public/icon.jpg` as `zappy-favicon.jpg`
  3. Update `app/api/admin/super-reset/route.ts` line 35 with new URL

**Recommendation**: Keep it for now, update later if needed.

---

## 📦 Deployment Steps

### **Step 1: Commit Changes**
```bash
git add .
git commit -m "Complete ZAPPY rebranding - Phase 2

- Updated all branding from OlinDelivery to ZAPPY
- Standardized footer: © 2026 Noviapp Mobile Apps • ZAPPY®
- Updated header to ZAPPY landscape image (256px)
- Added animated splash screen with gold background
- Updated 21 files across the project
- All admin pages, user pages, and emails rebranded
- Maintained backward compatibility with existing URLs"

git push origin main
```

### **Step 2: Verify Vercel Auto-Deploy**
1. Go to: https://vercel.com/noe-ramos-projects/olindelivery
2. Check deployment status
3. Wait for "Ready" status (~2-3 minutes)

### **Step 3: Post-Deployment Verification**
Visit these URLs and verify branding:

**Public Pages:**
- [ ] https://olindelivery.vercel.app/
- [ ] https://olindelivery.vercel.app/loja/bar-guarita
- [ ] https://olindelivery.vercel.app/login
- [ ] https://olindelivery.vercel.app/register
- [ ] https://olindelivery.vercel.app/checkout

**Admin Pages:**
- [ ] https://olindelivery.vercel.app/admin
- [ ] https://olindelivery.vercel.app/admin/bar-guarita
- [ ] https://olindelivery.vercel.app/admin/super

**Check for:**
- ✅ ZAPPY header (256px, gold background)
- ✅ Footer: "© 2026 Noviapp Mobile Apps • ZAPPY®"
- ✅ Splash screen animation (first visit)
- ✅ All text says "ZAPPY" not "OlinDelivery"

### **Step 4: Update Database Settings**
Run the Super Admin updates (see Section 1 above)

---

## 🔍 Testing Checklist

### **Functionality Tests:**
- [ ] Homepage loads all restaurants
- [ ] Can browse restaurant menus
- [ ] Can add items to cart
- [ ] Checkout process works
- [ ] WhatsApp messages send correctly
- [ ] Admin login works
- [ ] Restaurant admin panels accessible
- [ ] Super admin panel works

### **Branding Tests:**
- [ ] All headers show ZAPPY image
- [ ] All footers show standard text
- [ ] No "OlinDelivery" text visible
- [ ] Splash screen shows on first visit
- [ ] WhatsApp messages say "Enviado via ZAPPY 🚀"

---

## 📧 Client Communication (Optional)

If you want to inform clients about the rebrand:

**Email Template:**
```
Subject: 🎉 Novo Visual - Agora somos ZAPPY!

Olá [Nome do Restaurante],

Temos novidades! Renovamos nossa identidade visual e agora somos ZAPPY! 🚀

O que mudou:
✅ Novo nome: ZAPPY
✅ Novo visual moderno e profissional
✅ Mesma qualidade de sempre

O que NÃO mudou:
✅ Seu link de acesso continua o mesmo
✅ Sua senha continua a mesma
✅ Todos os seus pedidos e dados estão seguros

Acesse seu painel: https://olindelivery.vercel.app/admin/[seu-slug]

Qualquer dúvida, estamos à disposição!

Atenciosamente,
Equipe ZAPPY
```

---

## 🐛 Troubleshooting

### **If header doesn't update:**
- Clear browser cache (Ctrl + Shift + R)
- Check `/header-zappy.png` file exists in public folder
- Verify database settings in Super Admin

### **If footer doesn't update:**
- Code is hardcoded, should work immediately
- If not, check browser cache

### **If splash screen doesn't show:**
- Clear sessionStorage: `sessionStorage.clear()`
- Refresh page

### **If old branding still shows:**
- Hard refresh: Ctrl + Shift + R
- Clear all browser data
- Try incognito mode

---

## 📊 Rollback Plan (If Needed)

If something goes wrong:

```bash
# Revert to previous commit
git log --oneline  # Find previous commit hash
git revert [commit-hash]
git push origin main
```

Or in Vercel Dashboard:
1. Go to Deployments
2. Find previous deployment
3. Click "Promote to Production"

---

## ✅ Success Criteria

Deployment is successful when:
- ✅ All pages load without errors
- ✅ ZAPPY branding visible everywhere
- ✅ No "OlinDelivery" text visible
- ✅ All existing client links work
- ✅ Orders can be placed successfully
- ✅ Admin panels accessible

---

## 📝 Post-Deployment Notes

**What to monitor:**
- Check for any client support requests
- Monitor error logs in Vercel
- Test a few orders to ensure everything works

**Future improvements:**
- Consider custom domain (zappy.com.br)
- Update Vercel Blob images
- Update Google service account names (optional)

---

**Status**: Ready to deploy! 🚀
**Risk Level**: Low (backward compatible)
**Estimated Downtime**: 0 minutes
**Client Impact**: Visual only, no functionality changes
