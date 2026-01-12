"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRestaurant() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        slug: "",
        responsibleName: "",
        email: "",
        whatsapp: "",
        instagram: "",
        zipCode: "",
        address: "",
        hours: "",
        type: "Lanchonete",
        image: "", // Logo URL
        pixKey: "",
    });

    // Detailed address parts for structured input
    const [addressParts, setAddressParts] = useState({
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        number: "",
        complement: ""
    });

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    // Update form.address whenever parts change
    useEffect(() => {
        const { street, number, neighborhood, city, state, complement } = addressParts;
        if (street && city && state) {
            let fullAddress = `${street}, ${number || 'S/N'}`;
            if (complement) fullAddress += ` (${complement})`;
            fullAddress += `, ${neighborhood}, ${city} - ${state}`;
            setForm(prev => ({ ...prev, address: fullAddress }));
        }
    }, [addressParts]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setForm(prev => ({ ...prev, image: data.url }));
            } else {
                alert(`Erro ao enviar arquivo: ${data.message || 'Falha desconhecida'}`);
            }
        } catch (error: any) {
            console.error("Upload client error:", error);
            alert(`Erro no upload: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5, 8);
        else if (val.length > 8) val = val.slice(0, 9);

        setForm(prev => ({ ...prev, zipCode: val }));

        // Fetch address when CEP is complete (8 digits)
        if (val.replace(/\D/g, '').length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${val.replace(/\D/g, '')}/json/`);
                const data = await res.json();

                if (!data.erro) {
                    setAddressParts(prev => ({
                        ...prev,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                        number: "" // Clear number so user inputs it
                    }));
                } else {
                    // Optional: alert invalid CEP
                }
            } catch (err) {
                console.error("CEP fetch error:", err);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Auto-generate shorter slug from restaurant name
            let finalSlug = form.slug;
            if (!finalSlug) {
                const words = form.name.toLowerCase().replace(/[^\w\s-]/g, '').split(/\s+/).filter(word => word.length > 0);
                if (words.length === 1) finalSlug = words[0];
                else if (words.length === 2) finalSlug = words.join('-');
                else finalSlug = `${words[0]}-${words[words.length - 1]}`;
            }

            // Ensure WhatsApp number has country code (55 for Brazil)
            let finalWhatsapp = form.whatsapp.replace(/\D/g, '');
            if (!finalWhatsapp.startsWith('55') && finalWhatsapp.length > 0) {
                finalWhatsapp = '55' + finalWhatsapp;
            }

            const submitData = { ...form, slug: finalSlug, whatsapp: finalWhatsapp };

            const res = await fetch('/api/restaurants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            if (res.ok) {
                alert('Cadastro enviado com sucesso! Aguarde a aprovação do administrador.');
                router.push('/admin');
            } else {
                const errorData = await res.json();
                console.error('Registration error:', errorData);
                alert('Erro ao cadastrar. Verifique os dados.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Erro ao conectar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center py-8 px-4">
            <div className="w-full max-w-4xl">
                {/* Header Banner */}
                <div className="h-32 md:h-40 w-full bg-cover bg-center relative rounded-t-3xl overflow-hidden" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-b-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-8 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Cadastrar Loja</h1>
                        <p className="text-gray-600 mt-2 font-medium">Junte-se ao OlinDelivery e expanda seu negócio.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Nome Fantasia</label>
                                <input
                                    id="name"
                                    name="name"
                                    className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                    placeholder="Ex: Olin Burgers"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="responsibleName" className="block text-sm font-bold text-gray-700 mb-1">Nome do Responsável</label>
                                <input
                                    id="responsibleName"
                                    name="responsibleName"
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                    value={form.responsibleName}
                                    onChange={e => setForm({ ...form, responsibleName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="whatsapp" className="block text-sm font-bold text-gray-700 mb-1">WhatsApp (com DDD)</label>
                                <input
                                    id="whatsapp"
                                    name="whatsapp"
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                    placeholder="(81) 99999-9999"
                                    value={(() => {
                                        const digits = form.whatsapp.replace(/\D/g, '');
                                        if (digits.length <= 2) return digits;
                                        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                                        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
                                    })()}
                                    onChange={e => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '') })}
                                    maxLength={15}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Código do país (+55) será adicionado automaticamente</p>
                            </div>
                            <div>
                                <label htmlFor="pixKey" className="block text-sm font-bold text-gray-700 mb-1">Chave PIX</label>
                                <input
                                    id="pixKey"
                                    name="pixKey"
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                    placeholder="CPF, CNPJ, Email, Telefone ou Aleatória"
                                    value={form.pixKey}
                                    onChange={e => setForm({ ...form, pixKey: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="instagram" className="block text-sm font-bold text-gray-700 mb-1">Instagram (Opcional)</label>
                                <input
                                    id="instagram"
                                    name="instagram"
                                    className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                    placeholder="@loja"
                                    value={form.instagram}
                                    onChange={e => setForm({ ...form, instagram: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Structured Address */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span>📍</span> Endereço
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="zipCode" className="block text-sm font-bold text-gray-700 mb-1">CEP</label>
                                    <input
                                        id="zipCode"
                                        name="zipCode"
                                        className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                        placeholder="00000-000"
                                        value={form.zipCode}
                                        onChange={handleZipCodeChange}
                                        maxLength={9}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">O endereço será buscado automaticamente.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="street" className="block text-sm font-bold text-gray-700 mb-1">Rua / Logradouro</label>
                                    <input
                                        id="street"
                                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-600"
                                        value={addressParts.street}
                                        readOnly
                                        placeholder="Preenchido automaticamente"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label htmlFor="number" className="block text-sm font-bold text-gray-700 mb-1">Número</label>
                                    <input
                                        id="number"
                                        className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                        placeholder="123"
                                        value={addressParts.number}
                                        onChange={e => setAddressParts(prev => ({ ...prev, number: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label htmlFor="complement" className="block text-sm font-bold text-gray-700 mb-1">Complemento</label>
                                    <input
                                        id="complement"
                                        className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                        placeholder="Apto, Bloco..."
                                        value={addressParts.complement}
                                        onChange={e => setAddressParts(prev => ({ ...prev, complement: e.target.value }))}
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-2">
                                    <label htmlFor="neighborhood" className="block text-sm font-bold text-gray-700 mb-1">Bairro</label>
                                    <input
                                        id="neighborhood"
                                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-600"
                                        value={addressParts.neighborhood}
                                        readOnly
                                        placeholder="Bairro"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-bold text-gray-700 mb-1">Cidade</label>
                                    <input
                                        id="city"
                                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-600"
                                        value={addressParts.city}
                                        readOnly
                                        placeholder="Cidade"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
                                    <input
                                        id="state"
                                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-600"
                                        value={addressParts.state}
                                        readOnly
                                        placeholder="UF"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="hours" className="block text-sm font-bold text-gray-700 mb-1">Horário de Funcionamento</label>
                                <input
                                    id="hours"
                                    name="hours"
                                    className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                    placeholder="Ex: Seg-Sex 18h às 23h"
                                    value={form.hours}
                                    onChange={e => setForm({ ...form, hours: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="type" className="block text-sm font-bold text-gray-700 mb-1">Tipo de Loja</label>
                                <select
                                    id="type"
                                    name="type"
                                    className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
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
                                        className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C] animate-fade-in"
                                        placeholder="Especifique o tipo (ex: Japonês)"
                                        value={form.type === 'Outro' ? '' : form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label htmlFor="logo-upload" className="block text-sm font-bold text-gray-700 mb-1">Logo da Loja</label>
                            <div className="flex items-center gap-4">
                                {form.image && (
                                    <img src={form.image} alt="Logo Preview" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                                )}
                                <input
                                    id="logo-upload"
                                    name="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                                    required={!form.image}
                                />
                            </div>
                            {uploading && <p className="text-xs text-blue-500 mt-1">Enviando imagem...</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="w-full bg-[#EA1D2C] hover:bg-[#C51623] text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all text-lg mt-4 disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? 'Enviando Cadastro...' : 'Enviar Cadastro'}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/admin')}
                            className="w-full bg-white border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all"
                        >
                            Cancelar
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <footer className="w-full text-center text-gray-400 text-xs py-6 mt-4">
                    © 2025 Noviapp Mobile Apps • <a href="http://www.noviapp.com.br" target="_blank" className="hover:underline">www.noviapp.com.br</a> • OlindAki & OlinDelivery
                </footer>
            </div>
        </div>
    );
}
