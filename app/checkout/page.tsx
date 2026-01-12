"use client";

// Checkout page with geolocation delivery radius validation - v2.2 STRICT
// Deploy timestamp: 2026-01-11T15:54:00
// FIXED: Simplified error messages - all scenarios show simple "CEP fora da área" message

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    // ALL HOOKS MUST BE AT THE TOP - before any conditional returns
    const { items: cart, total, subtotal, deliveryFee, setDeliveryFee, clearCart, removeOne, addToCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [whatsappLink, setWhatsappLink] = useState("");
    const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
    const [isCepOutOfRange, setIsCepOutOfRange] = useState(false);
    const [isGuest, setIsGuest] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        zipCode: "",
        address: "",
        paymentMethod: "pix",
        changeFor: "",
        observations: ""
    });

    // Fetch restaurant data
    useEffect(() => {
        if (cart.length > 0) {
            const restaurantId = cart[0].restaurantId;
            if (restaurantId) {
                fetch(`/api/restaurants?id=${restaurantId}&t=${Date.now()}`)
                    .then(res => res.json())
                    .then(data => {
                        console.log('🍽️ Restaurant data loaded:', data);
                        console.log('🔍 Geolocation fields:', {
                            latitude: data.latitude,
                            longitude: data.longitude,
                            deliveryRadius: data.deliveryRadius,
                            hasAll: !!(data.latitude && data.longitude && data.deliveryRadius)
                        });
                        console.log('💰 Delivery Fee Tiers:', data.deliveryFeeTiers);
                        setRestaurant(data);
                        setDeliveryFee(0);
                    })
                    .catch(console.error);
            }
        }
    }, [cart, setDeliveryFee]);

    // Pre-fill form with user data
    useEffect(() => {
        if (user) {
            setForm(prev => ({
                ...prev,
                name: prev.name || user.name || "",
                phone: prev.phone || user.phone || "",
                zipCode: prev.zipCode || user.zipCode || "",
                address: prev.address || user.address || ""
            }));
        }
    }, [user]);

    // Auto-calculate delivery fee if user has zipCode
    useEffect(() => {
        if (user?.zipCode && restaurant && deliveryFee === 0) {
            // Trigger calculateDeliveryFee - defined below but called conditionally here
            const zipCode = user.zipCode;
            if (zipCode && zipCode.length >= 8) {
                // We'll call the calculation inside the main render flow
            }
        }
    }, [user, restaurant, deliveryFee]);

    // ---- CONDITIONAL RETURNS (after all hooks) ----

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    // Interstitial for Login/Register vs Guest
    if (!user && !isGuest && cart.length > 0) {
        return (
            <div className="fixed inset-0 bg-[#F2F4F8] z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        ⚡
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Agilize seu pedido</h2>
                    <p className="text-gray-500 mb-8">
                        Entre ou cadastre-se para preencher seus dados automaticamente e salvar seu endereço.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push(`/login?returnUrl=${encodeURIComponent('/checkout')}`)}
                            className="w-full bg-[#EA1D2C] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#C51623] transition-all"
                        >
                            Entrar / Cadastrar
                        </button>
                        <button
                            onClick={() => setIsGuest(true)}
                            className="w-full bg-white text-gray-500 font-bold py-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                            Continuar como Visitante
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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

    // Function to calculate delivery fee based on distance
    const calculateDeliveryFee = async (zipCode: string) => {
        if (!restaurant || !zipCode || zipCode.length < 8) {
            return;
        }

        // Check if restaurant has delivery fee tiers configured
        const tiers = restaurant.deliveryFeeTiers;
        const hasTiers = tiers && Array.isArray(tiers) && tiers.length > 0 &&
            tiers.some((t: any) => t.maxDistance && t.fee);

        // Check if restaurant has flat delivery fee configured (fallback)
        const flatFee = parseFloat(restaurant.deliveryFee);
        const hasFlatFee = !isNaN(flatFee) && flatFee > 0;

        if (!hasTiers && !hasFlatFee) {
            console.log('ℹ️ No delivery fee configured (neither tiers nor flat fee)');
            setDeliveryFee(0);
            setIsCepOutOfRange(false);
            return;
        }

        // Check if geolocation is configured
        if (!restaurant.latitude || !restaurant.longitude) {
            console.log('ℹ️ Restaurant geolocation not configured');
            // If only flat fee is configured (no tiers), use it without distance calculation
            if (hasFlatFee && !hasTiers) {
                console.log('💰 Using flat delivery fee (no geolocation):', flatFee);
                setDeliveryFee(flatFee);
                setIsCepOutOfRange(false);
                return;
            }
            setDeliveryFee(0);
            setIsCepOutOfRange(false);
            return;
        }

        try {
            // Get coordinates from CEP
            const cepClean = zipCode.replace(/\D/g, '');
            console.log('🔎 Calculating delivery fee for CEP:', cepClean);

            const cepRes = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
            const cepData = await cepRes.json();

            if (cepData.erro) {
                console.log('❌ Invalid CEP');
                setDeliveryFee(0);
                setCalculatedDistance(null);
                // If delivery radius validation is enabled, block invalid CEPs
                if (restaurant.deliveryRadius && restaurant.latitude && restaurant.longitude) {
                    setIsCepOutOfRange(true);
                    alert(
                        `⚠️ CEP INVÁLIDO\n\n` +
                        `Por favor, verifique o CEP informado e tente novamente.`
                    );
                }
                return;
            }

            // Get coordinates from address
            const fullAddress = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}, Brazil`;
            console.log('🌍 Geocoding address:', fullAddress);

            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`,
                { headers: { 'User-Agent': 'OlinDelivery/1.0' } }
            );
            const geoData = await geoRes.json();

            if (geoData && geoData.length > 0) {
                const customerLat = parseFloat(geoData[0].lat);
                const customerLon = parseFloat(geoData[0].lon);
                const restaurantLat = parseFloat(restaurant.latitude);
                const restaurantLon = parseFloat(restaurant.longitude);

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

                console.log('📏 Distance calculated:', distance.toFixed(2), 'km');
                setCalculatedDistance(distance);

                // Check if distance exceeds delivery radius
                const maxDeliveryRadius = parseFloat(restaurant.deliveryRadius);
                if (maxDeliveryRadius && distance > maxDeliveryRadius) {
                    console.error('❌ Distance exceeds delivery radius!');
                    console.error(`Distance: ${distance.toFixed(2)}km > Max: ${maxDeliveryRadius}km`);
                    setDeliveryFee(0);
                    setIsCepOutOfRange(true); // Mark CEP as out of range
                    alert(
                        `⚠️ CEP FORA DA ÁREA DE ENTREGA\n\n` +
                        `Este CEP está fora da nossa área de entrega automática. Por favor, entre em contato via WhatsApp para realizar seu pedido.`
                    );
                    return;
                }

                // CEP is within range
                setIsCepOutOfRange(false);

                // If using flat fee (no tiers), apply it now
                if (!hasTiers && hasFlatFee) {
                    console.log('💰 Using flat delivery fee:', flatFee);
                    setDeliveryFee(flatFee);
                    return;
                }

                // Find appropriate fee tier
                const validTiers = tiers
                    .filter((t: any) => t.maxDistance && t.fee)
                    .sort((a: any, b: any) => parseFloat(a.maxDistance) - parseFloat(b.maxDistance));

                let selectedFee = 0;
                let tierFound = false;

                for (const tier of validTiers) {
                    if (distance <= parseFloat(tier.maxDistance)) {
                        selectedFee = parseFloat(tier.fee);
                        tierFound = true;
                        console.log(`✅ Selected tier: up to ${tier.maxDistance}km = R$ ${tier.fee}`);
                        break;
                    }
                }

                if (!tierFound && validTiers.length > 0) {
                    // Distance exceeds all configured tiers but is within delivery radius
                    const maxTier = validTiers[validTiers.length - 1];
                    console.log(`⚠️ Distance (${distance.toFixed(2)}km) exceeds all tiers (max: ${maxTier.maxDistance}km)`);
                    console.log(`Using highest tier fee: R$ ${maxTier.fee}`);
                    selectedFee = parseFloat(maxTier.fee);
                }

                setDeliveryFee(selectedFee);
                console.log('💰 Delivery fee set to:', selectedFee);
            } else {
                console.log('❌ Could not geocode address');
                setDeliveryFee(0);
                setCalculatedDistance(null);
                // If delivery radius validation is enabled, block when geocoding fails
                if (restaurant.deliveryRadius && restaurant.latitude && restaurant.longitude) {
                    setIsCepOutOfRange(true);
                    alert(
                        `⚠️ CEP FORA DA ÁREA DE ENTREGA\n\n` +
                        `Este CEP está fora da nossa área de entrega automática. Por favor, entre em contato via WhatsApp para realizar seu pedido.`
                    );
                }
            }
        } catch (error) {
            console.error('❌ Error calculating delivery fee:', error);
            setDeliveryFee(0);
            setCalculatedDistance(null);
            // If delivery radius validation is enabled, block on errors
            if (restaurant.deliveryRadius && restaurant.latitude && restaurant.longitude) {
                setIsCepOutOfRange(true);
            }
        }
    };

    const handleFinish = async () => {
        if (!form.name || !form.phone || !form.address || !form.zipCode) {
            alert("Por favor, preencha todos os dados (incluindo o CEP).");
            return;
        }

        // Check if CEP is out of delivery range
        if (isCepOutOfRange) {
            alert(
                "⚠️ CEP FORA DA ÁREA DE ENTREGA\n\n" +
                "Este CEP está fora da nossa área de entrega automática. Por favor, entre em contato via WhatsApp para realizar seu pedido."
            );
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
                hasAllFields: !!(restData.deliveryRadius && restData.latitude && restData.longitude),
                rawData: {
                    deliveryRadius: restData.deliveryRadius,
                    latitude: restData.latitude,
                    longitude: restData.longitude
                }
            });

            // Validate Delivery Area if configured
            if (restData.deliveryRadius && restData.latitude && restData.longitude) {
                // Validate coordinate format
                const lat = parseFloat(restData.latitude);
                const lon = parseFloat(restData.longitude);
                const radius = parseFloat(restData.deliveryRadius);

                // Check if coordinates are valid numbers
                if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
                    console.error('❌ Invalid coordinate format detected!');
                    console.error('Parsed values:', { lat, lon, radius });
                    console.error('⚠️ Geolocation validation DISABLED due to invalid data');
                    console.error('Please reconfigure coordinates in Admin Panel → Settings');
                } else if (lat < -33.75 || lat > 5.27 || lon < -73.99 || lon > -28.84) {
                    // Check if coordinates are within Brazil's bounds
                    console.error('❌ Coordinates outside Brazil\'s valid range!');
                    console.error('Current:', { lat, lon });
                    console.error('Valid range: Lat: -33.75 to 5.27, Lon: -73.99 to -28.84');
                    console.error('⚠️ Geolocation validation DISABLED due to invalid coordinates');
                    console.error('Please reconfigure coordinates in Admin Panel → Settings');
                } else {
                    console.log('✅ Delivery validation ENABLED - checking distance...');
                    console.log('📍 Restaurant Location:', {
                        lat: restData.latitude,
                        lon: restData.longitude,
                        radius: restData.deliveryRadius + ' km'
                    });

                    try {
                        // Get coordinates from CEP using ViaCEP + Nominatim
                        const cepClean = form.zipCode.replace(/\D/g, '');
                        console.log('🔎 Looking up CEP:', cepClean);

                        const cepRes = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
                        const cepData = await cepRes.json();

                        console.log('📮 ViaCEP Response:', cepData);

                        if (cepData.erro) {
                            console.error('❌ Invalid CEP');
                            alert('CEP inválido. Por favor, verifique o CEP informado.');
                            setLoading(false);
                            return;
                        }

                        // Get coordinates from address
                        const fullAddress = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}, Brazil`;
                        console.log('🌍 Geocoding address:', fullAddress);

                        const geoRes = await fetch(
                            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`,
                            { headers: { 'User-Agent': 'OlinDelivery/1.0' } }
                        );
                        const geoData = await geoRes.json();

                        console.log('🗺️ Nominatim Response:', geoData);

                        if (geoData && geoData.length > 0) {
                            const customerLat = parseFloat(geoData[0].lat);
                            const customerLon = parseFloat(geoData[0].lon);
                            const restaurantLat = parseFloat(restData.latitude);
                            const restaurantLon = parseFloat(restData.longitude);

                            console.log('📊 Coordinates:', {
                                customer: { lat: customerLat, lon: customerLon },
                                restaurant: { lat: restaurantLat, lon: restaurantLon }
                            });

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
                                customerAddress: fullAddress,
                                distance: distance.toFixed(2) + ' km',
                                maxRadius: maxRadius + ' km',
                                isWithinRange: distance <= maxRadius,
                                willBlock: distance > maxRadius
                            });

                            if (distance > maxRadius) {
                                console.error('❌ BLOCKED: Customer outside delivery area');
                                console.error('Distance:', distance.toFixed(2), 'km > Max:', maxRadius, 'km');
                                alert(
                                    `⚠️ CEP FORA DA ÁREA DE ENTREGA\n\n` +
                                    `Este CEP está fora da nossa área de entrega automática. Por favor, entre em contato via WhatsApp para realizar seu pedido.`
                                );
                                setLoading(false);
                                return;
                            } else {
                                console.log('✅ APPROVED: Customer within delivery area');
                                console.log('Distance:', distance.toFixed(2), 'km ≤ Max:', maxRadius, 'km');
                            }
                        } else {
                            console.error('❌ BLOCKED: Could not geocode address');
                            console.error('Address not found in geocoding database');
                            alert(
                                `⚠️ CEP FORA DA ÁREA DE ENTREGA\n\n` +
                                `Este CEP está fora da nossa área de entrega automática. Por favor, entre em contato via WhatsApp para realizar seu pedido.`
                            );
                            setLoading(false);
                            return;
                        }
                    } catch (geoError) {
                        console.error('❌ Geolocation validation error:', geoError);
                        console.error('Error details:', {
                            message: geoError instanceof Error ? geoError.message : 'Unknown error',
                            stack: geoError instanceof Error ? geoError.stack : undefined
                        });
                        // Block order if geolocation validation fails when it's required
                        console.error('❌ BLOCKED: Geolocation validation failed');
                        alert(
                            `⚠️ CEP FORA DA ÁREA DE ENTREGA\n\n` +
                            `Este CEP está fora da nossa área de entrega automática. Por favor, entre em contato via WhatsApp para realizar seu pedido.`
                        );
                        setLoading(false);
                        return;
                    }
                }
            } else {
                console.log('ℹ️ Delivery radius validation DISABLED (missing configuration)');
                console.log('Missing fields:', {
                    deliveryRadius: !restData.deliveryRadius,
                    latitude: !restData.latitude,
                    longitude: !restData.longitude
                });
            }

            const orderData = {
                restaurantId,
                customerName: form.name,
                customerPhone: form.phone,
                customerAddress: form.address,
                customerZipCode: form.zipCode,
                items: cart,
                subtotal,
                deliveryFee,
                total,
                paymentMethod: form.paymentMethod,
                changeFor: form.paymentMethod === 'money' ? (parseFloat(form.changeFor) || 0) : null,
                observations: form.observations,
                status: 'pending'
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erro ao salvar pedido no banco de dados.");
            }

            const order = await res.json();
            const ticketNumber = order.ticketNumber || '###';

            // Format Message
            const getIcon = (cat: string) => {
                const lower = (cat || '').toLowerCase();
                if (lower.includes('pizza')) return '🍕';
                if (lower.includes('lanche') || lower.includes('burger') || lower.includes('hamb')) return '🍔';
                if (lower.includes('bebida') || lower.includes('suco') || lower.includes('refr')) return '🥤';
                if (lower.includes('açaí') || lower.includes('doce') || lower.includes('sobremesa')) return '🍧';
                if (lower.includes('combo')) return '🍱';
                if (lower.includes('porção') || lower.includes('petisco')) return '🍟';
                return '🍽️';
            };

            const itemsList = cart.map((i: any) => {
                const icon = getIcon(i.category);
                const itemTotal = i.price * i.quantity;
                return `${icon} *${i.quantity}x ${i.name}* - ${itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
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
                `💵 *Subtotal:* ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
                `🚚 *Taxa de Entrega:* ${deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
                `💰 *TOTAL: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*\n\n` +
                (form.observations ? `📝 *Observações:* ${form.observations}\n\n` : '') +
                `💳 *Pagamento:* ${paymentInfo}\n\n` +
                `_Enviado via OlinDelivery 🚀_`;

            // Sanitize phone
            const cleanPhone = restaurantPhone.replace(/\D/g, '');
            const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
            const link = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;

            setWhatsappLink(link);
            clearCart();
            setLoading(false);
            setShowSuccess(true);

            // Try automatic redirect, but keep button as fallback
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
                    {restaurant?.deliveryRadius && restaurant?.latitude && restaurant?.longitude && (
                        <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                            <span>📍</span>
                            <span>Validação de área de entrega ativa ({restaurant.deliveryRadius} km)</span>
                        </div>
                    )}
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

                                    // Calculate delivery fee when CEP is complete
                                    if (val.replace(/\D/g, '').length === 8) {
                                        calculateDeliveryFee(val);
                                    }
                                }}
                                onBlur={() => {
                                    // Also calculate on blur if CEP is complete
                                    if (form.zipCode.replace(/\D/g, '').length === 8) {
                                        calculateDeliveryFee(form.zipCode);
                                    }
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

                            {/* Display Delivery Fee Tiers */}
                            {restaurant?.deliveryFeeTiers && Array.isArray(restaurant.deliveryFeeTiers) && restaurant.deliveryFeeTiers.some((t: any) => t.maxDistance && t.fee) && (
                                <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-lg">🚚</span>
                                        <span className="font-bold text-green-900 text-sm">Taxas de Entrega</span>
                                    </div>
                                    <div className="space-y-2">
                                        {restaurant.deliveryFeeTiers
                                            .filter((t: any) => t.maxDistance && t.fee)
                                            .sort((a: any, b: any) => parseFloat(a.maxDistance) - parseFloat(b.maxDistance))
                                            .map((tier: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-xs bg-white px-3 py-2 rounded-lg border border-green-100">
                                                    <span className="text-gray-700">
                                                        <span className="font-medium">Até {tier.maxDistance} km</span>
                                                    </span>
                                                    <span className="font-bold text-green-700">
                                                        {parseFloat(tier.fee).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                    {calculatedDistance !== null && (
                                        <div className="mt-3 pt-3 border-t border-green-200">
                                            <div className="text-xs text-green-800">
                                                <span className="font-medium">📍 Distância calculada:</span> {calculatedDistance.toFixed(2)} km
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-green-700 mt-3">
                                        💡 A taxa será calculada automaticamente após informar seu CEP.
                                    </p>
                                </div>
                            )}
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
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-gray-800 font-medium">
                                        {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Taxa de Entrega</span>
                                    <span className="text-gray-800 font-medium">
                                        {deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-6 pt-3 border-t border-gray-200">
                                <span className="text-gray-700 font-bold">Total a pagar</span>
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
                        <p className="text-gray-500 mb-6">Seu pedido foi validado com sucesso.</p>

                        <div className="bg-gray-100 p-4 rounded-xl mb-6">
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>📱</span>
                                <span>Enviar no WhatsApp</span>
                            </a>
                            <p className="text-xs text-gray-400 mt-2">Clique acima para enviar o pedido</p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm text-gray-400 underline hover:text-gray-600"
                        >
                            Voltar para o início
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
