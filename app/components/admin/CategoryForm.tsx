"use client";

import { useState } from "react";

export default function CategoryForm({ restaurantId, onSave }: { restaurantId: string, onSave: () => void }) {
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/categories', {
                method: 'POST',
                body: JSON.stringify({ restaurantId, description })
            });
            setDescription("");
            onSave();
        } catch (err) {
            alert('Erro ao salvar categoria');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card p-4 flex gap-4 items-end">
            <div className="flex-1">
                <label htmlFor="categoryDescription" className="text-xs font-semibold text-gray-500 uppercase ml-1">Nova Categoria</label>
                <input
                    id="categoryDescription"
                    name="categoryDescription"
                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="Ex: Pizzas Premium"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
            </div>
            <button
                type="submit"
                className="px-6 py-3 bg-[#EA1D2C] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all"
                disabled={loading}
            >
                {loading ? '...' : '+ Adicionar'}
            </button>
        </form>
    );
}
