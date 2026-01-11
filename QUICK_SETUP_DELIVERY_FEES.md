# Quick Setup Guide - Distance-Based Delivery Fees

## ⚡ 5-Minute Setup

### Step 1: Configure Your Location (2 minutes)

1. Go to: `Admin Panel → Configurações`
2. Find **"Área de Entrega (Geolocalização)"**
3. Enter your complete address in **"Endereço"**
   - Example: `Rua da Praia, 123, Boa Viagem, Recife, PE`
4. Click **"Obter Coordenadas do Endereço Automaticamente"**
5. Verify latitude and longitude are filled
6. Set **"Raio de Entrega"** (e.g., `20` for 20km max)

### Step 2: Configure Delivery Fee Tiers (3 minutes)

1. Find **"Taxas de Entrega por Distância"** section
2. Fill in your tiers:

**Example for Small Business:**
```
Faixa 1:  5 km  → R$ 5,00
Faixa 2: 10 km  → R$ 10,00
(Leave Faixa 3 and 4 empty if not needed)
```

**Example for Larger Coverage:**
```
Faixa 1:  5 km  → R$ 5,00
Faixa 2: 10 km  → R$ 10,00
Faixa 3: 15 km  → R$ 15,00
Faixa 4: 20 km  → R$ 20,00
```

3. Click **"Salvar Alterações"**

### Step 3: Test It! (1 minute)

1. Open your restaurant page in incognito mode
2. Add items to cart
3. Go to checkout
4. Enter a test CEP (e.g., your own address)
5. Watch the delivery fee calculate automatically! 🎉

## ✅ You're Done!

Your customers will now see:
- All available delivery tiers
- Automatic fee calculation based on their CEP
- Transparent pricing before they order

## 🎯 Pro Tips

1. **Start Conservative**: Begin with 2 tiers and expand later
2. **Test Different CEPs**: Try various addresses to verify calculations
3. **Adjust Based on Feedback**: Monitor and adjust tiers as needed
4. **Communicate Changes**: Let customers know about the new system

## 📞 Need Help?

Check the full documentation in `DISTANCE_BASED_DELIVERY_FEES.md` or contact support.
