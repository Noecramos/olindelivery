"use client";

import { useState } from "react";
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
    });

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

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
                alert("Erro ao enviar arquivo.");
            }
        } catch (error) {
            alert("Erro no upload.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Auto-generate slug if empty (though field is there)
            const finalSlug = form.slug || form.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            const submitData = { ...form, slug: finalSlug };

            const res = await fetch('/api/restaurants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            if (res.ok) {
                alert('Cadastro enviado com sucesso! Aguarde a aprovação do administrador.');
                router.push('/admin'); // Redirect to Admin Portal login
            } else {
                alert('Erro ao cadastrar. Verifique os dados.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao conectar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
            <div className="card max-w-2xl w-full p-8 shadow-xl bg-white rounded-3xl my-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Cadastrar Loja</h1>
                    <p className="text-gray-500 mt-2">Junte-se ao OlinDelivery e expanda seu negócio.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Nome Fantasia</label>
                            <input
                                id="name"
                                name="name"
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                placeholder="Ex: Olin Burgers"
                                value={form.name}
                                onChange={e => {
                                    const val = e.target.value;
                                    setForm({ ...form, name: val, slug: val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') });
                                }}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="slug" className="block text-sm font-bold text-gray-700 mb-1">Slug (Link URL)</label>
                            <input
                                id="slug"
                                name="slug"
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                placeholder="ex: olin-burgers"
                                value={form.slug}
                                onChange={e => setForm({ ...form, slug: e.target.value })}
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
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
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
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
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
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                placeholder="5581999999999"
                                value={form.whatsapp}
                                onChange={e => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '') })}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="instagram" className="block text-sm font-bold text-gray-700 mb-1">Instagram (Opcional)</label>
                            <input
                                id="instagram"
                                name="instagram"
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                placeholder="@loja"
                                value={form.instagram}
                                onChange={e => setForm({ ...form, instagram: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Address & Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="zipCode" className="block text-sm font-bold text-gray-700 mb-1">CEP</label>
                            <input
                                id="zipCode"
                                name="zipCode"
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                placeholder="00000-000"
                                value={form.zipCode}
                                onChange={e => setForm({ ...form, zipCode: e.target.value })}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-1">Endereço Completo</label>
                            <input
                                id="address"
                                name="address"
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                                required
                            />
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
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                            >
                                <option value="Lanchonete">Lanchonete</option>
                                <option value="Restaurante">Restaurante</option>
                                <option value="Hamburgueria">Hamburgueria</option>
                                <option value="Pizzaria">Pizzaria</option>
                                <option value="Comida">Comida Caseira</option>
                                <option value="Deposito Bebidas">Depósito de Bebidas</option>
                                <option value="Outro">Outro</option>
                            </select>
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
        </div>
    );
}
