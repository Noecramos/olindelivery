// Test WhatsApp message encoding

const cart = [
    { quantity: 2, name: 'Pizza Calabresa', price: 15.00 },
    { quantity: 1, name: 'Coca-Cola 2L', price: 5.00 }
];

const form = {
    name: 'João Silva',
    phone: '81999999999',
    address: 'Rua das Flores, 123, Olinda',
    paymentMethod: 'pix',
    observations: 'Sem cebola na pizza'
};

const ticketNumber = '00123';
const total = 35.00;

// Format Message with detailed items
const itemsList = cart.map(i => {
    const itemTotal = i.price * i.quantity;
    return `${i.quantity}x ${i.name} - ${itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
}).join('\n');

const paymentInfo = form.paymentMethod === 'pix' ? 'PIX' :
    (form.paymentMethod === 'card' ? 'Cartão' :
        `Dinheiro (Troco para R$ ${form.changeFor})`);

const message = `🎫 *PEDIDO #${ticketNumber}*\n\n` +
    `👤 *Cliente:* ${form.name}\n` +
    `📱 *Telefone:* ${form.phone}\n` +
    `📍 *Endereço:* ${form.address}\n\n` +
    `🛒 *ITENS DO PEDIDO:*\n${itemsList}\n\n` +
    (form.observations ? `📝 *Observações:* ${form.observations}\n\n` : '') +
    `💰 *TOTAL: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*\n` +
    `💳 *Pagamento:* ${paymentInfo}\n\n` +
    `_Enviado via OlinDelivery 🚀_`;

console.log('=== RAW MESSAGE ===');
console.log(message);
console.log('\n=== ENCODED MESSAGE ===');
console.log(encodeURIComponent(message));
console.log('\n=== FULL LINK ===');
const link = `https://wa.me/5581999999999?text=${encodeURIComponent(message)}`;
console.log(link);
console.log('\n=== LINK LENGTH ===');
console.log(link.length);
