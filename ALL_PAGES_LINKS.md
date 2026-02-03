# 🔗 ZAPPY - Complete Page Links

## 📱 **Public Pages** (User-Facing)

### **Main Pages**
- **Homepage**: `http://localhost:3000/`
  - Main marketplace with all restaurants
  - Header with ZAPPY branding
  - Footer: © 2026 Noviapp Mobile Apps • ZAPPY®

- **Restaurant Page**: `http://localhost:3000/loja/[slug]`
  - Example: `http://localhost:3000/loja/bar-guarita`
  - Example: `http://localhost:3000/loja/13-lanches`
  - Individual restaurant menu and products

- **Checkout**: `http://localhost:3000/checkout`
  - Order review and payment
  - Customer information form
  - WhatsApp order submission

- **Order Success**: `http://localhost:3000/order-success`
  - Confirmation page after order

### **Authentication Pages**
- **Login**: `http://localhost:3000/login`
  - Customer login

- **Register**: `http://localhost:3000/register`
  - New restaurant registration

---

## 🔐 **Admin Pages** (Restaurant Owners)

### **Admin Portal**
- **Admin Home**: `http://localhost:3000/admin`
  - Portal selection page
  - Links to restaurant admin or super admin

### **Restaurant Admin Panel**
- **Restaurant Dashboard**: `http://localhost:3000/admin/[slug]`
  - Example: `http://localhost:3000/admin/bar-guarita`
  - Example: `http://localhost:3000/admin/13-lanches`
  - Tabs:
    - 📊 Dashboard (orders, sales, charts)
    - 🍔 Products management
    - 🎁 Combos management
    - 🎲 Raspadinha validator
    - ⚙️ Settings

---

## 👑 **Super Admin Pages** (Platform Management)

- **Super Admin Login**: `http://localhost:3000/admin/super`
  - Master password required
  - Tabs:
    - Restaurants (approve/manage all restaurants)
    - Customização do App (global settings)
    - Raspadinha (validation)

---

## 🧪 **Test/Debug Pages**

- **Test WhatsApp**: `http://localhost:3000/test-whatsapp`
  - Test WhatsApp message formatting

---

## 🛠️ **API Endpoints**

### **Public APIs**
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants?slug=[slug]` - Get specific restaurant
- `GET /api/products?restaurantId=[id]` - Get restaurant products
- `GET /api/categories?restaurantId=[id]` - Get restaurant categories
- `GET /api/config` - Get global configuration
- `POST /api/orders` - Create new order
- `GET /api/orders?restaurantId=[id]` - Get restaurant orders

### **Admin APIs**
- `POST /api/verify-password` - Verify restaurant password
- `POST /api/admin/verify-super` - Verify super admin password
- `POST /api/admin/super-reset` - Reset super admin password
- `PUT /api/restaurants` - Update restaurant
- `DELETE /api/restaurants?id=[id]` - Delete restaurant
- `POST /api/products` - Create product
- `PUT /api/products` - Update product
- `DELETE /api/products?id=[id]` - Delete product
- `POST /api/categories` - Create category
- `PUT /api/categories` - Update category
- `DELETE /api/categories?id=[id]` - Delete category
- `POST /api/upload` - Upload images

---

## 📋 **Pages with Standardized Footer**

All pages below show: **"© 2026 Noviapp Mobile Apps • ZAPPY®"**

### ✅ **User Pages**
1. Homepage (`/`)
2. Restaurant pages (`/loja/[slug]`)
3. Registration (`/register`)
4. Checkout (`/checkout`)

### ✅ **Admin Pages**
5. Admin Portal (`/admin`)
6. Restaurant Admin Login (`/admin/[slug]` - before login)
7. Restaurant Admin Dashboard (`/admin/[slug]` - after login)
8. Super Admin Login (`/admin/super` - before login)
9. Super Admin Dashboard (`/admin/super` - after login)

### ✅ **Email Templates**
10. Password reset emails

---

## 🎯 **Quick Test Checklist**

To verify footer standardization, visit:

```
✅ http://localhost:3000/
✅ http://localhost:3000/loja/bar-guarita
✅ http://localhost:3000/register
✅ http://localhost:3000/checkout
✅ http://localhost:3000/admin
✅ http://localhost:3000/admin/bar-guarita
✅ http://localhost:3000/admin/super
```

---

## 🌐 **Production URLs** (After Deploy)

Replace `localhost:3000` with your production domain:
- Current: `https://olindelivery.vercel.app`
- Future: `https://zappy.com.br` (optional custom domain)

---

## 📝 **Notes**

- All `[slug]` routes are dynamic (e.g., `bar-guarita`, `13-lanches`, etc.)
- All pages use the new ZAPPY header (256px tall, gold background)
- All pages have standardized footer with ® trademark
- Admin pages require authentication

---

**Last Updated**: 2026-02-03  
**Total Public Pages**: 6  
**Total Admin Pages**: 3  
**Total API Endpoints**: 15+
