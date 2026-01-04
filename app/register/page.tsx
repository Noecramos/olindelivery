"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRestaurant() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        slug: "",
        banner: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80"
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/restaurants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                alert('Solicitação enviada! Aguarde a aprovação do administrador.');
                router.push('/');
            } else {
                alert('Erro ao cadastrar.');
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
            <div className="card max-w-lg w-full p-8 shadow-xl bg-white rounded-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Parceiro OlinDelivery</h1>
                    <p className="text-gray-500 mt-2">Cadastre seu restaurante e comece a vender hoje mesmo.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="restaurantName" className="text-sm font-bold text-gray-700 ml-1">Nome do Restaurante</label>
                        <input
                            id="restaurantName"
                            name="restaurantName"
                            className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#EA1D2C] outline-none transition-all"
                            placeholder="Ex: Olin Burgers"
                            value={form.name}
                            onChange={e => {
                                const val = e.target.value;
                                setForm({
                                    ...form,
                                    name: val,
                                    slug: val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                                });
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="restaurantSlug" className="text-sm font-bold text-gray-700 ml-1">Slug (Link da Loja)</label>
                        <div className="flex items-center bg-gray-50 rounded-xl px-4 border border-transparent focus-within:border-[#EA1D2C] focus-within:bg-white transition-all">
                            <span className="text-gray-400 text-sm">olindelivery.com/loja/</span>
                            <input
                                id="restaurantSlug"
                                name="restaurantSlug"
                                className="w-full p-4 bg-transparent border-none outline-none font-medium text-gray-800"
                                placeholder="olin-burgers"
                                value={form.slug}
                                onChange={e => setForm({ ...form, slug: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#EA1D2C] hover:bg-[#C51623] text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all text-lg mt-4"
                    >
                        {loading ? 'Enviando...' : 'Cadastrar Restaurante'}
                    </button>

                    <p className="text-xs text-center text-gray-400 mt-4">
                        Ao cadastrar, você concorda com nossos termos. Seu restaurante passará por uma análise antes de ir ao ar.
                    </p>
                </form>
            </div>
        </div>
    );
}
