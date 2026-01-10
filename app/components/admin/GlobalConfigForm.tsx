
"use client";
import { useState, useEffect } from "react";

export default function GlobalConfigForm() {
    const [config, setConfig] = useState({
        headerImage: '',
        welcomeTitle: '',
        welcomeSubtitle: '',
        popularTitle: '',
        footerText: '',
        headerBgColor: '',
        headerBackgroundType: 'color',
        headerBackgroundImage: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setConfig(prev => ({ ...prev, ...data }));
            });
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch('/api/config', {
                method: 'POST',
                body: JSON.stringify(config)
            });
            alert('Configurações salvas!');
        } catch (e) {
            alert('Erro ao salvar');
        } finally {
            setLoading(false);
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

            {/* SEÇÃO 1: VISUAL DO HEADER */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                    🎨 Header & Identidade
                </h3>

                <div className="space-y-8">
                    {/* Logo Config */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Logo do App (URL)</label>
                            <input
                                value={config.headerImage}
                                onChange={e => setConfig({ ...config, headerImage: e.target.value })}
                                className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
                                placeholder="https://..."
                            />
                            <p className="text-xs text-gray-400 mt-2">✨ Recomendado: PNG transparente ou GIF animado</p>
                        </div>
                        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            {config.headerImage ? (
                                <img src={config.headerImage} className="h-16 object-contain" alt="Preview" />
                            ) : (
                                <span className="text-xs text-gray-400">Sem Logo</span>
                            )}
                        </div>
                    </div>

                    {/* Header Background Config */}
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
                                <input
                                    value={config.headerBackgroundImage}
                                    onChange={e => setConfig({ ...config, headerBackgroundImage: e.target.value })}
                                    className="w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
                                    placeholder="URL da Imagem de Fundo..."
                                />
                                {config.headerBackgroundImage && (
                                    <div className="h-32 rounded-xl bg-cover bg-center border-2 border-gray-100 shadow-inner" style={{ backgroundImage: `url('${config.headerBackgroundImage}')` }} />
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
