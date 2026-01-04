"use client";

import { useState, useEffect } from "react";

export default function ProductForm({ restaurantId, onSave }: { restaurantId: string, onSave: () => void }) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Initial Form State
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        image: ""
    });

    useEffect(() => {
        // Fetch Categories for Dropdown
        fetch(`/api/categories?restaurantId=${restaurantId}`)
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                if (data.length > 0) setForm(prev => ({ ...prev, categoryId: data[0].id }));
            });
    }, [restaurantId]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) setForm({ ...form, image: data.url });
        } catch (err) { alert("Erro ao fazer upload"); }
        finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/products', {
                method: 'POST',
                body: JSON.stringify({ ...form, restaurantId, price: parseFloat(form.price) })
            });
            setForm({ ...form, name: "", description: "", price: "", image: "" }); // Reset some fields
            onSave();
        } catch (err) { alert('Error saving product'); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="card p-6 max-w-2xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Novo Produto</h3>
            </div>

            <div className="space-y-4">
                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors bg-white">
                    <input type="file" id="prod-img" accept="image/*" onChange={handleUpload} className="hidden" />
                    <label htmlFor="prod-img" className="cursor-pointer block">
                        {form.image ? (
                            <div className="relative h-40 w-full">
                                <img src={form.image} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs py-1 rounded-b-lg">Trocar Imagem</div>
                            </div>
                        ) : (
                            <div className="py-8">
                                <div className="text-4xl mb-2">📸</div>
                                <p className="text-sm text-gray-500">{uploading ? "Enviando..." : "Toque para adicionar foto"}</p>
                            </div>
                        )}
                    </label>
                </div>

                {/* Input Fields */}
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Nome do Produto</label>
                    <input
                        className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                        placeholder="Ex: X-Bacon Supremo"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Preço (R$)</label>
                        <input
                            className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                            placeholder="0,00"
                            type="number" step="0.01"
                            value={form.price}
                            onChange={e => setForm({ ...form, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Categoria</label>
                        <select
                            className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none"
                            value={form.categoryId}
                            onChange={e => setForm({ ...form, categoryId: e.target.value })}
                            required
                        >
                            <option value="" disabled>Selecione...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.description}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Descrição</label>
                    <textarea
                        className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                        placeholder="Ingredientes, detalhes, etc."
                        rows={3}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <button type="submit" className="w-full py-4 bg-[#EA1D2C] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all" disabled={loading || uploading}>
                    {loading ? 'Salvando...' : 'Adicionar ao Cardápio'}
                </button>
            </div>
        </form>
    );
}
