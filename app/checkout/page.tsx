"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const { items: cart, total, clearCart, removeOne, addToCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (cart.length > 0) {
            const restaurantId = cart[0].restaurantId;
            if (restaurantId) {
                fetch(`/api/restaurants?id=${restaurantId}`)
                    .then(res => res.json())
                    .then(data => setRestaurant(data))
                    .catch(console.error);
            }
        }
    }, [cart]);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        zipCode: "",
        address: "",
        paymentMethod: "pix",
        changeFor: "",
        observations: ""
    });

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F7] p-8 relative">
                <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-sm w-full">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h2>
                    <p className="text-gray-500 mb-8">Adicione itens deliciosos antes de finalizar!</p>
                    <button
                        onClick={() => router.back()}
                        className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                        ⬅️ Voltar ao Cardápio
                    </button>
                </div>

                {/* Success Overlay - Rendered even if cart is empty (post-checkout) */}
                {showSuccess && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform animate-scale-in">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <span className="text-4xl">✅</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido Realizado!</h2>
                            <p className="text-gray-500 mb-6 font-medium">Seu pedido foi enviado com sucesso!</p>

                            <div className="bg-gray-100 p-4 rounded-xl mb-6">
                                <div className="text-lg font-bold text-green-600 animate-pulse mb-4">
                                    Abrindo WhatsApp...
                                </div>
                                <button
                                    onClick={() => router.push(restaurant?.slug ? `/loja/${restaurant.slug}` : '/')}
                                    className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Voltar ao Cardápio
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const handleFinish = async () => {
        if (!form.name || !form.phone || !form.address || !form.zipCode) {
            alert("Por favor, preencha todos os dados (incluindo o CEP).");
            return;
        }

        setLoading(true);
        const restaurantId = cart[0].restaurantId || 'default';

        try {
            // Fetch Restaurant Info for Phone Number
            const restRes = await fetch(`/api/restaurants?id=${restaurantId}`);
            const restData = await restRes.json();
            const restaurantPhone = restData.whatsapp || restData.phone || "5581995515777";

            // Debug: Log restaurant geolocation data
            console.log('🔍 Restaurant Geolocation Data:', {
                deliveryRadius: restData.deliveryRadius,
                latitude: restData.latitude,
                longitude: restData.longitude,
                hasAllFields: !!(restData.deliveryRadius && restData.latitude && restData.longitude)
            });

            // Validate Delivery Area if configured
            if (restData.deliveryRadius && restData.latitude && restData.longitude) {
                console.log('✅ Delivery validation ENABLED - checking distance...');
                try {
                    // Get coordinates from CEP using ViaCEP + Nominatim
                    const cepClean = form.zipCode.replace(/\D/g, '');
                    const cepRes = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
                    const cepData = await cepRes.json();

                    if (cepData.erro) {
                        alert('CEP inválido. Por favor, verifique o CEP informado.');
                        setLoading(false);
                        return;
                    }

                    // Get coordinates from address
                    const fullAddress = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}, Brazil`;
                    const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`,
                        { headers: { 'User-Agent': 'OlinDelivery/1.0' } }
                    );
                    const geoData = await geoRes.json();

                    if (geoData && geoData.length > 0) {
                        const customerLat = parseFloat(geoData[0].lat);
                        const customerLon = parseFloat(geoData[0].lon);
                        const restaurantLat = parseFloat(restData.latitude);
                        const restaurantLon = parseFloat(restData.longitude);

                        // Calculate distance using Haversine formula
                        const R = 6371; // Earth's radius in km
                        const dLat = (customerLat - restaurantLat) * Math.PI / 180;
                        const dLon = (customerLon - restaurantLon) * Math.PI / 180;
                        const a =
                            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(restaurantLat * Math.PI / 180) * Math.cos(customerLat * Math.PI / 180) *
                            Math.sin(dLon / 2) * Math.sin(dLon / 2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        const distance = R * c;

                        const maxRadius = parseFloat(restData.deliveryRadius);

                        console.log('📏 Distance Calculation:', {
                            customerCEP: form.zipCode,
                            distance: distance.toFixed(2) + ' km',
                            maxRadius: maxRadius + ' km',
                            isWithinRange: distance <= maxRadius
                        });

                        if (distance > maxRadius) {
                            console.log('❌ BLOCKED: Customer outside delivery area');
                            alert(
                                `Desculpe, você está fora da nossa área de entrega.\n\n` +
                                `Distância: ${distance.toFixed(1)} km\n` +
                                `Raio máximo: ${maxRadius} km\n\n` +
                                `Por favor, entre em contato conosco para verificar possibilidades.`
                            );
                            setLoading(false);
                            return;
                        } else {
                            console.log('✅ APPROVED: Customer within delivery area');
                        }
                    }
                } catch (geoError) {
                    console.error('Geolocation validation error:', geoError);
                    // Continue with order if geolocation fails (don't block customer)
                }
            }

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

            // Format Message
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
                `📍 *Endereço:* ${form.address}\n` +
                `📮 *CEP:* ${form.zipCode}\n\n` +
                `🛒 *ITENS DO PEDIDO:*\n${itemsList}\n\n` +
                (form.observations ? `📝 *Observações:* ${form.observations}\n\n` : '') +
                `💰 *TOTAL: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*\n` +
                `💳 *Pagamento:* ${paymentInfo}\n\n` +
                `_Enviado via OlinDelivery 🚀_`;

            // Sanitize phone
            const cleanPhone = restaurantPhone.replace(/\D/g, '');
            const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
            const link = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;

            clearCart();
            setLoading(false);
            setShowSuccess(true);

            // Direct Redirect (Classic Method) - Fixes encoding and deep linking issues
            window.location.href = link;

        } catch (e) {
            console.error(e);
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
                            <input
                                id="zipCode"
                                name="zipCode"
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="CEP (00000-000)"
                                value={form.zipCode}
                                onChange={e => {
                                    // Mask 00000-000
                                    let val = e.target.value.replace(/\D/g, '');
                                    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5, 8);
                                    else if (val.length > 8) val = val.slice(0, 9);
                                    setForm({ ...form, zipCode: val });
                                }}
                                maxLength={9}
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

                            {form.paymentMethod === 'pix' && restaurant?.pixKey && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-fade-in shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">💠</span>
                                        <span className="font-bold text-green-800">Chave PIX da Loja</span>
                                    </div>
                                    <div
                                        onClick={() => {
                                            navigator.clipboard.writeText(restaurant.pixKey);
                                            alert('Chave PIX copiada para a área de transferência!');
                                        }}
                                        className="flex items-center gap-3 bg-white p-3 rounded-lg border border-green-200 shadow-sm cursor-pointer hover:bg-green-50/50 transition-colors group"
                                    >
                                        <code className="flex-1 font-mono text-sm text-gray-800 break-all select-all">{restaurant.pixKey}</code>
                                        <div className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-100 px-2 py-1.5 rounded-md group-hover:bg-green-200 transition-colors">
                                            <span>COPIAR</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                        </div>
                                    </div>
                                    <p className="text-xs text-green-700 mt-2 font-medium">
                                        ℹ️ Realize o pagamento e envie o comprovante no WhatsApp ao finalizar.
                                    </p>
                                </div>
                            )}

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

            {/* Success Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform animate-scale-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido Realizado!</h2>
                        <p className="text-gray-500 mb-6">Redirecionando para WhatsApp...</p>

                        <div className="bg-gray-100 p-4 rounded-xl mb-6">
                            <div className="text-3xl font-bold text-green-600 animate-pulse">
                                Abrindo...
                            </div>
                        </div>

                        <p className="text-xs text-gray-400">Obrigado por comprar conosco! ❤️</p>
                    </div>
                </div>
            )}
        </div>
    );
}
