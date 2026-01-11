# Geolocation Delivery Radius - Fix & Testing Guide

## 🔧 What Was Fixed

I've enhanced the geolocation delivery radius validation system with:

### 1. **Enhanced Debugging & Logging**
Added comprehensive console logging at every step of the validation process:
- Restaurant geolocation configuration status
- CEP lookup results
- Address geocoding results
- Distance calculation details
- Validation decision (approve/block)

### 2. **Visual Indicator**
Added a blue badge on the checkout page that shows when delivery radius validation is active:
```
📍 Validação de área de entrega ativa (5 km)
```

### 3. **Better Error Messages**
Improved the blocking alert to show:
- Customer's neighborhood and city
- Actual distance calculated
- Maximum delivery radius
- Helpful message to contact via WhatsApp

## 🧪 How to Test

### Step 1: Configure Restaurant Delivery Area

1. Go to your restaurant admin panel: `/admin/[your-slug]`
2. Click on "Configurações" tab
3. Scroll to "📍 Área de Entrega (Geolocalização)" section
4. Fill in your complete address (e.g., "Rua Example 123, Bairro, Olinda, PE")
5. Click "Obter Coordenadas do Endereço Automaticamente"
6. Wait for success message "✅ Coordenadas obtidas com sucesso!"
7. Enter delivery radius (e.g., `5` for 5km)
8. Click "Salvar Alterações"

### Step 2: Verify Configuration

1. Open browser console (F12)
2. Go to your store page: `/loja/[your-slug]`
3. Add items to cart
4. Go to checkout: `/checkout`
5. You should see the blue badge: "📍 Validação de área de entrega ativa (5 km)"

### Step 3: Test with Different CEPs

#### Test A: CEP Inside Delivery Area
1. Enter a CEP close to your restaurant (within 5km)
2. Fill in all other fields
3. Click "Finalizar Pedido no WhatsApp"
4. Check console for:
   ```
   ✅ Delivery validation ENABLED - checking distance...
   📏 Distance Calculation: { distance: "2.45 km", maxRadius: "5 km", willBlock: false }
   ✅ APPROVED: Customer within delivery area
   ```
5. Order should proceed to WhatsApp

#### Test B: CEP Outside Delivery Area
1. Enter a CEP far from your restaurant (more than 5km)
2. Fill in all other fields
3. Click "Finalizar Pedido no WhatsApp"
4. Check console for:
   ```
   ✅ Delivery validation ENABLED - checking distance...
   📏 Distance Calculation: { distance: "15.23 km", maxRadius: "5 km", willBlock: true }
   ❌ BLOCKED: Customer outside delivery area
   ```
5. You should see an alert blocking the order
6. Order should NOT proceed

### Step 4: Check Console Logs

Open the browser console (F12) and look for these logs when you click "Finalizar Pedido":

```
🔍 Restaurant Geolocation Data: {
  deliveryRadius: "5",
  latitude: "-8.0476",
  longitude: "-34.8770",
  hasAllFields: true
}

✅ Delivery validation ENABLED - checking distance...

📍 Restaurant Location: {
  lat: "-8.0476",
  lon: "-34.8770",
  radius: "5 km"
}

🔎 Looking up CEP: 12345678

📮 ViaCEP Response: { ... }

🌍 Geocoding address: Rua Example, Bairro, Cidade, PE, Brazil

🗺️ Nominatim Response: [ { lat: "...", lon: "..." } ]

📊 Coordinates: {
  customer: { lat: -8.123, lon: -34.456 },
  restaurant: { lat: -8.0476, lon: -34.8770 }
}

📏 Distance Calculation: {
  customerCEP: "12345-678",
  customerAddress: "...",
  distance: "15.23 km",
  maxRadius: "5 km",
  isWithinRange: false,
  willBlock: true
}

❌ BLOCKED: Customer outside delivery area
```

## 🐛 Troubleshooting

### Issue: "ℹ️ Delivery radius validation DISABLED"

**Cause**: Missing configuration in Google Sheets

**Solution**:
1. Check Google Sheets "Restaurants" tab
2. Verify these columns have values:
   - `latitude` (e.g., `-8.0476`)
   - `longitude` (e.g., `-34.8770`)
   - `deliveryRadius` (e.g., `5`)
3. If empty, follow Step 1 above to configure

### Issue: "⚠️ Could not geocode address"

**Cause**: CEP address not found in OpenStreetMap database

**Effect**: Order is allowed to proceed (failsafe behavior)

**Solution**: This is expected for some addresses. The system allows the order to avoid blocking legitimate customers.

### Issue: Order proceeds even when outside radius

**Possible Causes**:
1. **Configuration missing**: Check console for "ℹ️ Delivery radius validation DISABLED"
2. **Geocoding failed**: Check console for "⚠️ Could not geocode address"
3. **API error**: Check console for "❌ Geolocation validation error"

**Debug**:
- Open console (F12)
- Look for the detailed logs listed above
- Share the console output for further investigation

## 📊 Example CEPs for Testing (Pernambuco)

### Close to Olinda (should be within 5km):
- `53020-010` - Olinda, PE (Casa Caiada)
- `53110-000` - Olinda, PE (Bairro Novo)
- `53130-000` - Olinda, PE (Peixinhos)

### Far from Olinda (should be outside 5km):
- `50010-000` - Recife, PE (Centro) - ~10km
- `51020-000` - Recife, PE (Boa Viagem) - ~15km
- `54400-000` - Jaboatão, PE - ~20km

## 🔐 Security Note

The validation happens on the client side for immediate feedback. For production, you may want to add server-side validation in the `/api/orders` endpoint as well.

## 📝 Files Modified

1. `app/checkout/page.tsx` - Enhanced validation logic and debugging
2. `DEBUG_GEOLOCATION.md` - This debug guide (created)

## ✅ Success Criteria

The feature is working correctly when:
- [ ] Blue badge shows on checkout page
- [ ] Console shows "✅ Delivery validation ENABLED"
- [ ] Orders within radius proceed normally
- [ ] Orders outside radius are blocked with clear message
- [ ] Console shows detailed distance calculation
