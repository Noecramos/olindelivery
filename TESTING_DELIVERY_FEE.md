# Testing Guide - Delivery Fee Feature

## Prerequisites
- Restaurant must be registered and approved
- Restaurant admin must have access to admin panel

## Step-by-Step Testing

### 1. Configure Delivery Fee in Admin Panel

1. Navigate to: `https://olindelivery.vercel.app/admin/[your-restaurant-slug]`
2. Log in with your restaurant admin password
3. Click on **"Configurações"** (Settings) tab
4. Scroll to **"Taxa de Entrega"** field
5. Enter a delivery fee amount (e.g., `5.00` for R$ 5,00)
6. Click **"Salvar Alterações"** (Save Changes)
7. ✅ Confirm you see "Dados atualizados com sucesso!"

### 2. Test Checkout Page

1. Navigate to your restaurant's public page: `https://olindelivery.vercel.app/loja/[your-restaurant-slug]`
2. Add some items to your cart (e.g., 2-3 products)
3. Click on the cart icon to go to checkout
4. **Verify the following:**
   - [ ] You see "Subtotal" line with items total
   - [ ] You see "Taxa de Entrega" line with the fee you configured (e.g., R$ 5,00)
   - [ ] You see "Total a pagar" with subtotal + delivery fee
   - [ ] The math is correct (Subtotal + Taxa de Entrega = Total)

**Example:**
```
Subtotal:          R$ 25,00
Taxa de Entrega:   R$ 5,00
─────────────────────────
Total a pagar:     R$ 30,00
```

### 3. Test WhatsApp Message

1. Fill in all checkout form fields:
   - Nome Completo
   - Telefone
   - CEP
   - Endereço
   - Payment method
2. Click **"Finalizar Pedido no WhatsApp"**
3. **Verify the WhatsApp message includes:**
   - [ ] 🛒 *ITENS DO PEDIDO:* (list of items)
   - [ ] 💵 *Subtotal:* R$ XX,XX
   - [ ] 🚚 *Taxa de Entrega:* R$ X,XX
   - [ ] 💰 *TOTAL: R$ XX,XX*
   - [ ] All three amounts are present and correct

**Example WhatsApp Message:**
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
🚚 *Taxa de Entrega:* R$ 5,00
💰 *TOTAL: R$ 30,00*

💳 *Pagamento:* PIX

_Enviado via OlinDelivery 🚀_
```

### 4. Test Restaurant Dashboard

1. Go back to admin panel: `https://olindelivery.vercel.app/admin/[your-restaurant-slug]`
2. Click on **"Painel"** (Dashboard) tab
3. Find the order you just created
4. **Verify the order card shows:**
   - [ ] A blue box with delivery fee breakdown (if delivery fee > 0)
   - [ ] "Subtotal: R$ XX,XX"
   - [ ] "Taxa de Entrega: R$ X,XX"
   - [ ] "Total: R$ XX,XX" (prominently displayed)

### 5. Test Print Receipt

1. In the admin dashboard, find your test order
2. Click the 🖨️ (print) button
3. **Verify the printed receipt includes:**
   - [ ] Items list with prices
   - [ ] Subtotal: R$ XX,XX
   - [ ] Taxa de Entrega: R$ X,XX
   - [ ] TOTAL: R$ XX,XX
   - [ ] All amounts are correct

### 6. Edge Cases to Test

#### Test Case 1: Zero Delivery Fee
1. Set delivery fee to `0` or leave it empty in admin settings
2. Create a new order
3. **Expected:** Delivery fee shows as R$ 0,00, total = subtotal

#### Test Case 2: Change Delivery Fee
1. Set delivery fee to `5.00`
2. Create an order
3. Change delivery fee to `10.00` in admin settings
4. Create another order
5. **Expected:** 
   - First order shows R$ 5,00 delivery fee
   - Second order shows R$ 10,00 delivery fee

#### Test Case 3: Multiple Items
1. Add 5+ different items to cart
2. Verify subtotal calculation is correct
3. Verify delivery fee is added only once
4. Verify total = (all items) + (delivery fee)

## Troubleshooting

### Issue: Delivery fee not showing in checkout
**Solution:** 
- Clear browser cache
- Refresh the page
- Verify delivery fee is saved in admin settings
- Check browser console for errors

### Issue: Delivery fee shows R$ 0,00 even though it's configured
**Solution:**
- Verify the delivery fee field in admin settings has a numeric value (e.g., `5.00`, not `R$ 5,00`)
- Save the settings again
- Clear cart and add items again

### Issue: Total calculation is wrong
**Solution:**
- Check browser console for JavaScript errors
- Verify all item prices are correct
- Verify delivery fee is a valid number

## Success Criteria

✅ All checkboxes above are checked
✅ Delivery fee appears in all 4 places:
   1. Admin settings (input field)
   2. Checkout page (breakdown)
   3. WhatsApp message (breakdown)
   4. Restaurant dashboard (order card)
✅ Math is always correct: Total = Subtotal + Delivery Fee
✅ Print receipt includes delivery fee
✅ No console errors

## Notes

- Delivery fee is stored per restaurant, not per order
- Each restaurant can have a different delivery fee
- Delivery fee can be changed at any time in admin settings
- Old orders will not be affected by delivery fee changes
- Delivery fee is optional (can be R$ 0,00)
