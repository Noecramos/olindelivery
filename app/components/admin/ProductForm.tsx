"use client";

import { useState, useEffect } from "react";
import { compressImage } from "@/lib/compress";

export default function ProductForm({ restaurantId, onSave, refreshCategories }: { restaurantId: string, onSave: () => void, refreshCategories?: number }) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

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

                        {/* Options JSON Editor */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="productOptions" className="text-xs font-semibold text-gray-500 uppercase ml-1">Opções (JSON Avançado)</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                                        onClick={() => setForm(prev => ({
                                            ...prev, options: JSON.stringify([
                                                {
                                                    "name": "Tamanho",
                                                    "type": "single",
                                                    "required": true,
                                                    "values": [
                                                        { "name": "Pequeno", "price": 0 },
                                                        { "name": "Médio", "price": 5 },
                                                        { "name": "Grande", "price": 10 }
                                                    ]
                                                }
                                            ], null, 2)
                                        }))}
                                    >
                                        Ex: Tamanhos
                                    </button>
                                    <button
                                        type="button"
                                        className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100"
                                        onClick={() => setForm(prev => ({
                                            ...prev, options: JSON.stringify([
                                                {
                                                    "name": "Cor",
                                                    "type": "single",
                                                    "required": true,
                                                    "values": [
                                                        { "name": "Preto", "price": 0 },
                                                        { "name": "Branco", "price": 0 },
                                                        { "name": "Vermelho", "price": 0 }
                                                    ]
                                                }
                                            ], null, 2)
                                        }))}
                                    >
                                        Ex: Cores
                                    </button>
                                    <button
                                        type="button"
                                        className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded hover:bg-orange-100"
                                        onClick={() => setForm(prev => ({
                                            ...prev, options: JSON.stringify([
                                                {
                                                    "name": "Tamanho",
                                                    "type": "single",
                                                    "required": true,
                                                    "values": [
                                                        { "name": "P (36-38)", "price": 0 },
                                                        { "name": "M (40-42)", "price": 0 },
                                                        { "name": "G (44-46)", "price": 0 }
                                                    ]
                                                },
                                                {
                                                    "name": "Cor",
                                                    "type": "single",
                                                    "required": true,
                                                    "values": [
                                                        { "name": "Preto", "price": 0 },
                                                        { "name": "Branco", "price": 0 },
                                                        { "name": "Cinza", "price": 0 }
                                                    ]
                                                }
                                            ], null, 2)
                                        }))}
                                    >
                                        Ex: Tam + Cor
                                    </button>
                                    <button
                                        type="button"
                                        className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100"
                                        onClick={() => setForm(prev => ({
                                            ...prev, options: JSON.stringify([
                                                {
                                                    "name": "Adicionais",
                                                    "type": "multiple",
                                                    "required": false,
                                                    "max": 3,
                                                    "values": [
                                                        { "name": "Bacon", "price": 3 },
                                                        { "name": "Queijo", "price": 2 }
                                                    ]
                                                }
                                            ], null, 2)
                                        }))}
                                    >
                                        Ex: Extras
                                    </button>
                                </div>
                            </div>
                            <textarea
                                id="productOptions"
                                name="productOptions"
                                className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-mono text-xs"
                                placeholder='[{ "name": "...", "values": [...] }]'
                                rows={6}
                                value={form.options}
                                onChange={e => setForm({ ...form, options: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Configure tamanhos e variáveis usando JSON.</p>
                        </div>

                        <button type="submit" className={`w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#EA1D2C] hover:bg-[#C51623]'}`} disabled={loading || uploading}>
                            {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Adicionar ao Cardápio'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Right Column: List */}
            <div className="w-full lg:w-2/3">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Produtos Cadastrados ({products.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map(prod => (
                        <div key={prod.id} className={`bg-white p-4 rounded-2xl border transition-all ${editingId === prod.id ? 'border-blue-500 ring-2 ring-blue-100 shadow-md transform scale-[1.02]' : 'border-gray-100 hover:shadow-md'}`}>
                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                    {prod.image ? (
                                        <img src={prod.image} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🍔</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-900 truncate">{prod.name}</h4>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(prod)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                                ✏️
                                            </button>
                                            <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{prod.description}</p>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="font-bold text-green-700">R$ {Number(prod.price).toFixed(2)}</span>
                                        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-600 font-medium">{prod.category}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            Nenhum produto cadastrado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
