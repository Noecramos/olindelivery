"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const { items: cart, total, clearCart, removeOne, addToCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
        paymentMethod: "pix",
        changeFor: "",
        observations: ""
    });

    if (cart.length === 0) {
        return <div className="p-10 text-center">Seu carrinho está vazio.</div>;
    }

    const handleFinish = async () => {
        if (!form.name || !form.phone || !form.address) {
            alert("Por favor, preencha seus dados.");
            return;
        }

        setLoading(true);
        const restaurantId = cart[0].restaurantId || 'default';

        try {
            // Fetch Restaurant Info for Phone Number
            const restRes = await fetch(`/api/restaurants?id=${restaurantId}`);
            const restData = await restRes.json();

            // Use whatsapp field first, then phone, then fallback
            // WhatsApp field should be the primary source as it's specifically for WhatsApp
            const restaurantPhone = restData.whatsapp || restData.phone || "5581995515777";

            console.log('Restaurant data:', {
                id: restaurantId,
                whatsapp: restData.whatsapp,
                phone: restData.phone,
                using: restaurantPhone
            });

            const orderData = {
                restaurantId,
                customer: {
                    name: form.name,
                    phone: form.phone,
                    address: form.address
                },
                items: cart,
                total,
                paymentMethod: form.paymentMethod,
                changeFor: form.paymentMethod === 'money' ? form.changeFor : '',
                observations: form.observations,
                status: 'pending'
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            const order = await res.json();
            const ticketNumber = order.ticketNumber || '###';

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

            // Sanitize phone number (remove all non-digits)
            const cleanPhone = restaurantPhone.replace(/\D/g, '');

            // Ensure phone has country code
            const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

            const link = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;

            console.log('WhatsApp link generated:', {
                originalPhone: restaurantPhone,
                cleanPhone,
                finalPhone,
                linkLength: link.length
            });

            clearCart();
            // Redirect to success page which handles the WhatsApp opening via window.location.href
            // This is more reliable for iOS/Android deep links
            router.push(`/order-success?link=${encodeURIComponent(link)}`);

        } catch (e) {
            alert("Erro ao finalizar pedido.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
            {/* Header Banner */}
            <div className="h-48 md:h-64 w-full bg-cover bg-center relative" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            </div>


            <div className="flex-1 flex flex-col items-center px-4 md:px-8 lg:px-12 pb-10 pt-8 z-10 relative">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Finalizar Pedido</h1>
                </div>

                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden glass">
                    <div className="p-6 space-y-6">
                        {/* Order Items */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase">Resumo do Pedido</h3>
                            <div className="space-y-2">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-500">{(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border shadow-sm">
                                            <button
                                                onClick={() => removeOne(item.id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-50 text-red-500 font-bold transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => addToCart({ ...item, quantity: 1 } as any)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-green-50 text-green-500 font-bold transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Customer Info */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase">Seus Dados</h3>
                            <input
                                id="customerName"
                                name="customerName"
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Nome Completo"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                            <input
                                id="customerPhone"
                                name="customerPhone"
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Telefone (WhatsApp)"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                            />
                            <textarea
                                id="customerAddress"
                                name="customerAddress"
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Endereço de Entrega"
                                rows={2}
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                            <textarea
                                id="observations"
                                name="observations"
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Observações (ex: tirar cebola, levar troco para...)"
                                rows={2}
                                value={form.observations}
                                onChange={e => setForm({ ...form, observations: e.target.value })}
                            />
                        </div>

                        {/* Payment */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase">Pagamento</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setForm({ ...form, paymentMethod: 'pix' })}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all ${form.paymentMethod === 'pix' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    PIX
                                </button>
                                <button
                                    onClick={() => setForm({ ...form, paymentMethod: 'card' })}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all ${form.paymentMethod === 'card' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    Cartão
                                </button>
                                <button
                                    onClick={() => setForm({ ...form, paymentMethod: 'money' })}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all ${form.paymentMethod === 'money' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    Dinheiro
                                </button>
                            </div>

                            {form.paymentMethod === 'money' && (
                                <div className="animate-fade-in mt-2">
                                    <label htmlFor="changeAmount" className="text-sm text-gray-600 block mb-1">Troco para quanto?</label>
                                    <input
                                        id="changeAmount"
                                        name="changeAmount"
                                        className="w-full p-3 bg-yellow-50 rounded-xl border-yellow-200 border focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="Ex: 50,00"
                                        value={form.changeFor}
                                        onChange={e => setForm({ ...form, changeFor: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-500">Total a pagar</span>
                                <span className="text-2xl font-bold text-gray-800">
                                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>

                            <button
                                onClick={handleFinish}
                                disabled={loading}
                                className="w-full py-4 bg-[#EA1D2C] hover:bg-[#C51623] text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all text-lg"
                            >
                                {loading ? 'Enviando...' : 'Finalizar Pedido no WhatsApp'}
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="w-full text-center text-gray-400 text-xs py-6 mt-auto">
                    © 2025 Noviapp Mobile Apps • <a href="http://www.noviapp.com.br" target="_blank" className="hover:underline">www.noviapp.com.br</a> • OlindAki & OlinDelivery
                </footer>
            </div>
        </div>
    );
}
