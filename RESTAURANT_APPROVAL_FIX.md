# Restaurant Approval Fix - Olindelivery

## Issue
Restaurants were being displayed on the frontend/mainpage before the "Aprovar" (Approve) button was pressed in the admin/super panel.

## Root Cause
The `/api/restaurants` GET endpoint (when listing all restaurants) was not filtering by the `approved` status. It was returning ALL restaurants regardless of whether they had been approved or not.

## Solution
Added `WHERE approved = true` filters to the `/api/restaurants` GET endpoint in `app/api/restaurants/route.ts` to ensure only approved restaurants are accessible to the public. Additionally, implemented an `admin` query parameter to allow restaurant owners to access their admin panel even when not approved.

### Changed Files
1. **`app/api/restaurants/route.ts`**: 
   - Added `isAdminAccess` parameter check (line 9)
   - Modified slug lookup to conditionally check approval status (lines 21-66)
   - When `admin=true` is passed, approval check is bypassed
   - When `admin=true` is NOT passed, only approved restaurants are returned
   - Modified id lookup to check approval status (line 71)
   - Modified list all restaurants to check approval status (line 85)

2. **`app/admin/[slug]/page.tsx`**:
   - Updated restaurant fetch to include `admin=true` parameter (line 40)
   - This allows restaurant owners to access their admin panel even if not approved

### Security Enhancement
The fix prevents three potential issues:
1. **Main page listing**: Unapproved restaurants no longer appear in the restaurant list
2. **Direct URL access**: Users cannot bypass the approval system by directly visiting `/restaurante/[slug]` for unapproved restaurants
3. **Admin panel access**: Restaurant owners can still access their admin panel (`/admin/[slug]`) to manage products and settings while waiting for approval

## Behavior After Fix

### Before Approval:
- Restaurant does NOT appear on main page (`/`)
- Direct access to `/restaurante/[slug]` returns "Restaurant not found"
- Restaurant owner CAN access `/admin/[slug]` to set up their restaurant

### After Approval (clicking "Aprovar" in `/admin/super`):
- Restaurant APPEARS on main page (`/`)
- Direct access to `/restaurante/[slug]` works normally
- Restaurant owner can still access `/admin/[slug]`

## Testing Recommendations
1. Register a new restaurant via `/register`
2. Verify it does NOT appear on the main page (`/`)
3. **Try to access the restaurant directly** by visiting `/restaurante/[slug]` (should show "Restaurant not found")
4. Login to super admin panel (`/admin/super`)
5. Verify the new restaurant appears with "PENDENTE" status
6. Click "Aprovar" button
7. Verify the restaurant now appears on the main page (`/`)
8. **Try to access the restaurant directly** by visiting `/restaurante/[slug]` (should now work)
9. Click "Pausar" button to unapprove
10. Verify the restaurant disappears from the main page
11. **Try to access the restaurant directly again** (should show "Restaurant not found")

## Related Endpoints
- `/api/restaurants` - Now filters by `approved = true` for public listing
- `/api/restaurants?admin=true` - Bypasses approval check for restaurant admin panel access
