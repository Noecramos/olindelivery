"use client";

import { useState, useEffect } from "react";

export default function StoreSettings({ restaurant, onUpdate }: { restaurant: any, onUpdate: (data?: any) => void }) {
    const [form, setForm] = useState(restaurant || {});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (restaurant) {
            setForm(restaurant);
        }
    }, [restaurant]);

    // Auto-generate slug from name when name changes
    useEffect(() => {
        if (form.name && !form.slug) {
            // Generate slug from name
            const generateSlug = (name: string) => {
                const words = name.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                    .split(/\s+/)
                    .filter(word => word.length > 0);

                if (words.length === 1) return words[0];
                if (words.length === 2) return words.join('-');
                // For 3+ words, use first and last word
                return `${words[0]}-${words[words.length - 1]}`;
            };

            const newSlug = generateSlug(form.name);
            setForm((prev: any) => ({ ...prev, slug: newSlug }));
        }
    }, [form.name]);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            // Ensure ID is present
            if (!form.id) {
                alert('Erro: ID da loja não encontrado.');
                return;
            }

            // Ensure WhatsApp has country code if changed
            let finalWhatsapp = form.whatsapp?.replace(/\D/g, '') || '';
            if (finalWhatsapp && !finalWhatsapp.startsWith('55')) {
                finalWhatsapp = '55' + finalWhatsapp;
            }
            const submitData = { ...form, whatsapp: finalWhatsapp };

            const res = await fetch('/api/stores', {
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
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            {/* 🟢 STATUS DA LOJA */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Status de Visibilidade</h3>
                <div className="max-w-md mx-auto">
                    <button
                        onClick={async () => {
                            const newStatus = !form.isOpen;
                            setForm((prev: any) => ({ ...prev, isOpen: newStatus }));
                            try {
                                await fetch('/api/stores', {
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
                        className={`w-full py-5 text-xl font-black rounded-2xl transition-all shadow-lg transform active:scale-95 ${form.isOpen ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                    >
                        {form.isOpen ? '🟢 LOJA ABERTA' : '🔴 LOJA FECHADA'}
                    </button>
                    <p className="mt-4 text-sm text-gray-500 font-medium">
                        {form.isOpen ? 'Sua loja está visível e recebendo pedidos.' : 'Sua loja está oculta para os clientes.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* 💎 ASSINATURA E ACESSO (Only for Super Admin/Internal use usually, but here exposed for editing) */}
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-2xl">💎</span>
                        <h3 className="font-black text-xl text-gray-900">Assinatura e Acesso</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="subscription_status" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Status da Assinatura</label>
                            <select
                                id="subscription_status"
                                className={`w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold appearance-none cursor-pointer ${form.subscription_status === 'active' ? 'text-green-600' :
                                    form.subscription_status === 'overdue' ? 'text-red-600' : 'text-gray-600'
                                    }`}
                                value={form.subscription_status || 'free'}
                                onChange={e => setForm({ ...form, subscription_status: e.target.value })}
                            >
                                <option value="free">Gratuito / Sem Plano</option>
                                <option value="active">Assinante (Plano Pró)</option>
                                <option value="pending">Pendente</option>
                                <option value="overdue">Vencido (Bloqueado)</option>
                                <option value="canceled">Cancelado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ID Asaas (Referência)</label>
                            <input
                                readOnly
                                className="w-full p-4 bg-gray-100/50 rounded-2xl outline-none border border-transparent font-mono text-xs text-gray-400"
                                value={form.asaas_subscription_id || 'Não integrado'}
                            />
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                            <div>
                                <label htmlFor="saasMonthlyPrice" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Valor Mensal (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">R$</span>
                                    <input
                                        type="number"
                                        id="saasMonthlyPrice"
                                        className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold"
                                        value={form.saasMonthlyPrice || ''}
                                        onChange={e => setForm({ ...form, saasMonthlyPrice: e.target.value })}
                                        placeholder="49.90"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="saasTrialDays" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Carência (Dias)</label>
                                <input
                                    type="number"
                                    id="saasTrialDays"
                                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold"
                                    value={form.saasTrialDays || ''}
                                    onChange={e => setForm({ ...form, saasTrialDays: e.target.value })}
                                    placeholder="7"
                                />
                                <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase ml-1">
                                    Vencimento: {(() => {
                                        const baseDate = new Date(form.createdAt || form.created_at);
                                        if (isNaN(baseDate.getTime())) return '---';
                                        const trialDays = parseInt(form.saasTrialDays) || 0;
                                        const expiryDate = new Date(baseDate);
                                        expiryDate.setDate(baseDate.getDate() + trialDays);
                                        return expiryDate.toLocaleDateString();
                                    })()}
                                </p>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 ml-1 font-medium">
                            Preço personalizado para esta loja.
                        </p>
                    </div>
                </div>

                {/* 🏷️ IDENTIDADE DA LOJA */}
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-2xl">🏪</span>
                        <h3 className="font-black text-xl text-gray-900">Identidade da Loja</h3>
                    </div>

                    <div className="space-y-8">
                        {/* Logo Upload */}
                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="relative group">
                                {form.image ? (
                                    <img src={form.image} alt="Logo" className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl" />
                                ) : (
                                    <div className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center text-gray-300 font-black text-4xl shadow-inner">?</div>
                                )}
                                <label htmlFor="logo-upload" className="absolute -bottom-2 -right-2 bg-accent text-white shadow-xl rounded-2xl p-3 cursor-pointer hover:scale-110 transition-all">
                                    <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    <span className="text-lg">📷</span>
                                </label>
                            </div>
                            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{uploading ? 'Enviando...' : 'Alterar Logotipo'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="storeSlug" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Link Exclusivo (URL)</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">https://lojaky.noviapp.com.br/loja/</span>
                                    <input
                                        id="storeSlug"
                                        name="storeSlug"
                                        className="w-full pl-64 p-4 bg-gray-100 rounded-2xl outline-none border border-gray-200 font-bold text-gray-600 cursor-not-allowed"
                                        value={form.slug || ''}
                                        readOnly
                                        placeholder="multicapas_pe"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2 ml-1 font-medium">🔒 Apenas o administrador master pode alterar este link</p>
                            </div>

                            <div>
                                <label htmlFor="storeName" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome da Loja</label>
                                <input
                                    id="storeName"
                                    name="storeName"
                                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold"
                                    value={form.name || ''}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="storeType" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Segmento</label>
                                <select
                                    id="storeType"
                                    name="storeType"
                                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold appearance-none cursor-pointer"
                                    value={form.type || 'Loja'}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                >
                                    <option value="Loja">Loja (Geral)</option>
                                    <option value="Moda">Moda e Acessórios</option>
                                    <option value="Eletrônicos">Eletrônicos e Tech</option>
                                    <option value="Beleza">Beleza e Cosméticos</option>
                                    <option value="Restaurante">Restaurante / Comida</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>



                {/* 📱 CONTATO E RESPONSÁVEL */}
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-2xl">📱</span>
                        <h3 className="font-black text-xl text-gray-900">Contato e Equipe</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="whatsapp" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">WhatsApp para Pedidos</label>
                            <input
                                id="whatsapp"
                                name="whatsapp"
                                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold"
                                value={form.whatsapp || ''}
                                onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                placeholder="81 99999-9999"
                            />
                        </div>
                        <div>
                            <label htmlFor="instagram" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Instagram (@usuario)</label>
                            <input
                                id="instagram"
                                name="instagram"
                                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold"
                                value={form.instagram || ''}
                                onChange={e => setForm({ ...form, instagram: e.target.value })}
                                placeholder="@loja.exemplo"
                            />
                        </div>
                        <div>
                            <label htmlFor="responsibleName" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Responsável</label>
                            <input
                                id="responsibleName"
                                name="responsibleName"
                                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold"
                                value={form.responsibleName || ''}
                                onChange={e => setForm({ ...form, responsibleName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">E-mail Administrativo</label>
                            <input
                                id="email"
                                name="email"
                                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold"
                                value={form.email || ''}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* 🚚 LOGÍSTICA DE ENTREGA */}
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-2xl">🚚</span>
                        <h3 className="font-black text-xl text-gray-900">Logística de Entrega</h3>
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="deliveryTime" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tempo Estimado</label>
                                <input
                                    id="deliveryTime"
                                    name="deliveryTime"
                                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold text-blue-600"
                                    value={form.deliveryTime || ''}
                                    onChange={e => setForm({ ...form, deliveryTime: e.target.value })}
                                    placeholder="Ex: 30-50 min"
                                />
                            </div>
                            <div>
                                <label htmlFor="deliveryRadius" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Raio Máximo (km)</label>
                                <input
                                    type="number"
                                    id="deliveryRadius"
                                    name="deliveryRadius"
                                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold text-blue-600"
                                    value={form.deliveryRadius || ''}
                                    onChange={e => setForm({ ...form, deliveryRadius: e.target.value })}
                                    placeholder="Ex: 10"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-blue-50 rounded-[24px] border border-blue-100">
                            <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4">Taxas por Distância</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[0, 1, 2, 3].map(idx => (
                                    <div key={idx} className="bg-white p-4 rounded-2xl border border-blue-100 flex gap-2">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Até km</p>
                                            <input
                                                type="number"
                                                className="w-full text-sm font-bold outline-none"
                                                value={form.deliveryFeeTiers?.[idx]?.maxDistance || ''}
                                                onChange={e => {
                                                    const tiers = [...(form.deliveryFeeTiers || [{}, {}, {}, {}])];
                                                    tiers[idx] = { ...tiers[idx], maxDistance: e.target.value };
                                                    setForm({ ...form, deliveryFeeTiers: tiers });
                                                }}
                                            />
                                        </div>
                                        <div className="w-px bg-gray-100 my-1"></div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Taxa R$</p>
                                            <input
                                                type="number"
                                                className="w-full text-sm font-bold text-green-600 outline-none"
                                                value={form.deliveryFeeTiers?.[idx]?.fee || ''}
                                                onChange={e => {
                                                    const tiers = [...(form.deliveryFeeTiers || [{}, {}, {}, {}])];
                                                    tiers[idx] = { ...tiers[idx], fee: e.target.value };
                                                    setForm({ ...form, deliveryFeeTiers: tiers });
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div >

                {/* 📍 LOCALIZAÇÃO */}
                < div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm" >
                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-2xl">📍</span>
                        <h3 className="font-black text-xl text-gray-900">Localização</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="zipCode" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">CEP</label>
                            <input
                                id="zipCode"
                                name="zipCode"
                                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold"
                                value={form.zipCode || ''}
                                onChange={e => setForm({ ...form, zipCode: e.target.value })}
                                placeholder="53000-000"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Endereço Completo</label>
                            <input
                                id="address"
                                name="address"
                                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold"
                                value={form.address || ''}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <div className="p-8 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="grid grid-cols-2 gap-8 w-full max-w-sm mb-2">
                                        <div>
                                            <label htmlFor="latitude" className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Latitude</label>
                                            <input
                                                id="latitude"
                                                name="latitude"
                                                className="w-full text-sm font-mono font-bold bg-transparent border-b border-gray-200 focus:border-accent text-center outline-none"
                                                value={form.latitude || ''}
                                                onChange={e => setForm({ ...form, latitude: e.target.value })}
                                                placeholder="-0.0000"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="longitude" className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Longitude</label>
                                            <input
                                                id="longitude"
                                                name="longitude"
                                                className="w-full text-sm font-mono font-bold bg-transparent border-b border-gray-200 focus:border-accent text-center outline-none"
                                                value={form.longitude || ''}
                                                onChange={e => setForm({ ...form, longitude: e.target.value })}
                                                placeholder="-0.0000"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!form.address) return alert('Defina o endereço primeiro');
                                            setLoading(true);
                                            try {
                                                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.address)}&format=json&limit=1`, {
                                                    headers: { 'User-Agent': 'LojAky/1.0' }
                                                });
                                                const data = await res.json();
                                                if (data && data[0]) {
                                                    setForm({ ...form, latitude: data[0].lat, longitude: data[0].lon });
                                                    alert('✅ Coordenadas sincronizadas!');
                                                } else {
                                                    alert('❌ Endereço não encontrado no mapa. Verifique se o endereço está completo.');
                                                }
                                            } catch (e) {
                                                alert('Erro ao buscar coordenadas');
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="px-8 py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                    >
                                        📍 Sincronizar GPS com Endereço
                                    </button>
                                    <p className="text-[10px] text-gray-400 font-medium">Isso permite o cálculo automático da taxa de entrega por distância.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >

                {/* 💳 OPERAÇÃO E PAGAMENTO */}
                < div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm" >
                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-2xl">💳</span>
                        <h3 className="font-black text-xl text-gray-900">Operação e Pagamento</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="pixKey" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Chave PIX (Para pagamento)</label>
                            <input
                                id="pixKey"
                                name="pixKey"
                                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold text-emerald-600"
                                value={form.pixKey || ''}
                                onChange={e => setForm({ ...form, pixKey: e.target.value })}
                                placeholder="CPF, Celular, E-mail ou Chave Aleatória"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="hours" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Horário de Funcionamento</label>
                            <input
                                id="hours"
                                name="hours"
                                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all border border-gray-100 font-bold"
                                value={form.hours || ''}
                                onChange={e => setForm({ ...form, hours: e.target.value })}
                                placeholder="Ex: Seg a Sex: 08h às 18h"
                            />
                        </div>
                    </div>
                </div >

                <div className="sticky bottom-8 z-20">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full py-5 bg-black text-white font-black rounded-2xl shadow-2xl hover:bg-gray-800 transform active:scale-[0.98] transition-all text-lg uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <span>💾</span> Salvar Todas as Alterações
                            </>
                        )}
                    </button>
                </div>
            </form >
        </div >
    );
}
