# Distance-Based Delivery Fee System

## 🎯 Overview

The OlinDelivery platform now supports **distance-based delivery fees** with up to **4 customizable tiers**. The system automatically calculates the delivery fee based on the customer's CEP (postal code) and the configured distance tiers.

## ✨ Features

- ✅ **Up to 4 delivery fee tiers** (e.g., 5km, 10km, 15km, 20km)
- ✅ **Automatic distance calculation** using customer's CEP
- ✅ **Real-time fee calculation** when CEP is entered
- ✅ **Visual display** of all available tiers to customers
- ✅ **Distance indicator** showing calculated distance
- ✅ **Flexible configuration** - use 1, 2, 3, or 4 tiers as needed

## 🔧 How to Configure (Restaurant Admin)

### Step 1: Access Admin Settings

1. Navigate to: `https://olindelivery.vercel.app/admin/[your-restaurant-slug]`
2. Log in with your admin password
3. Click on **"Configurações"** (Settings) tab
4. Scroll to **"Taxas de Entrega por Distância"** section

### Step 2: Configure Delivery Fee Tiers

You'll see 4 configurable tiers. Each tier has two fields:

- **Faixa X - Até (km)**: Maximum distance in kilometers for this tier
- **Taxa (R$)**: Delivery fee amount for this tier

#### Example Configuration:

```
Faixa 1:  Até 5 km   = R$ 5,00
Faixa 2:  Até 10 km  = R$ 10,00
Faixa 3:  Até 15 km  = R$ 15,00
Faixa 4:  Até 20 km  = R$ 20,00
```

#### Important Rules:

1. **Configure in ascending order** - Each tier should have a higher distance than the previous one
2. **Leave unused tiers blank** - If you only need 2 tiers, leave tiers 3 and 4 empty
3. **Both fields required** - Each tier must have both distance AND fee filled in
4. **Geolocation required** - Make sure your restaurant's coordinates are configured (see Geolocation section below)

### Step 3: Configure Geolocation (Required)

For the distance-based fees to work, you need to configure your restaurant's location:

1. In the same Settings page, find **"Área de Entrega (Geolocalização)"**
2. Fill in your complete **Endereço** (address)
3. Click **"Obter Coordenadas do Endereço Automaticamente"**
4. The system will automatically fill in **Latitude** and **Longitude**
5. Set your **Raio de Entrega** (delivery radius) - maximum distance you deliver

### Step 4: Save Settings

1. Click **"Salvar Alterações"** at the bottom
2. Confirm you see "Dados atualizados com sucesso!"

## 👤 Customer Experience

### What Customers See

When customers go to checkout, they will:

1. **See all available delivery tiers** in a green box:
   ```
   🚚 Taxas de Entrega
   
   Até 5 km    R$ 5,00
   Até 10 km   R$ 10,00
   Até 15 km   R$ 15,00
   Até 20 km   R$ 20,00
   
   💡 A taxa será calculada automaticamente após informar seu CEP.
   ```

2. **Enter their CEP** (postal code)

3. **See automatic calculation**:
   - Distance is calculated automatically
   - Appropriate fee tier is selected
   - Distance is displayed: "📍 Distância calculada: 7.3 km"
   - Delivery fee is added to the total

4. **See the breakdown** in checkout summary:
   ```
   Subtotal:          R$ 25,00
   Taxa de Entrega:   R$ 10,00  (because 7.3km falls in the "até 10km" tier)
   ─────────────────────────
   Total a pagar:     R$ 35,00
   ```

## 🧮 How the System Calculates

### Calculation Process:

1. **Customer enters CEP** → System validates the CEP format
2. **Geocoding** → System looks up the address coordinates using ViaCEP + Nominatim
3. **Distance calculation** → Haversine formula calculates distance between restaurant and customer
4. **Tier selection** → System finds the appropriate tier:
   - If distance ≤ 5km → Use Tier 1 fee
   - If distance ≤ 10km → Use Tier 2 fee
   - If distance ≤ 15km → Use Tier 3 fee
   - If distance ≤ 20km → Use Tier 4 fee
5. **Fee applied** → Selected fee is added to the order total

### Example Scenarios:

| Customer Distance | Configured Tiers | Selected Fee |
|-------------------|------------------|--------------|
| 3.2 km | 5km=R$5, 10km=R$10 | R$ 5,00 |
| 7.8 km | 5km=R$5, 10km=R$10 | R$ 10,00 |
| 12.5 km | 5km=R$5, 10km=R$10, 15km=R$15 | R$ 15,00 |
| 25 km | 5km=R$5, 10km=R$10, 20km=R$20 | R$ 20,00* |

*If distance exceeds all tiers, the highest tier fee is used.

## 📱 WhatsApp Integration

The delivery fee is included in the WhatsApp message:

```
🎫 *PEDIDO #1234*

👤 *Cliente:* João Silva
📱 *Telefone:* 81999999999
📍 *Endereço:* Rua Example, 123
📮 *CEP:* 50000-000

🛒 *ITENS DO PEDIDO:*
2x Hambúrguer - R$ 20,00
1x Refrigerante - R$ 5,00

💵 *Subtotal:* R$ 25,00
🚚 *Taxa de Entrega:* R$ 10,00
💰 *TOTAL: R$ 35,00*

💳 *Pagamento:* PIX

_Enviado via OlinDelivery 🚀_
```

## 🖥️ Admin Dashboard Display

Orders in the restaurant dashboard show the delivery fee breakdown:

```
┌─────────────────────────────┐
│ Pedido #1234                │
│ João Silva                  │
│                             │
│ ┌─────────────────────────┐ │
│ │ Subtotal:      R$ 25,00 │ │
│ │ Taxa de Entrega: R$ 10,00│ │
│ └─────────────────────────┘ │
│                             │
│ Total:         R$ 35,00     │
└─────────────────────────────┘
```

## 🔍 Troubleshooting

### Issue: Delivery fee not calculating

**Possible causes:**
1. Restaurant geolocation not configured
2. CEP is invalid or incomplete
3. No delivery fee tiers configured

**Solution:**
1. Verify restaurant has latitude/longitude set
2. Ensure customer entered complete 8-digit CEP
3. Check that at least one tier is configured in admin settings

### Issue: Wrong fee being applied

**Possible causes:**
1. Tiers not in ascending order
2. Distance calculation error

**Solution:**
1. Reconfigure tiers in ascending order (5km, 10km, 15km, 20km)
2. Check browser console for distance calculation logs
3. Verify restaurant coordinates are correct

### Issue: Delivery fee shows R$ 0,00

**Possible causes:**
1. No tiers configured
2. Geolocation not set up
3. CEP not entered yet

**Solution:**
1. Configure at least one delivery fee tier
2. Set up restaurant geolocation
3. Customer must enter their CEP first

## 💡 Best Practices

### Recommended Tier Configuration:

**Urban Area (Small City):**
```
Tier 1: Até 3 km  = R$ 3,00
Tier 2: Até 5 km  = R$ 5,00
Tier 3: Até 8 km  = R$ 8,00
Tier 4: Até 10 km = R$ 12,00
```

**Suburban Area (Medium City):**
```
Tier 1: Até 5 km  = R$ 5,00
Tier 2: Até 10 km = R$ 10,00
Tier 3: Até 15 km = R$ 15,00
Tier 4: Até 20 km = R$ 20,00
```

**Large Metropolitan Area:**
```
Tier 1: Até 5 km  = R$ 8,00
Tier 2: Até 10 km = R$ 15,00
Tier 3: Até 15 km = R$ 22,00
Tier 4: Até 20 km = R$ 30,00
```

### Tips:

1. **Start simple** - Begin with 2-3 tiers and adjust based on demand
2. **Consider costs** - Factor in fuel, time, and delivery person wages
3. **Be competitive** - Research what other restaurants in your area charge
4. **Communicate clearly** - The tier display helps customers understand the pricing
5. **Update regularly** - Adjust tiers based on operational costs and feedback

## 🔄 Migration from Old System

If you previously used a single flat delivery fee:

1. **Old system**: Single `deliveryFee` field (e.g., R$ 5,00 for everyone)
2. **New system**: Distance-based tiers

**Migration steps:**
1. Go to admin settings
2. Configure your first tier with your old flat fee (e.g., Até 5km = R$ 5,00)
3. Add additional tiers for longer distances
4. Save settings
5. Old orders will still display correctly with their original fees

## 📊 Technical Details

### Data Structure:

```typescript
deliveryFeeTiers: [
  { maxDistance: "5", fee: "5.00" },
  { maxDistance: "10", fee: "10.00" },
  { maxDistance: "15", fee: "15.00" },
  { maxDistance: "20", fee: "20.00" }
]
```

### APIs Used:

- **ViaCEP**: Brazilian postal code lookup
- **Nominatim (OpenStreetMap)**: Geocoding service
- **Haversine Formula**: Distance calculation

### Files Modified:

1. `app/components/admin/RestaurantSettings.tsx` - Admin configuration UI
2. `app/checkout/page.tsx` - Customer-facing calculation and display
3. `app/admin/[slug]/page.tsx` - Dashboard display

## 🎉 Benefits

### For Restaurant Owners:
- ✅ Fair pricing based on actual distance
- ✅ Encourage nearby customers with lower fees
- ✅ Cover costs for longer distance deliveries
- ✅ Flexible and easy to adjust

### For Customers:
- ✅ Transparent pricing - see all tiers upfront
- ✅ Know exact fee before ordering
- ✅ Fair pricing based on distance
- ✅ Automatic calculation - no guessing

## 📞 Support

If you need help configuring your delivery fee tiers, contact support via WhatsApp or check the admin panel for the support button.
