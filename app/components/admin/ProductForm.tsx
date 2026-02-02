"use client";

import { useState, useEffect } from "react";
import { compressImage } from "@/lib/compress";
import OptionsBuilder from "./OptionsBuilder";

export default function ProductForm({ restaurantId, onSave, refreshCategories }: { restaurantId: string, onSave: () => void, refreshCategories?: number }) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    // Initial Form State
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        image: "",
        options: "" // JSON String
    });

    // Fetch Data
    const fetchData = async () => {
        // Fetch Categories
        fetch(`/api/categories?restaurantId=${restaurantId}`)
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                // Default category if creating new
                if (data.length > 0 && !form.categoryId && !editingId) {
                    setForm(prev => ({ ...prev, categoryId: data[0].id }));
                }
            });

        // Fetch Products
        fetch(`/api/products?restaurantId=${restaurantId}`)
            .then(res => res.json())
            .then(data => setProducts(data || []));
    };

    useEffect(() => {
        fetchData();
    }, [restaurantId, refreshCategories]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        try {
            const compressed = await compressImage(e.target.files[0]);
            const formData = new FormData();
            formData.append("file", compressed);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });

            if (!res.ok) {
                if (res.status === 413) throw new Error("413");
                throw new Error("Erro");
            }

            const data = await res.json();
            if (data.success) setForm({ ...form, image: data.url });
        } catch (err: any) {
            if (err.message === "413") alert("Imagem muito grande mesmo comprimida!");
            else alert("Erro ao fazer upload");
        } finally { setUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const url = editingId ? '/api/products' : '/api/products';
        const method = editingId ? 'PUT' : 'POST';

        // Find category name from ID
        const selectedCat = categories.find(c => c.id === form.categoryId);
        const categoryName = selectedCat ? selectedCat.name : "Geral";

        let parsedOptions = [];
        try {
            if (form.options && form.options.trim()) {
                parsedOptions = JSON.parse(form.options);
            }
        } catch (e) {
            alert("Erro no JSON de Opções. Verifique a formatação.");
            setLoading(false);
            return;
        }

        const body: any = {
            ...form,
            restaurantId,
            price: parseFloat(form.price),
            category: categoryName,
            options: parsedOptions
        };
        if (editingId) body.id = editingId;

        try {
            const res = await fetch(url, {
                method: method,
                body: JSON.stringify(body)
            });

            if (res.ok) {
                // Reset
                setForm({ ...form, name: "", description: "", price: "", image: "", options: "" });
                setEditingId(null);
                fetchData(); // Refresh list
                onSave();
                alert('Produto salvo com sucesso!');
            } else {
                alert('Erro ao salvar');
            }
        } catch (err) { alert('Erro na conexão'); }
        finally { setLoading(false); }
    };

    const handleEdit = (prod: any) => {
        setEditingId(prod.id);

        // Find ID from category name
        const foundCat = categories.find(c => c.name === prod.category);
        const catId = foundCat ? foundCat.id : (categories.length > 0 ? categories[0].id : "");

        setForm({
            name: prod.name,
            description: prod.description || "",
            price: prod.price,
            categoryId: catId,
            image: prod.image || "",
            options: prod.options ? JSON.stringify(prod.options, null, 2) : ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm({ ...form, name: "", description: "", price: "", image: "", options: "" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este produto?')) return;
        try {
            await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            fetchData();
        } catch (e) { alert('Erro ao excluir'); }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Form */}
            <div className="w-full lg:w-1/3">
                <form onSubmit={handleSubmit} className="card p-6 sticky top-4 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
                        {editingId && (
                            <button type="button" onClick={handleCancel} className="text-xs text-red-500 font-bold hover:underline">
                                Cancelar
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Image Upload Area */}
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors bg-white">
                            <input type="file" id="prod-img" name="image" accept="image/*" onChange={handleUpload} className="hidden" />
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
                            <label htmlFor="productName" className="text-xs font-semibold text-gray-500 uppercase ml-1">Nome do Produto</label>
                            <input
                                id="productName"
                                name="productName"
                                className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                                placeholder="Ex: X-Bacon Supremo"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label htmlFor="productPrice" className="text-xs font-semibold text-gray-500 uppercase ml-1">Preço (R$)</label>
                                <input
                                    id="productPrice"
                                    name="productPrice"
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                                    placeholder="0,00"
                                    type="number" step="0.01"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="productCategory" className="text-xs font-semibold text-gray-500 uppercase ml-1">Categoria</label>
                                <select
                                    id="productCategory"
                                    name="productCategory"
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none"
                                    value={form.categoryId}
                                    onChange={e => setForm({ ...form, categoryId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Selecione...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="productDescription" className="text-xs font-semibold text-gray-500 uppercase ml-1">Descrição</label>
                            <textarea
                                id="productDescription"
                                name="productDescription"
                                className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all"
                                placeholder="Ingredientes, detalhes, etc."
                                rows={3}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        {/* Options UI Builder */}
                        <div>
                            <OptionsBuilder
                                initialOptions={form.options}
                                onChange={(json) => setForm({ ...form, options: json })}
                            />
                        </div>

                        <button type="submit" className={`w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#EA1D2C] hover:bg-[#C51623]'}`} disabled={loading || uploading}>
                            {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Adicionar ao Cardápio'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Right Column: List */}
            <div className="w-full lg:w-2/3">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 text-lg">Catálogo de Produtos ({products.length})</h3>
                    <button
                        onClick={() => {
                            if (expandedCategories.length === categories.length) setExpandedCategories([]);
                            else setExpandedCategories(categories.map(c => c.name));
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline"
                    >
                        {expandedCategories.length === categories.length ? 'Recolher Tudo' : 'Expandir Tudo'}
                    </button>
                </div>

                <div className="space-y-4">
                    {categories.map(cat => {
                        const catProducts = products.filter(p => p.category === cat.name);
                        const isExpanded = expandedCategories.includes(cat.name);

                        return (
                            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                {/* Category Header */}
                                <button
                                    onClick={() => setExpandedCategories(prev =>
                                        prev.includes(cat.name) ? prev.filter(c => c !== cat.name) : [...prev, cat.name]
                                    )}
                                    className="w-full p-4 flex justify-between items-center bg-gray-50/50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{isExpanded ? '📂' : '📁'}</span>
                                        <div className="text-left">
                                            <h4 className="font-bold text-gray-800">{cat.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{catProducts.length} Produtos</p>
                                        </div>
                                    </div>
                                    <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>

                                {/* Products inside Category */}
                                {isExpanded && (
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                        {catProducts.map(prod => (
                                            <div key={prod.id} className={`p-4 rounded-xl border transition-all ${editingId === prod.id ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30' : 'border-gray-50 hover:border-gray-200 hover:shadow-sm'}`}>
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                                        {prod.image ? (
                                                            <img src={prod.image} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xl">🍔</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-bold text-sm text-gray-900 truncate">{prod.name}</h4>
                                                            <div className="flex gap-1">
                                                                <button onClick={() => handleEdit(prod)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                                                                    ✏️
                                                                </button>
                                                                <button onClick={() => handleDelete(prod.id)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors" title="Excluir">
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{prod.description}</p>
                                                        <div className="mt-2 flex justify-between items-center">
                                                            <span className="font-bold text-green-700 text-sm">R$ {Number(prod.price).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {catProducts.length === 0 && (
                                            <div className="col-span-full py-6 text-center text-gray-400 text-xs italic">
                                                Nenhum produto nesta categoria.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {products.length === 0 && (
                        <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            Nenhum produto cadastrado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
