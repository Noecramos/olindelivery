"use client";
import { useState, useEffect } from "react";
import { compressImage } from "@/lib/compress";

const ICONS = {
    '🍔': 'Hambúrguer',
    '🍕': 'Pizza',
    '🌭': 'Cachorro Quente',
    '🍟': 'Batata Frita',
    '🥤': 'Refrigerante',
    '🍦': 'Sorvete',
    '🍰': 'Sobremesa',
    '🥗': 'Salada',
    '🍣': 'Japonês',
    '🥪': 'Sanduíche',
    '🍗': 'Frango',
    '☕': 'Café',
    '🍺': 'Cerveja',
    '🍹': 'Drink',
    '🥡': 'Marmita',
    '🥩': 'Carne',
    '🥐': 'Padaria',
    '🥣': 'Açaí'
};

const COLORS = [
    { bg: 'bg-[#FFF4C3]', label: 'Amarelo' },
    { bg: 'bg-[#FFE4E6]', label: 'Rosa' },
    { bg: 'bg-[#D1FAE5]', label: 'Verde' },
    { bg: 'bg-[#DBEAFE]', label: 'Azul' },
    { bg: 'bg-[#F3E8FF]', label: 'Roxo' },
    { bg: 'bg-[#FFEDD5]', label: 'Laranja' },
    { bg: 'bg-white', label: 'Branco' },
];

export default function GlobalConfigForm() {
    const [config, setConfig] = useState({
        headerImage: '',
        welcomeTitle: '',
        welcomeSubtitle: '',
        popularTitle: '',
        footerText: '',
        headerBgColor: '',
        headerBackgroundType: 'color',
        headerBackgroundImage: '',
        featuredItems: [] as any[]
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    let parsedItems = [];
                    if (data.featuredItems) {
                        try {
                            parsedItems = typeof data.featuredItems === 'string' ? JSON.parse(data.featuredItems) : data.featuredItems;
                        } catch (e) {
                            console.error("Error parsing featuredItems", e);
                        }
                    }
                    setConfig(prev => ({ ...prev, ...data, featuredItems: parsedItems || [] }));
                }
            });
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...config,
                featuredItems: JSON.stringify(config.featuredItems)
            };

            await fetch('/api/config', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            alert('Configurações salvas!');
            window.location.reload();
        } catch (e) {
            alert('Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    const addFeaturedItem = () => {
        const newItem = {
            id: Date.now().toString(),
            name: 'Novo Item',
            price: 0,
            icon: '🍔',
            bg: 'bg-[#FFF4C3]',
            link: ''
        };
        setConfig(prev => ({
            ...prev,
            featuredItems: [...prev.featuredItems, newItem]
        }));
    };

    const updateFeaturedItem = (index: number, field: string, value: any) => {
        const newItems = [...config.featuredItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setConfig(prev => ({ ...prev, featuredItems: newItems }));
    };

    const removeFeaturedItem = (index: number) => {
        const newItems = config.featuredItems.filter((_, i) => i !== index);
        setConfig(prev => ({ ...prev, featuredItems: newItems }));
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);

        try {
            const originalFile = e.target.files[0];
            const compressedFile = await compressImage(originalFile);

            const formData = new FormData();
            formData.append("file", compressedFile);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });

            if (!res.ok) {
                if (res.status === 413) throw new Error("Arquivo muito grande mesmo após compressão");
                throw new Error("Erro no envio");
            }

            const data = await res.json();
            if (data.success) {
                setConfig(prev => ({ ...prev, [field]: data.url }));
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao fazer upload. Tente uma imagem menor.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Personalização do App</h2>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    Modo Editor
                </div>
            </div>

            {/* SEÇÃO 0: LOGO & SPLASH */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                    🚀 Logo & Splash Screen
                </h3>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Logo Principal</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors bg-white relative">
                            <input type="file" id="logo-upload" accept="image/*" onChange={(e) => handleUpload(e, 'headerImage')} className="hidden" />
                            <label htmlFor="logo-upload" className="cursor-pointer block">
                                {config.headerImage ? (
                                    <div className="relative h-40 w-full flex items-center justify-center bg-gray-50 rounded-lg p-2">
                                        <img src={config.headerImage} alt="Logo" className="max-h-full max-w-full object-contain" />
                                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg font-bold text-sm">
                                            Trocar Logo
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10">
                                        <div className="text-4xl mb-2">📸</div>
                                        <p className="text-sm text-gray-500">Adicionar Logo</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                    <div className="w-full md:w-2/3">
                        <div className="bg-yellow-50 p-4 rounded-xl text-xs text-yellow-800 mb-4">
                            Esta logo aparecerá na tela de carregamento (Splash Screen) ao abrir o app.
                        </div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">URL da Logo (Opcional)</label>
                        <input
                            value={config.headerImage}
                            onChange={e => setConfig({ ...config, headerImage: e.target.value })}
                            className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </div>

            {/* SEÇÃO 1: VISUAL DO HEADER */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                    🎨 Header & Identidade
                </h3>

                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Fundo do Header</label>
                        <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-xl w-fit">
                            <button
                                onClick={() => setConfig({ ...config, headerBackgroundType: 'color' })}
                                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${config.headerBackgroundType === 'color' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Cor Sólida
                            </button>
                            <button
                                onClick={() => setConfig({ ...config, headerBackgroundType: 'image' })}
                                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${config.headerBackgroundType === 'image' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Imagem
                            </button>
                        </div>

                        {config.headerBackgroundType === 'image' ? (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex gap-2">
                                    <input
                                        value={config.headerBackgroundImage}
                                        onChange={e => setConfig({ ...config, headerBackgroundImage: e.target.value })}
                                        className="flex-1 p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
                                        placeholder="URL da Imagem de Fundo..."
                                    />
                                    <div>
                                        <input type="file" id="bg-upload" accept="image/*" onChange={(e) => handleUpload(e, 'headerBackgroundImage')} className="hidden" />
                                        <label htmlFor="bg-upload" className="cursor-pointer bg-gray-900 text-white px-4 py-3.5 rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2 whitespace-nowrap">
                                            {uploading ? '...' : '☁️ Upload'}
                                        </label>
                                    </div>
                                </div>
                                {config.headerBackgroundImage && (
                                    <div className="h-32 rounded-xl bg-cover bg-center border-2 border-gray-100 shadow-inner relative group" style={{ backgroundImage: `url('${config.headerBackgroundImage}')` }}>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 animate-fade-in">
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={config.headerBgColor || '#FFD700'}
                                        onChange={e => setConfig({ ...config, headerBgColor: e.target.value })}
                                        className="h-12 w-12 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                                    />
                                    <div className="absolute inset-0 rounded-lg border border-gray-200 pointer-events-none" />
                                </div>
                                <input
                                    value={config.headerBgColor}
                                    onChange={e => setConfig({ ...config, headerBgColor: e.target.value })}
                                    className="w-32 p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none transition-colors font-mono text-sm uppercase"
                                    placeholder="#FFD700"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: TEXTOS E LABELS */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                    ✍️ Textos do App
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Título Principal (Boas Vindas)</label>
                        <textarea
                            value={config.welcomeTitle}
                            onChange={e => setConfig({ ...config, welcomeTitle: e.target.value })}
                            className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl h-32 focus:border-gray-900 outline-none resize-none transition-colors"
                            placeholder="Ex: O que vamos pedir hoje?"
                        />
                    </div>
                    <div className="col-span-1 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Subtítulo (Destaque)</label>
                            <input
                                value={config.welcomeSubtitle}
                                onChange={e => setConfig({ ...config, welcomeSubtitle: e.target.value })}
                                className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
                                placeholder="Ex: Entregar em Casa"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Título da Seção "Populares"</label>
                            <input
                                value={config.popularTitle}
                                onChange={e => setConfig({ ...config, popularTitle: e.target.value })}
                                className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
                                placeholder="Ex: Populares"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Rodapé (Copyright)</label>
                        <input
                            value={config.footerText}
                            onChange={e => setConfig({ ...config, footerText: e.target.value })}
                            className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
                            placeholder="© 2025 OlindAki Delivery..."
                        />
                    </div>
                </div>
            </div>

            {/* SEÇÃO 3: ITENS POPULARES */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100 justify-between">
                    <span>⭐ Itens em Destaque</span>
                    <button
                        onClick={addFeaturedItem}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors flex items-center gap-2"
                    >
                        + Adicionar Card
                    </button>
                </h3>

                <div className="grid grid-cols-1 gap-6">
                    {config.featuredItems.map((item, index) => (
                        <div key={item.id || index} className="border border-gray-200 rounded-2xl p-6 bg-gray-50 flex flex-col md:flex-row gap-6 relative group">
                            <button
                                onClick={() => removeFeaturedItem(index)}
                                className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                title="Remover item"
                            >
                                🗑️
                            </button>
                            <div className="flex-shrink-0 flex items-center justify-center pt-2 md:pt-0">
                                <div className={`${item.bg} w-[200px] h-[90px] p-4 rounded-3xl flex items-center justify-between gap-3 shadow-md border border-black/5 transform scale-90 md:scale-100 origin-left`}>
                                    <div className="text-3xl drop-shadow-sm">{item.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 text-xs truncate">{item.name || 'Nome do Item'}</h3>
                                        <p className="text-gray-900 font-bold text-sm mt-0.5">R$ {Number(item.price).toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-gray-400">
                                        &gt;
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nome do Produto</label>
                                    <input
                                        value={item.name}
                                        onChange={e => updateFeaturedItem(index, 'name', e.target.value)}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:border-gray-900 outline-none text-sm"
                                        placeholder="Ex: Pizza Calabresa"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Preço (R$)</label>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={e => updateFeaturedItem(index, 'price', parseFloat(e.target.value))}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:border-gray-900 outline-none text-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Link do Restaurante (Slug)</label>
                                    <input
                                        value={item.link}
                                        onChange={e => updateFeaturedItem(index, 'link', e.target.value)}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:border-gray-900 outline-none text-sm font-mono text-gray-600"
                                        placeholder="Ex: /loja/olin-burgers"
                                    />
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-full md:w-48 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Ícone</label>
                                    <select
                                        value={item.icon}
                                        onChange={e => updateFeaturedItem(index, 'icon', e.target.value)}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:border-gray-900 outline-none text-xl"
                                    >
                                        {Object.entries(ICONS).map(([icon, label]) => (
                                            <option key={icon} value={icon}>{icon} {label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Cor de Fundo</label>
                                    <div className="flex flex-wrap gap-2">
                                        {COLORS.map(c => (
                                            <button
                                                key={c.bg}
                                                onClick={() => updateFeaturedItem(index, 'bg', c.bg)}
                                                className={`w-6 h-6 rounded-full border border-gray-200 shadow-sm ${c.bg} ${item.bg === c.bg ? 'ring-2 ring-gray-900 scale-110' : ''}`}
                                                title={c.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {config.featuredItems.length === 0 && (
                        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            Nenhum item em destaque. Adicione um para começar.
                        </div>
                    )}
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="sticky bottom-4">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>Wait...</>
                    ) : (
                        <>
                            <span>Salvar Alterações Globais</span>
                            <span>→</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
