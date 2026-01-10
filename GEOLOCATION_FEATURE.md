# Geolocation Delivery Area Feature

## ✅ What Was Implemented

### 1. Database Changes
- **Added 3 new fields to Restaurants sheet:**
  - `latitude` - Restaurant's latitude coordinate
  - `longitude` - Restaurant's longitude coordinate  
  - `deliveryRadius` - Delivery radius in kilometers

### 2. API Updates
- **GET `/api/restaurants`** - Now returns geolocation fields
- **PUT `/api/restaurants`** - Can update geolocation fields
- All existing functionality preserved (no breaking changes)

### 3. Admin UI
- **Restaurant Settings Page** - New "Área de Entrega (Geolocalização)" section
  - Delivery Radius input (in km)
  - Latitude input (with helpful placeholder)
  - Longitude input (with helpful placeholder)
  - Helpful tips and Google Maps link for finding coordinates

### 4. Backup Created
- **Git Branch:** `backup-before-geolocation`
- **Git Tag:** `v1.0-pre-geolocation`
- You can rollback anytime with: `git checkout backup-before-geolocation`

## 📋 How to Use

### For Restaurant Admins:
1. Go to your restaurant admin page: `/admin/[your-slug]`
2. Click on "Configurações" tab
3. Scroll to "Área de Entrega (Geolocalização)" section
4. Enter:
   - **Delivery Radius**: How far you deliver (e.g., 5 km)
   - **Coordinates**: Either manually or leave blank for auto-fill
5. Click "Salvar Alterações"

### For Super Admin:
- Same fields available when editing any restaurant
- Can configure delivery areas for all restaurants

## 🔮 Next Steps (Not Yet Implemented)

To make this feature fully functional, you'll need to add:

### 1. Checkout Validation
- When customer enters CEP at checkout
- Convert CEP to coordinates using ViaCEP + Nominatim
- Calculate distance from restaurant
- Show error if outside delivery radius

### 2. Optional Enhancements
- Show delivery area on a map
- Auto-fill coordinates from address
- Display "We deliver to your area!" message
- Filter restaurants by customer location on main page

## 🆓 Free APIs Available

- **ViaCEP**: `https://viacep.com.br/ws/{CEP}/json/`
- **Nominatim**: `https://nominatim.openstreetmap.org/search`
- **BrasilAPI**: `https://brasilapi.com.br/api/cep/v2/{CEP}`

## 📝 Notes

- All existing functionality remains unchanged
- Live site is safe - only new optional fields added
- Coordinates can be left empty (for future auto-fill)
- Delivery radius is optional (won't break anything if not set)

## 🔄 Rollback Instructions

If you need to rollback:
```bash
git checkout backup-before-geolocation
git push -f origin main
```

Or restore to tagged version:
```bash
git checkout v1.0-pre-geolocation
```
