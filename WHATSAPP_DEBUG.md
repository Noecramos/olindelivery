# WhatsApp Link Debugging Guide

## How to Debug iPhone WhatsApp Issues

### Step 1: Check Browser Console
1. On iPhone, open Safari
2. Go to Settings > Safari > Advanced > Web Inspector (enable it)
3. Connect iPhone to Mac
4. Open Safari on Mac > Develop > [Your iPhone] > [Your Site]
5. Complete an order and check console logs

### Step 2: Check Restaurant Data
Visit: `https://your-domain.com/api/debug-restaurants`

This will show:
- All restaurant phone numbers
- WhatsApp numbers
- Which field is being used

### Step 3: Test the Generated Link
The console will show:
```
Restaurant data: { whatsapp: "...", phone: "...", using: "..." }
WhatsApp link generated: { originalPhone: "...", cleanPhone: "...", finalPhone: "..." }
```

### Step 4: Manual Test
Copy the WhatsApp link from console and paste it in Safari address bar.
If it works manually but not from button, it's a browser security issue.

### Common Issues:

1. **Phone number missing country code**
   - Fixed: Now automatically adds "55" for Brazil if missing

2. **Phone number has special characters**
   - Fixed: All non-digits are removed

3. **Using wrong field**
   - Fixed: Now uses `whatsapp` field first, then `phone`

4. **iOS blocking automatic redirect**
   - Fixed: Using button click (user-initiated) instead of automatic

5. **Link too long**
   - Check console for `linkLength` - WhatsApp has limits

### Expected Console Output:
```
Restaurant data: {
  id: "abc123",
  whatsapp: "5581999999999",
  phone: "5581999999999",
  using: "5581999999999"
}

WhatsApp link generated: {
  originalPhone: "5581999999999",
  cleanPhone: "5581999999999",
  finalPhone: "5581999999999",
  linkLength: 234
}

Success page loaded with link: {
  encoded: "https%3A%2F%2Fwa.me%2F5581999999999%3Ftext%3D...",
  decoded: "https://wa.me/5581999999999?text=...",
  fullLength: 234
}

Opening WhatsApp with link: https://wa.me/5581999999999?text=...
```
