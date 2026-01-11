# Geolocation Delivery Radius Debug Guide

## Issue
The delivery radius validation is not blocking orders outside the configured area.

## Debugging Steps

### 1. Check Restaurant Data in Google Sheets
Open your Google Sheets and verify the "Restaurants" sheet has these columns with data:
- `latitude` - Should have a value like `-8.0476`
- `longitude` - Should have a value like `-34.8770`
- `deliveryRadius` - Should have a value like `5` (for 5km)

### 2. Test in Browser Console
When you're on the checkout page, open the browser console (F12) and look for these logs:

```
🔍 Restaurant Geolocation Data: {
  deliveryRadius: "5",
  latitude: "-8.0476",
  longitude: "-34.8770",
  hasAllFields: true
}
```

If `hasAllFields` is `false`, the validation is being skipped.

### 3. Check CEP Validation
After entering a CEP and clicking "Finalizar Pedido", you should see:

```
✅ Delivery validation ENABLED - checking distance...
📏 Distance Calculation: {
  customerCEP: "12345-678",
  distance: "15.23 km",
  maxRadius: "5 km",
  isWithinRange: false
}
```

If you see `❌ BLOCKED: Customer outside delivery area`, the validation is working.

### 4. Common Issues

#### Issue A: Fields are empty in Google Sheets
**Solution**: Go to Admin Panel → Settings → Delivery Area section and:
1. Fill in the complete address
2. Click "Obter Coordenadas do Endereço Automaticamente"
3. Enter the delivery radius (e.g., 5 for 5km)
4. Click "Salvar Alterações"

#### Issue B: Fields are saved as strings but validation expects numbers
**Solution**: The code should handle this with `parseFloat()`, but verify in console logs.

#### Issue C: CEP geocoding fails
**Solution**: The code has a try-catch that allows orders to proceed if geocoding fails. This is intentional to not block customers due to API issues.

### 5. Force Strict Validation (Optional)
If you want to ALWAYS block orders when geolocation fails, modify line 167 in `app/checkout/page.tsx`:

Change:
```javascript
} catch (geoError) {
    console.error('Geolocation validation error:', geoError);
    // Continue with order if geolocation fails (don't block customer)
}
```

To:
```javascript
} catch (geoError) {
    console.error('Geolocation validation error:', geoError);
    alert('Não foi possível validar seu endereço. Por favor, tente novamente.');
    setLoading(false);
    return;
}
```

## Testing Checklist

- [ ] Restaurant has latitude, longitude, and deliveryRadius in Google Sheets
- [ ] Console shows "✅ Delivery validation ENABLED"
- [ ] Console shows distance calculation
- [ ] Orders outside radius show alert and are blocked
- [ ] Orders inside radius proceed normally
