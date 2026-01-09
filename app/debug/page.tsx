"use client";

import { useState, useEffect } from "react";

export default function DebugPage() {
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/restaurants?all=true');
            const data = await res.json();
            setRestaurants(data);
            setError("");
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando restaurantes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <h2 className="text-red-800 font-bold text-lg mb-2">❌ Erro</h2>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchRestaurants}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            🔍 Debug: Restaurantes
                        </h1>
                        <button
                            onClick={fetchRestaurants}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                            🔄 Atualizar
                        </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Total de restaurantes:</strong> {restaurants.length}
                        </p>
                    </div>

                    {restaurants.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg">Nenhum restaurante encontrado</p>
                            <p className="text-sm mt-2">Cadastre um restaurante em /register</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {restaurants.map((restaurant, index) => (
                                <div
                                    key={restaurant.id || index}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 mb-2">
                                                {restaurant.name || "Sem nome"}
                                            </h3>
                                            <div className="space-y-1 text-sm">
                                                <p>
                                                    <span className="text-gray-500">ID:</span>{" "}
                                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                        {restaurant.id}
                                                    </code>
                                                </p>
                                                <p>
                                                    <span className="text-gray-500">Slug:</span>{" "}
                                                    <span className="font-mono">{restaurant.slug}</span>
                                                </p>
                                                <p>
                                                    <span className="text-gray-500">Aprovado:</span>{" "}
                                                    {restaurant.approved ? (
                                                        <span className="text-green-600 font-bold">✅ Sim</span>
                                                    ) : (
                                                        <span className="text-red-600 font-bold">❌ Não</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="bg-green-50 border border-green-200 rounded p-3">
                                                <p className="text-xs text-green-700 font-bold mb-1">📱 WhatsApp</p>
                                                {restaurant.whatsapp ? (
                                                    <p className="font-mono text-sm text-green-900">
                                                        {restaurant.whatsapp}
                                                    </p>
                                                ) : (
                                                    <p className="text-red-500 text-sm">❌ Não configurado</p>
                                                )}
                                            </div>

                                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                                <p className="text-xs text-blue-700 font-bold mb-1">☎️ Telefone</p>
                                                {restaurant.phone ? (
                                                    <p className="font-mono text-sm text-blue-900">
                                                        {restaurant.phone}
                                                    </p>
                                                ) : (
                                                    <p className="text-red-500 text-sm">❌ Não configurado</p>
                                                )}
                                            </div>

                                            {restaurant.email && (
                                                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                                                    <p className="text-xs text-gray-700 font-bold mb-1">📧 Email</p>
                                                    <p className="text-sm text-gray-900">{restaurant.email}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(!restaurant.whatsapp && !restaurant.phone) && (
                                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                                            <p className="text-yellow-800 text-sm">
                                                ⚠️ <strong>Atenção:</strong> Este restaurante não tem número de WhatsApp ou telefone configurado!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 border-t pt-6">
                        <h3 className="font-bold text-gray-700 mb-3">🔗 Links Úteis:</h3>
                        <div className="space-y-2 text-sm">
                            <a href="/test-whatsapp" className="block text-blue-600 hover:underline">
                                → Testar link do WhatsApp
                            </a>
                            <a href="/register" className="block text-blue-600 hover:underline">
                                → Cadastrar novo restaurante
                            </a>
                            <a href="/admin/super" className="block text-blue-600 hover:underline">
                                → Painel Super Admin
                            </a>
                            <a href="/" className="block text-blue-600 hover:underline">
                                → Voltar ao marketplace
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
