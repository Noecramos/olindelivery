"use client";

import { useState, useEffect } from "react";

export default function CategoryForm({ restaurantId, onSave }: { restaurantId: string, onSave: () => void }) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [categories, setCategories] = useState<any[]>([]);

    const fetchCategories = () => {
        fetch(`/api/categories?restaurantId=${restaurantId}`)
            .then(res => res.json())
            .then(data => setCategories(data || []))
            .catch(() => { });
    };

    // Initial fetch
    useEffect(() => {
        fetchCategories();
    }, [restaurantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                body: JSON.stringify({ restaurantId, name })
            });
            const data = await res.json();

            if (res.ok) {
                setName("");
                fetchCategories(); // Refresh local list
                onSave(); // Notify parent
            } else {
                alert(data.error || 'Erro ao salvar categoria');
            }
        } catch (err) {
            alert('Erro ao salvar categoria');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir esta categoria?')) return;
        try {
            await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            fetchCategories();
            onSave();
        } catch (e) {
            alert('Erro ao excluir');
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="flex gap-4 items-end mb-6">
                <div className="flex-1">
                    <label htmlFor="categoryDescription" className="text-xs font-semibold text-gray-500 uppercase ml-1">Nova Categoria</label>
                    <input
                        id="categoryDescription"
                        name="categoryName"
                        className="w-full p-3 bg-white rounded-xl border-2 border-gray-100 focus:border-red-500 outline-none transition-all"
                        placeholder="Ex: Pizzas Premium"
                        value={name}
                        onChange={e => setName(e.target.value)}
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

            {/* List of Categories */}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat: any) => (
                    <div key={cat.id} className="bg-white border border-gray-200 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                        <span className="font-bold text-gray-700 text-sm">{cat.name}</span>
                        <button
                            onClick={() => handleDelete(cat.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Excluir categoria"
                            type="button"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
