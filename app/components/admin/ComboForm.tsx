"use client";

import { useState, useEffect } from "react";

interface ComboItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
}

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    isCombo?: boolean;
    image?: string;
    comboItems?: ComboItem[];
    description?: string;
}

export default function ComboForm({ restaurantId, onSave }: { restaurantId: string, onSave: () => void }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [combos, setCombos] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [comboName, setComboName] = useState('');
    const [comboPrice, setComboPrice] = useState('');
    const [comboCategory, setComboCategory] = useState('');
    const [comboDescription, setComboDescription] = useState('');
    const [comboImage, setComboImage] = useState('');
    const [selectedItems, setSelectedItems] = useState<ComboItem[]>([]);

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [restaurantId]);

    const fetchData = async () => {
        try {
            // Fetch Products & Combos
            const res = await fetch(`/api/products?restaurantId=${restaurantId}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.filter((p: any) => !p.isCombo));
                setCombos(data.filter((p: any) => p.isCombo));
            }

            // Fetch Categories
            const catRes = await fetch(`/api/categories?restaurantId=${restaurantId}`);
            if (catRes.ok) {
                const catData = await catRes.json();
                setCategories(catData.map((c: any) => c.name));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) {
                setComboImage(data.url);
            } else {
                alert('Erro no upload da imagem');
            }
        } catch (error) {
            alert('Erro no upload');
        } finally {
            setUploading(false);
        }
    };

    const addProduct = (product: Product) => {
        const existing = selectedItems.find(item => item.productId === product.id);
        if (existing) {
            setSelectedItems(selectedItems.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setSelectedItems([...selectedItems, {
                productId: product.id,
                name: product.name,
                quantity: 1,
                price: product.price
            }]);
        }
    };

    const removeProduct = (productId: string) => {
        setSelectedItems(selectedItems.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeProduct(productId);
            return;
        }
        setSelectedItems(selectedItems.map(item =>
            item.productId === productId
                ? { ...item, quantity }
                : item
        ));
    };

    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateSavings = () => {
        const total = calculateTotal();
        const comboVal = parseFloat(comboPrice) || 0;
        return total - comboVal;
    };

    const calculateSavingsPercent = () => {
        const total = calculateTotal();
        if (total === 0) return 0;
        const savings = calculateSavings();
        return (savings / total) * 100;
    };

    const handleEdit = (combo: Product) => {
        setEditingId(combo.id);
        setComboName(combo.name);
        setComboPrice(combo.price.toString());
        setComboCategory(combo.category);
        setComboDescription(combo.description || '');
        setComboImage(combo.image || '');
        setSelectedItems(combo.comboItems || []);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setComboName('');
        setComboPrice('');
        setComboCategory('');
        setComboDescription('');
        setComboImage('');
        setSelectedItems([]);
    };

    const handleSave = async () => {
        if (!comboName || !comboPrice || !comboCategory) {
            alert('Preencha nome, preço e categoria do combo');
            return;
        }

        if (selectedItems.length < 2) {
            alert('Um combo deve ter pelo menos 2 produtos');
            return;
        }

        setSaving(true);
        try {
            const method = editingId ? 'PUT' : 'POST';
            const body: any = {
                restaurantId,
                name: comboName,
                price: parseFloat(comboPrice),
                category: comboCategory,
                description: comboDescription,
                image: comboImage,
                is_combo: true,
                combo_items: selectedItems
            };

            if (editingId) {
                body.id = editingId;
            }

            const res = await fetch('/api/products', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert(editingId ? '✅ Combo atualizado com sucesso!' : '✅ Combo criado com sucesso!');
                handleCancel();
                fetchData();
                onSave();
            } else {
                alert('Erro ao salvar combo');
            }
        } catch (error) {
            alert('Erro ao salvar combo');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCombo = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este combo?')) return;
        try {
            await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            fetchData();
        } catch (e) {
            alert('Erro ao excluir');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Form */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">
                        {editingId ? 'Editar Combo' : 'Criar Novo Combo'}
                    </h3>
                    {editingId && (
                        <button
                            onClick={handleCancel}
                            className="text-sm text-red-600 font-bold hover:underline"
                        >
                            Cancelar Edição
                        </button>
                    )}
                </div>

                {/* Combo Basic Info */}
                <div className={`space-y-4 bg-white p-6 rounded-2xl border shadow-sm ${editingId ? 'border-orange-200 ring-2 ring-orange-50' : 'border-gray-100'}`}>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Combo</label>
                        <input
                            type="text"
                            value={comboName}
                            onChange={e => setComboName(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none transition-all"
                            placeholder="Ex: Combo Família"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Preço (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={comboPrice}
                                onChange={e => setComboPrice(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none transition-all"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                            <select
                                value={comboCategory}
                                onChange={e => setComboCategory(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none transition-all"
                            >
                                <option value="">Selecione...</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Imagem</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                        />
                        {comboImage && <p className="text-xs text-green-600 mt-1">✓ Imagem carregada</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                        <textarea
                            value={comboDescription}
                            onChange={e => setComboDescription(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-red-500 outline-none transition-all"
                            rows={2}
                            placeholder="Descreva o combo..."
                        />
                    </div>
                </div>

                {/* Product Selection */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Adicionar Produtos</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                        {products.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addProduct(product)}
                                className="p-2 bg-gray-50 border border-gray-100 rounded-lg hover:border-red-500 hover:shadow-sm transition-all text-left group"
                            >
                                <div className="font-bold text-gray-800 text-xs truncate group-hover:text-red-600">{product.name}</div>
                                <div className="text-xs font-bold text-gray-500">R$ {Number(product.price).toFixed(2)}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Preview & List */}
            <div className="space-y-6">
                {/* Current Combo Preview */}
                <div className={`p-6 rounded-2xl border shadow-sm h-fit sticky top-4 transition-all ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                    <h4 className={`text-sm font-bold mb-4 uppercase tracking-wider ${editingId ? 'text-orange-900' : 'text-blue-900'}`}>
                        {editingId ? 'Editando Combo' : 'Resumo do Novo Combo'}
                    </h4>

                    {selectedItems.length === 0 ? (
                        <p className={`text-center py-8 text-sm ${editingId ? 'text-orange-400' : 'text-blue-300'}`}>
                            Selecione produtos para começar
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {selectedItems.map(item => (
                                <div key={item.productId} className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-white rounded-lg px-1 border border-blue-100">
                                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-6 h-6 hover:bg-gray-100 rounded font-bold">-</button>
                                            <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-6 h-6 hover:bg-gray-100 rounded font-bold">+</button>
                                        </div>
                                        <span className="text-sm font-medium text-gray-800 truncate w-32">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-600">
                                            R$ {(item.price * item.quantity).toFixed(2)}
                                        </span>
                                        <button onClick={() => removeProduct(item.productId)} className="text-red-400 hover:text-red-600">×</button>
                                    </div>
                                </div>
                            ))}

                            <hr className={`my-4 ${editingId ? 'border-orange-200' : 'border-blue-200'}`} />

                            <div className="space-y-1 text-sm">
                                <div className={`flex justify-between ${editingId ? 'text-orange-800/70' : 'text-blue-800/70'}`}>
                                    <span>Valor Itens:</span>
                                    <span className="font-bold">R$ {calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className={`flex justify-between text-lg ${editingId ? 'text-orange-900' : 'text-blue-900'}`}>
                                    <span className="font-bold">Preço Combo:</span>
                                    <span className="font-black text-red-600">R$ {(parseFloat(comboPrice) || 0).toFixed(2)}</span>
                                </div>
                                {calculateSavings() > 0 && (
                                    <div className="flex justify-between text-green-700 bg-green-100 p-2 rounded-lg mt-2">
                                        <span className="font-bold">Economia:</span>
                                        <span className="font-bold">
                                            R$ {calculateSavings().toFixed(2)} ({calculateSavingsPercent().toFixed(0)}%)
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving || selectedItems.length < 2}
                                className={`w-full mt-4 py-3 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#EA1D2C] hover:bg-[#C51623]'}`}
                            >
                                {saving ? 'Salvando...' : editingId ? '💾 Salvar Alterações' : '💾 Finalizar Combo'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Existing Combos List */}
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4">Combos Cadastrados ({combos.length})</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {combos.map(combo => (
                            <div key={combo.id} className={`bg-white p-4 rounded-xl border transition-all flex gap-4 ${editingId === combo.id ? 'border-orange-300 ring-2 ring-orange-100 shadow-md transform scale-[1.01]' : 'border-gray-100 hover:shadow-md'}`}>
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                    {combo.image ? (
                                        <img src={combo.image} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">🎁</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-900 truncate">{combo.name}</h4>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(combo)}
                                                className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCombo(combo.id)}
                                                className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-1">{combo.description || 'Sem descrição'}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="font-bold text-green-700 text-sm">R$ {Number(combo.price).toFixed(2)}</span>
                                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">COMBO</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {combos.length === 0 && (
                            <div className="text-center text-gray-400 py-4 text-sm">Nenhum combo cadastrado.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
