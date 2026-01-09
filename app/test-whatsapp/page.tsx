"use client";

import { useState } from "react";

export default function TestWhatsAppPage() {
    const [restaurantId, setRestaurantId] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [restaurantData, setRestaurantData] = useState<any>(null);

    const generateTestLink = async () => {
        if (!restaurantId) {
            alert("Por favor, insira um ID de restaurante");
            return;
        }

        setLoading(true);
        try {
            // Fetch restaurant data
            const res = await fetch(`/api/restaurants?id=${restaurantId}`);
            const restData = await res.json();
            setRestaurantData(restData);

            // Use whatsapp field first, then phone
            const restaurantPhone = restData.whatsapp || restData.phone || "5581995515777";

            // Test order data
            const message = `*Novo Pedido #TEST123*\n\n` +
                `*Cliente:* João Silva\n` +
                `*Endereço:* Rua Teste, 123\n\n` +
                `*Pedido:*\n2x Hambúrguer\n1x Refrigerante\n\n` +
                `*Total:* R$ 45,00\n` +
                `*Pagamento:* PIX\n\n` +
                `_Enviado via OlinDelivery_`;

            // Sanitize and format phone
            const cleanPhone = restaurantPhone.replace(/\D/g, '');
            const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

            const link = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;

            setGeneratedLink(link);
        } catch (error) {
            console.error(error);
            alert("Erro ao gerar link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 Teste de Link WhatsApp</h1>

                    <div className="space-y-6">
                        {/* Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                ID do Restaurante
                            </label>
                            <input
                                type="text"
                                value={restaurantId}
                                onChange={(e) => setRestaurantId(e.target.value)}
                                placeholder="Cole o ID do restaurante aqui"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Você pode encontrar o ID em /api/debug-restaurants
                            </p>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateTestLink}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            {loading ? "Gerando..." : "Gerar Link de Teste"}
                        </button>

                        {/* Restaurant Data */}
                        {restaurantData && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-bold text-blue-900 mb-2">📊 Dados do Restaurante:</h3>
                                <div className="space-y-1 text-sm">
                                    <p><strong>Nome:</strong> {restaurantData.name}</p>
                                    <p><strong>WhatsApp:</strong> {restaurantData.whatsapp || "❌ Não configurado"}</p>
                                    <p><strong>Phone:</strong> {restaurantData.phone || "❌ Não configurado"}</p>
                                    <p><strong>Aprovado:</strong> {restaurantData.approved ? "✅ Sim" : "❌ Não"}</p>
                                </div>
                            </div>
                        )}

                        {/* Generated Link */}
                        {generatedLink && (
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h3 className="font-bold text-green-900 mb-2">✅ Link Gerado:</h3>
                                    <div className="bg-white p-3 rounded border border-green-300 break-all text-sm font-mono">
                                        {generatedLink}
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedLink);
                                            alert("Link copiado!");
                                        }}
                                        className="mt-2 text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    >
                                        📋 Copiar Link
                                    </button>
                                </div>

                                {/* Test Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a
                                        href={generatedLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-center bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-lg transition-colors"
                                    >
                                        🔗 Abrir em Nova Aba
                                    </a>

                                    <button
                                        onClick={() => window.location.href = generatedLink}
                                        className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-lg transition-colors"
                                    >
                                        📱 Abrir Direto (iOS)
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-bold text-yellow-900 mb-2">💡 Como Testar:</h3>
                                    <ul className="text-sm space-y-1 text-yellow-800">
                                        <li>• <strong>Desktop:</strong> Use "Abrir em Nova Aba"</li>
                                        <li>• <strong>iPhone:</strong> Use "Abrir Direto (iOS)" - deve abrir WhatsApp</li>
                                        <li>• <strong>Se não funcionar:</strong> Copie o link e cole no Safari</li>
                                        <li>• <strong>Verifique:</strong> WhatsApp está instalado?</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Quick Access */}
                        <div className="border-t pt-6">
                            <h3 className="font-bold text-gray-700 mb-3">🔗 Links Úteis:</h3>
                            <div className="space-y-2">
                                <a
                                    href="/api/debug-restaurants"
                                    target="_blank"
                                    className="block text-blue-600 hover:underline text-sm"
                                >
                                    → Ver todos os restaurantes e seus números
                                </a>
                                <a
                                    href="/"
                                    className="block text-blue-600 hover:underline text-sm"
                                >
                                    → Voltar para o marketplace
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
