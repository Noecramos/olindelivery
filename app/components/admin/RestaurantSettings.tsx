"use client";

import { useState, useEffect } from "react";

export default function RestaurantSettings({ restaurant, onUpdate }: { restaurant: any, onUpdate: (data?: any) => void }) {
    const [form, setForm] = useState(restaurant || {});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (restaurant) {
            setForm(restaurant);
        }
    }, [restaurant]);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            // Ensure ID is present
            if (!form.id) {
                alert('Erro: ID do restaurante não encontrado.');
                return;
            }

            // Ensure WhatsApp has country code if changed
            let finalWhatsapp = form.whatsapp?.replace(/\D/g, '') || '';
            if (finalWhatsapp && !finalWhatsapp.startsWith('55')) {
                finalWhatsapp = '55' + finalWhatsapp;
            }
            const submitData = { ...form, whatsapp: finalWhatsapp };

            const res = await fetch('/api/restaurants', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            const data = await res.json();

            if (res.ok) {
                alert('Dados atualizados com sucesso!');

                // Notify parent of update, passing response data (which includes new slug)
                if (onUpdate) onUpdate(data);

                // Reset fields to blank as requested
                const { id, isOpen, image } = form; // Keep critical identifiers
                setForm({ id, isOpen, image }); // Clear name, phone, etc.
            } else {
                alert('Erro ao atualizar dados.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) {
                setForm((prev: any) => ({ ...prev, image: data.url }));
            } else {
                alert('Erro no upload da imagem');
            }
        } catch (error) {
            alert('Erro no upload');
        } finally {
            setUploading(false);
        }
    };

    if (!form.id) return <div>Carregando...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Quick Actions Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Status da Loja (Visibilidade)</h3>
                <button
                    onClick={async () => {
                        const newStatus = !form.isOpen;
                        setForm((prev: any) => ({ ...prev, isOpen: newStatus }));
                        try {
                            await fetch('/api/restaurants', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: form.id, isOpen: newStatus })
                            });
                            onUpdate();
                        } catch (e) {
                            alert('Erro ao mudar status');
                            setForm((prev: any) => ({ ...prev, isOpen: !newStatus }));
                        }
                    }}
                    type="button"
                    className={`w-full py-4 text-xl font-bold rounded-2xl transition-all shadow-md transform active:scale-95 ${form.isOpen ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                    {form.isOpen ? '🟢 LOJA ABERTA' : '🔴 LOJA FECHADA'}
                </button>
                <p className="text-center mt-2 text-sm text-gray-500">
                    {form.isOpen ? 'Sua loja está recebendo pedidos.' : 'Sua loja não aparecerá para os clientes.'}
                </p>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h3 className="font-bold text-xl text-gray-800">Editar Informações</h3>
                </div>

                {/* Logo */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {form.image ? (
                            <img src={form.image} alt="Logo" className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">Logo</div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-white shadow-md rounded-full p-1 cursor-pointer border border-gray-200 hover:bg-gray-50">
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            <span className="text-xs">📷</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="restaurantName" className="block text-sm font-bold text-gray-700 mb-1">Nome Fantasia</label>
                        <input id="restaurantName" name="restaurantName" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.name || ''}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="kitchenType" className="block text-sm font-bold text-gray-700 mb-1">Tipo de Cozinha</label>
                        <select id="kitchenType" name="kitchenType" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={['Lanchonete', 'Restaurante', 'Hamburgueria', 'Pizzaria', 'Comida', 'Bebidas'].includes(form.type) ? form.type : 'Outro'}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                        >
                            <option value="Lanchonete">Lanchonete</option>
                            <option value="Restaurante">Restaurante</option>
                            <option value="Hamburgueria">Hamburgueria</option>
                            <option value="Pizzaria">Pizzaria</option>
                            <option value="Comida">Comida Caseira</option>
                            <option value="Bebidas">Bebidas</option>
                            <option value="Outro">Outro (Especificar)</option>
                        </select>
                        {(!['Lanchonete', 'Restaurante', 'Hamburgueria', 'Pizzaria', 'Comida', 'Bebidas'].includes(form.type)) && (
                            <input
                                id="customType" name="customType"
                                className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 animate-fade-in"
                                placeholder="Especifique o tipo (ex: Japonês)"
                                value={form.type === 'Outro' ? '' : (form.type || '')}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="whatsapp" className="block text-sm font-bold text-gray-700 mb-1">WhatsApp</label>
                        <input id="whatsapp" name="whatsapp" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.whatsapp || ''}
                            onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                            placeholder="5581999999999"
                        />
                    </div>
                    <div>
                        <label htmlFor="instagram" className="block text-sm font-bold text-gray-700 mb-1">Instagram</label>
                        <input id="instagram" name="instagram" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.instagram || ''}
                            onChange={e => setForm({ ...form, instagram: e.target.value })}
                            placeholder="@loja"
                        />
                    </div>
                </div>

                {/* Distance-Based Delivery Fee Tiers */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                        <span>🚚</span> Taxas de Entrega por Distância
                    </h3>
                    <p className="text-xs text-green-700 mb-4">
                        Configure até 4 faixas de preço baseadas na distância. O sistema calculará automaticamente a taxa correta com base no CEP do cliente.
                    </p>

                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((tier) => {
                            const tierData = form.deliveryFeeTiers?.[tier - 1] || { maxDistance: '', fee: '' };
                            return (
                                <div key={tier} className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-green-100">
                                    <div>
                                        <label htmlFor={`tier-dist-${tier}`} className="block text-xs font-bold text-gray-700 mb-1">
                                            Faixa {tier} - Até (km)
                                        </label>
                                        <input
                                            id={`tier-dist-${tier}`}
                                            name={`tier-dist-${tier}`}
                                            className="w-full p-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all border border-gray-200 text-sm"
                                            type="number"
                                            step="0.1"
                                            value={tierData.maxDistance}
                                            onChange={e => {
                                                const tiers = form.deliveryFeeTiers || [{}, {}, {}, {}];
                                                tiers[tier - 1] = { ...tiers[tier - 1], maxDistance: e.target.value };
                                                setForm({ ...form, deliveryFeeTiers: tiers });
                                            }}
                                            placeholder={tier === 1 ? "5" : tier === 2 ? "10" : tier === 3 ? "15" : "20"}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`tier-fee-${tier}`} className="block text-xs font-bold text-gray-700 mb-1">
                                            Taxa (R$)
                                        </label>
                                        <input
                                            id={`tier-fee-${tier}`}
                                            name={`tier-fee-${tier}`}
                                            className="w-full p-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all border border-gray-200 text-sm"
                                            type="number"
                                            step="0.01"
                                            value={tierData.fee}
                                            onChange={e => {
                                                const tiers = form.deliveryFeeTiers || [{}, {}, {}, {}];
                                                tiers[tier - 1] = { ...tiers[tier - 1], fee: e.target.value };
                                                setForm({ ...form, deliveryFeeTiers: tiers });
                                            }}
                                            placeholder={tier === 1 ? "5.00" : tier === 2 ? "10.00" : tier === 3 ? "15.00" : "20.00"}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 p-3 bg-white rounded-lg border border-green-100">
                        <p className="text-xs text-gray-600">
                            💡 <strong>Exemplo:</strong> Faixa 1: até 5km = R$ 5,00 | Faixa 2: até 10km = R$ 10,00 | Faixa 3: até 15km = R$ 15,00
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            ⚠️ Configure as faixas em ordem crescente de distância. Deixe em branco as faixas que não usar.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="deliveryTime" className="block text-sm font-bold text-gray-700 mb-1">Tempo de Entrega</label>
                        <input id="deliveryTime" name="deliveryTime" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.deliveryTime || ''}
                            onChange={e => setForm({ ...form, deliveryTime: e.target.value })}
                            placeholder="30-45 min"
                        />
                    </div>
                </div>


                <div>
                    <label htmlFor="pixKey" className="block text-sm font-bold text-gray-700 mb-1">Chave PIX</label>
                    <input id="pixKey" name="pixKey" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                        value={form.pixKey || ''}
                        onChange={e => setForm({ ...form, pixKey: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="zipCode" className="block text-sm font-bold text-gray-700 mb-1">CEP</label>
                        <div className="relative">
                            <input id="zipCode" name="zipCode" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                                value={form.zipCode || ''}
                                onChange={async (e) => {
                                    // Mask 00000-000
                                    let val = e.target.value.replace(/\D/g, '');
                                    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5, 8);
                                    setForm({ ...form, zipCode: val });

                                    // Auto-fill address when CEP is complete (8 digits)
                                    const cleanCep = val.replace(/\D/g, '');
                                    if (cleanCep.length === 8) {
                                        try {
                                            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                                            const data = await res.json();

                                            if (!data.erro) {
                                                // Build full address from ViaCEP data
                                                const parts = [];
                                                if (data.logradouro) parts.push(data.logradouro);
                                                if (data.bairro) parts.push(data.bairro);
                                                if (data.localidade) parts.push(data.localidade);
                                                if (data.uf) parts.push(data.uf);

                                                const fullAddress = parts.join(', ');
                                                setForm(prev => ({ ...prev, address: fullAddress }));
                                            }
                                        } catch (err) {
                                            console.error('CEP fetch error:', err);
                                        }
                                    }
                                }}
                                placeholder="00000-000"
                                maxLength={9}
                            />
                            {form.zipCode?.replace(/\D/g, '').length === 8 && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Digite o CEP para preencher o endereço automaticamente</p>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-1">Endereço Completo</label>
                        <input id="address" name="address" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.address || ''}
                            onChange={e => setForm({ ...form, address: e.target.value })}
                            placeholder="Rua, Número, Bairro, Cidade, Estado"
                        />
                        <p className="text-xs text-gray-500 mt-1">Adicione o número e complemento após preencher o CEP</p>
                    </div>
                </div>

                {/* Delivery Area Configuration */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <span>📍</span> Área de Entrega (Geolocalização)
                    </h3>
                    <p className="text-xs text-blue-700 mb-4">
                        Configure o raio de entrega. As coordenadas serão preenchidas automaticamente a partir do endereço.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="deliveryRadius" className="block text-sm font-bold text-gray-700 mb-1">Raio de Entrega (km)</label>
                            <input id="deliveryRadius" name="deliveryRadius"
                                className="w-full p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-200"
                                type="number"
                                step="0.1"
                                value={form.deliveryRadius || ''}
                                onChange={e => setForm({ ...form, deliveryRadius: e.target.value })}
                                placeholder="Ex: 5"
                            />
                            <p className="text-xs text-gray-500 mt-1">Distância máxima em km</p>
                        </div>
                        <div>
                            <label htmlFor="latitude" className="block text-sm font-bold text-gray-700 mb-1">Latitude</label>
                            <input id="latitude" name="latitude"
                                className="w-full p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-200"
                                value={form.latitude || ''}
                                onChange={e => setForm({ ...form, latitude: e.target.value })}
                                placeholder="Ex: -8.0476"
                            />
                            <p className="text-xs text-gray-500 mt-1">Coordenada Y</p>
                        </div>
                        <div>
                            <label htmlFor="longitude" className="block text-sm font-bold text-gray-700 mb-1">Longitude</label>
                            <input id="longitude" name="longitude"
                                className="w-full p-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-200"
                                value={form.longitude || ''}
                                onChange={e => setForm({ ...form, longitude: e.target.value })}
                                placeholder="Ex: -34.8770"
                            />
                            <p className="text-xs text-gray-500 mt-1">Coordenada X</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            if (!form.address) {
                                alert('Por favor, preencha o endereço primeiro!');
                                return;
                            }

                            setLoading(true);

                            // Helper to normalize Brazilian address for geocoding
                            const normalizeAddress = (addr: string): string => {
                                let normalized = addr
                                    // Expand common abbreviations
                                    .replace(/^R\./i, 'Rua')
                                    .replace(/^Av\./i, 'Avenida')
                                    .replace(/^Trav\./i, 'Travessa')
                                    .replace(/^Al\./i, 'Alameda')
                                    .replace(/^Pç\./i, 'Praça')
                                    // Remove "n." or "nº" before numbers
                                    .replace(/\bn\.?\s*(\d+)/gi, '$1')
                                    .replace(/\bnº\s*(\d+)/gi, '$1')
                                    // Remove CEP (5 digits dash 3 digits)
                                    .replace(/\d{5}-?\d{3}/g, '')
                                    // Clean up multiple spaces
                                    .replace(/\s+/g, ' ')
                                    .trim();
                                return normalized;
                            };

                            // Helper to fetch geo data
                            const fetchGeo = async (query: string) => {
                                console.log('🔍 Searching geo for:', query);
                                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`, {
                                    headers: { 'User-Agent': 'OlinDelivery/1.0' }
                                });
                                return await res.json();
                            };

                            try {
                                const normalizedAddr = normalizeAddress(form.address);
                                console.log('📍 Normalized address:', normalizedAddr);

                                // Strategy 1: Try full normalized address
                                let geoData = await fetchGeo(normalizedAddr + ', Pernambuco, Brazil');

                                if (geoData && geoData.length > 0) {
                                    setForm({ ...form, latitude: geoData[0].lat, longitude: geoData[0].lon });
                                    alert('✅ Coordenadas obtidas com sucesso!');
                                    setLoading(false);
                                    return;
                                }

                                // Strategy 2: Try with just city/neighborhood
                                // Extract city from patterns like "Olinda - PE" or "Olinda, PE"
                                const cityMatch = normalizedAddr.match(/,\s*([^,]+(?:\s*-\s*[A-Z]{2})?)\s*$/i);
                                if (cityMatch) {
                                    const cityPart = cityMatch[1].replace(/\s*-\s*[A-Z]{2}/i, '').trim();
                                    const streetPart = normalizedAddr.split(',')[0].trim();

                                    const simpleQuery = `${streetPart}, ${cityPart}, Pernambuco, Brazil`;
                                    console.log('🔍 Strategy 2:', simpleQuery);
                                    geoData = await fetchGeo(simpleQuery);

                                    if (geoData && geoData.length > 0) {
                                        setForm({ ...form, latitude: geoData[0].lat, longitude: geoData[0].lon });
                                        alert(`✅ Coordenadas obtidas! (baseado em ${streetPart}, ${cityPart})`);
                                        setLoading(false);
                                        return;
                                    }
                                }

                                // Strategy 3: Try neighborhood + city only (for approximate location)
                                const parts = normalizedAddr.split(/[,\-]/);
                                if (parts.length >= 3) {
                                    // Try parts[2] (usually neighborhood) + parts[3] (usually city)
                                    const neighborhood = parts[2]?.trim();
                                    const city = parts[3]?.replace(/[A-Z]{2}$/i, '').trim() || 'Olinda';

                                    if (neighborhood) {
                                        const neighborhoodQuery = `${neighborhood}, ${city}, Pernambuco, Brazil`;
                                        console.log('🔍 Strategy 3:', neighborhoodQuery);
                                        geoData = await fetchGeo(neighborhoodQuery);

                                        if (geoData && geoData.length > 0) {
                                            setForm({ ...form, latitude: geoData[0].lat, longitude: geoData[0].lon });
                                            alert(`⚠️ Coordenadas APROXIMADAS obtidas (centro do bairro ${neighborhood}).\nRecomendamos verificar no Google Maps.`);
                                            setLoading(false);
                                            return;
                                        }
                                    }
                                }

                                // Strategy 4: Try just the city
                                const justCity = normalizedAddr.match(/Olinda|Recife|Paulista|Abreu e Lima|Igarassu/i);
                                if (justCity) {
                                    const cityQuery = `${justCity[0]}, Pernambuco, Brazil`;
                                    console.log('🔍 Strategy 4:', cityQuery);
                                    geoData = await fetchGeo(cityQuery);

                                    if (geoData && geoData.length > 0) {
                                        setForm({ ...form, latitude: geoData[0].lat, longitude: geoData[0].lon });
                                        alert(`⚠️ Coordenadas MUITO APROXIMADAS (centro de ${justCity[0]}).\nVocê DEVE ajustar manualmente via Google Maps.`);
                                        setLoading(false);
                                        return;
                                    }
                                }

                                alert('❌ Não foi possível encontrar as coordenadas automaticamente.\n\n💡 SOLUÇÃO: Abra o Google Maps, pesquise seu endereço, clique com botão direito no local e copie as coordenadas. Cole a Latitude e Longitude nos campos acima.');
                            } catch (error) {
                                console.error(error);
                                alert('❌ Erro de conexão ao buscar coordenadas. Tente novamente.');
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading || !form.address}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <span>📍</span>
                        {loading ? 'Buscando coordenadas...' : 'Obter Coordenadas do Endereço Automaticamente'}
                    </button>

                    <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
                        <p className="text-xs text-gray-600">
                            💡 <strong>Como usar:</strong> Preencha o endereço completo acima e clique no botão azul para obter as coordenadas automaticamente.
                            Depois, defina o raio de entrega em km.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="responsibleName" className="block text-sm font-bold text-gray-700 mb-1">Responsável</label>
                        <input id="responsibleName" name="responsibleName" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.responsibleName || ''}
                            onChange={e => setForm({ ...form, responsibleName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input id="email" name="email" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.email || ''}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="hours" className="block text-sm font-bold text-gray-700 mb-1">Horário de Funcionamento</label>
                    <input id="hours" name="hours" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                        value={form.hours || ''}
                        onChange={e => setForm({ ...form, hours: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all text-lg mt-4 disabled:opacity-50"
                >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </form>
        </div>
    );
}
