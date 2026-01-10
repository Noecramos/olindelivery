"use client";

import { useState, useEffect } from "react";

export default function RestaurantSettings({ restaurant, onUpdate }: { restaurant: any, onUpdate: () => void }) {
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

            if (res.ok) {
                alert('Dados atualizados com sucesso!');
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
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nome Fantasia</label>
                        <input className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.name || ''}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Cozinha</label>
                        <select className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
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
                                className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 animate-fade-in"
                                placeholder="Especifique o tipo (ex: Japonês)"
                                value={form.type === 'Outro' ? '' : form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp</label>
                        <input className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.whatsapp || ''}
                            onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                            placeholder="5581999999999"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Instagram</label>
                        <input className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.instagram || ''}
                            onChange={e => setForm({ ...form, instagram: e.target.value })}
                            placeholder="@loja"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Taxa de Entrega</label>
                        <input className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.deliveryFee || ''}
                            onChange={e => setForm({ ...form, deliveryFee: e.target.value })}
                            placeholder="Ex: 5.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tempo de Entrega</label>
                        <input className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.deliveryTime || ''}
                            onChange={e => setForm({ ...form, deliveryTime: e.target.value })}
                            placeholder="30-45 min"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Chave PIX</label>
                    <input className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                        value={form.pixKey || ''}
                        onChange={e => setForm({ ...form, pixKey: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Endereço</label>
                    <input className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                        value={form.address || ''}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Responsável</label>
                        <input className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.responsibleName || ''}
                            onChange={e => setForm({ ...form, responsibleName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
                            value={form.email || ''}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Horário de Funcionamento</label>
                    <input className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-100"
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
