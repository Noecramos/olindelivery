# 🍔 Combos Feature Implementation Plan - Olindelivery

## Overview
Add ability for restaurants to create combo products that bundle multiple existing products together.

## Database Changes

### Migration File: `database/add_combo_support.sql`
```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS combo_items JSONB;
```

**Fields:**
- `is_combo`: Boolean flag to identify combo products
- `combo_items`: JSON array storing product IDs and quantities
  ```json
  [
    { "productId": "uuid-1", "quantity": 1, "name": "Hamburger" },
    { "productId": "uuid-2", "quantity": 1, "name": "Batata Frita" },
    { "productId": "uuid-3", "quantity": 1, "name": "Refrigerante" }
  ]
  ```

## Components to Create/Modify

### 1. New Component: `ComboForm.tsx`
**Location:** `app/components/admin/ComboForm.tsx`

**Features:**
- Form to create/edit combos
- Select existing products to include
- Set quantities for each product
- Set combo name, price, category, image
- Display total value of individual items vs combo price (savings)

**Props:**
```typescript
{
  restaurantId: string;
  onSave: () => void;
  existingCombo?: any; // For editing
}
```

### 2. Update: Admin Page
**File:** `app/admin/[slug]/page.tsx`

**Changes:**
- Add "Combos" tab to navigation
- Add combo management section
- List existing combos
- Edit/Delete combo functionality

### 3. Update: Main Page (User Frontend)
**File:** `app/page.tsx` or restaurant page

**Changes:**
- Display combos in their respective categories
- Show combo badge/indicator
- Display "Economize X%" if applicable
- Show included items in combo description

### 4. Update: API Routes
**File:** `app/api/products/route.ts`

**Changes:**
- Handle `is_combo` flag in POST/PUT
- Store `combo_items` JSON
- Validate combo items exist
- Return combo details with product data

## User Flow

### Restaurant Admin:
1. Go to Admin Panel → Combos tab
2. Click "Criar Novo Combo"
3. Fill in:
   - Nome do Combo (e.g., "Combo Família")
   - Preço do Combo (e.g., R$ 45.00)
   - Categoria
   - Imagem (optional)
   - Descrição
4. Select products to include:
   - ☑️ 2x Hamburger
   - ☑️ 1x Batata Grande
   - ☑️ 2x Refrigerante
5. System shows:
   - Valor Individual: R$ 52.00
   - Preço do Combo: R$ 45.00
   - Economia: R$ 7.00 (13%)
6. Click "Salvar Combo"

### Customer (Frontend):
1. Browse restaurant menu
2. See combo in category with badge "🎁 COMBO"
3. Click combo to see details
4. See included items listed
5. See savings percentage
6. Add to cart (combo is treated as single item)

## Implementation Steps

### Phase 1: Database ✅
- [x] Create migration file
- [ ] Run migration on Vercel Postgres

### Phase 2: Backend
- [ ] Update products API to handle combos
- [ ] Add validation for combo items
- [ ] Test API endpoints

### Phase 3: Admin Interface
- [ ] Create ComboForm component
- [ ] Add Combos tab to admin page
- [ ] Implement create/edit/delete
- [ ] Test combo creation

### Phase 4: Frontend Display
- [ ] Update product display to show combos
- [ ] Add combo badge/indicator
- [ ] Show included items
- [ ] Display savings

### Phase 5: Testing
- [ ] Create test combo
- [ ] Verify display on frontend
- [ ] Test ordering combo
- [ ] Verify order processing

## Technical Considerations

### Data Structure
```typescript
interface ComboProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  is_combo: boolean;
  combo_items?: ComboItem[];
}

interface ComboItem {
  productId: string;
  name: string;
  quantity: number;
  price: number; // Store for reference
}
```

### Validation Rules
1. Combo must include at least 2 products
2. All combo items must exist in database
3. All combo items must belong to same restaurant
4. Combo price should be less than sum of items (optional warning)

### Display Logic
```typescript
// Calculate savings
const individualTotal = combo_items.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
);
const savings = individualTotal - combo.price;
const savingsPercent = (savings / individualTotal) * 100;
```

## Next Steps
1. Run database migration
2. Create ComboForm component
3. Update admin page with Combos tab
4. Test and deploy

---
**Status:** Ready for implementation
**Priority:** High
**Estimated Time:** 2-3 hours
