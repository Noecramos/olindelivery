# 🔄 ZAPPY Complete Rebranding - Phase 2

## Files to Update

### ✅ Already Completed (Phase 1)
- app/layout.tsx
- public/manifest.json
- app/page.tsx
- app/checkout/page.tsx
- app/test-whatsapp/page.tsx
- app/register/page.tsx
- package.json

### 🔧 Remaining Code Files (18 files)

#### App Files
1. app/context/CartContext.tsx - Line 43 (console log)
2. app/components/RestaurantHeader.tsx - Line 21 (default name)
3. app/checkout/page.tsx - Lines 254, 508 (User-Agent, fallback name)
4. app/components/admin/RestaurantSettings.tsx - Line 408 (User-Agent)
5. app/admin/[slug]/page.tsx - Lines 327, 458, 968 (3 references)
6. app/admin/super/page.tsx - Lines 70, 224, 386 (WhatsApp message, subtitle, footer)
7. app/admin/page.tsx - Lines 21, 83 (subtitle, footer)
8. app/api/admin/super-reset/route.ts - Lines 29, 31, 35, 45, 49 (email template)

#### Root JS Files
9. test-whatsapp-message.js - Line 37
10. check_distance.js - Lines 26, 54
11. check-setup.js - Line 3

### 📄 Documentation Files (40+ files)
- All .md files in root directory
- These are documentation only, not critical for functionality

### 🖼️ Images Status
✅ logo.jpg - Updated to ZAPPY
✅ splash-logo.png - Updated to ZAPPY  
✅ icon.jpg - Updated to ZAPPY
✅ header-zappy.png - New ZAPPY header (landscape)
⚠️ Vercel Blob favicon - Still references old "olindelivery-favicon.jpg"

## Priority Order
1. **HIGH**: App code files (user-facing)
2. **MEDIUM**: Root JS files (internal tools)
3. **LOW**: Documentation files
4. **OPTIONAL**: Vercel Blob images (requires upload)
