
"use client";
import { useState, useEffect } from "react";

export default function GlobalConfigForm() {
    const [config, setConfig] = useState({
        headerImage: '',
        welcomeTitle: '',
        welcomeSubtitle: '',
        popularTitle: '',
        footerText: ''
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
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Personalização do App</h2>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Imagem do Logo (Header)</label>
                <input
                    value={config.headerImage}
                    onChange={e => setConfig({ ...config, headerImage: e.target.value })}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none"
                    placeholder="https://..."
                />
                <p className="text-xs text-gray-400 mt-1">Recomendado: Imagem PNG ou GIF transparente</p>
                {config.headerImage && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-xl flex justify-center">
                        <img src={config.headerImage} className="h-16 object-contain" />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Título de Boas Vindas</label>
                    <textarea
                        value={config.welcomeTitle}
                        onChange={e => setConfig({ ...config, welcomeTitle: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl h-32 focus:border-red-500 outline-none"
                        placeholder="Ex: O que vamos pedir hoje?"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subtítulo (Destaque Amarelo)</label>
                    <input
                        value={config.welcomeSubtitle}
                        onChange={e => setConfig({ ...config, welcomeSubtitle: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none"
                        placeholder="Ex: Entregar em Casa"
                    />
                    <label className="block text-sm font-bold text-gray-700 mt-4 mb-2">Texto do Rodapé</label>
                    <input
                        value={config.footerText}
                        onChange={e => setConfig({ ...config, footerText: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none"
                        placeholder="© 2025..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Título da Seção Principal</label>
                <input
                    value={config.popularTitle}
                    onChange={e => setConfig({ ...config, popularTitle: e.target.value })}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 outline-none"
                    placeholder="Ex: Populares"
                />
            </div>

            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all"
            >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
    );
}
