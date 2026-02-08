
"use client";

import { useEffect, useState } from "react";

interface Plan {
    id: number;
    name: string;
    duration_months: number;
    discount_percent: number;
    active: boolean;
}

interface SubscriptionManagerProps {
    restaurant: any;
}

export default function SubscriptionManager({ restaurant }: SubscriptionManagerProps) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [globalConfig, setGlobalConfig] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");
    const [pixData, setPixData] = useState<{ encodedImage: string, payload: string, expirationDate: string } | null>(null);
    const [selectedBilling, setSelectedBilling] = useState<"BOLETO" | "PIX" | "CREDIT_CARD">("PIX");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plansRes, configRes] = await Promise.all([
                    fetch('/api/saas-plans'),
                    fetch('/api/config')
                ]);

                const plansData = await plansRes.json();
                const configData = await configRes.json();

                setPlans(plansData.filter((p: any) => p.active));
                setGlobalConfig(configData);
            } catch (err) {
                console.error("Error loading subscription data", err);
            } finally {
                setPageLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubscribe = async (plan: Plan) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/subscription/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantId: restaurant.id,
                    planId: plan.id,
                    billingType: selectedBilling
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create subscription");
            }

            if (data.pix) {
                setPixData(data.pix);
            } else if (data.invoiceUrl) {
                window.open(data.invoiceUrl, "_blank");
            } else {
                alert("Assinatura criada! Verifique seu email para pagamento.");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = (plan: Plan) => {
        // Use store specific price -> Global config price -> Hardcoded fallback
        const basePrice = parseFloat(restaurant.saasMonthlyPrice || restaurant.saas_monthly_price || globalConfig?.saasMonthlyPrice) || 49.90;
        const monthlyPrice = basePrice * (1 - plan.discount_percent / 100);
        return monthlyPrice;
    };

    if (pageLoading) return <div className="text-center py-20 font-bold text-gray-400">Carregando planos...</div>;

    if (pixData) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Pagamento via PIX</h3>

                    <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        {/* Ensure the base64 string doesn't have spaces/newlines and has the prefix */}
                        <img
                            src={pixData.encodedImage.startsWith('data:') ? pixData.encodedImage : `data:image/png;base64,${pixData.encodedImage.trim()}`}
                            alt="QR Code Pix"
                            className="w-64 h-64 object-contain"
                        />
                    </div>

                    <p className="text-sm text-gray-500 mb-4 font-medium max-w-md">
                        Escaneie o QR Code acima com o app do seu banco ou use o código Copia e Cola abaixo:
                    </p>

                    <div className="w-full max-w-md mb-6">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={pixData.payload}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 font-mono"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(pixData.payload);
                                    alert("Código copiado!");
                                }}
                                className="px-4 py-2 bg-black text-white rounded-xl font-bold text-sm whitespace-nowrap hover:bg-gray-800"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setPixData(null)}
                        className="text-gray-400 font-medium hover:text-gray-900 transition-colors"
                    >
                        Voltar / Fechar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-2">Sua Assinatura</h3>

                <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-tight ${restaurant.subscription_status === 'active' ? 'bg-green-50 text-green-600' :
                        restaurant.subscription_status === 'overdue' ? 'bg-red-50 text-red-600' :
                            restaurant.subscription_status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                                'bg-gray-50 text-gray-500'
                        }`}>
                        Status: {
                            restaurant.subscription_status === 'active' ? 'Ativo' :
                                restaurant.subscription_status === 'overdue' ? 'Vencido' :
                                    restaurant.subscription_status === 'pending' ? 'Pendente' :
                                        'Gratuito / Trial'
                        }
                    </div>

                    <div className="text-gray-900 font-bold text-sm flex items-center gap-2">
                        <span className="text-gray-400 uppercase text-[10px] tracking-widest">Vencimento:</span>
                        {(() => {
                            if (restaurant.subscription_expires_at) {
                                return new Date(restaurant.subscription_expires_at).toLocaleDateString();
                            }
                            const baseDate = new Date(restaurant.createdAt || restaurant.created_at || Date.now());
                            if (isNaN(baseDate.getTime())) return '---';
                            const trialDays = parseInt(restaurant.saasTrialDays || restaurant.saas_trial_days) || 7;
                            const expiryDate = new Date(baseDate);
                            expiryDate.setDate(baseDate.getDate() + trialDays);
                            return expiryDate.toLocaleDateString();
                        })()}
                    </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-3xl">
                    <p className="text-gray-600 font-medium">
                        Aproveite todas as funcionalidades do Zappy, incluindo agendamentos ilimitados, gestão de pedidos e gestão de estoque completa.
                    </p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-8">Planos Disponíveis</h3>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-center">
                        {error}
                    </div>
                )}

                <div className="flex justify-center mb-8 gap-4">
                    <button
                        onClick={() => setSelectedBilling("PIX")}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${selectedBilling === 'PIX' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                        💠 PIX
                    </button>
                    <button
                        onClick={() => setSelectedBilling("BOLETO")}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${selectedBilling === 'BOLETO' ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                        📄 Boleto Bancário
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map(plan => {
                        const monthlyVal = calculatePrice(plan);
                        const totalVal = monthlyVal * plan.duration_months;

                        return (
                            <div key={plan.id} className="border border-gray-100 rounded-3xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 bg-white relative overflow-hidden group flex flex-col justify-between h-full">
                                <div>
                                    {plan.name === 'Anual' && (
                                        <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                            MELHOR VALOR
                                        </div>
                                    )}

                                    <h4 className="text-xl font-black text-gray-900 mb-2">{plan.name}</h4>
                                    <div className="mb-4">
                                        <span className="text-3xl font-black text-accent">R$ {monthlyVal.toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 font-bold">/mês</span>
                                    </div>

                                    {plan.discount_percent > 0 && (
                                        <p className="text-xs text-green-600 font-bold mb-4 bg-green-50 px-2 py-1 rounded-lg inline-block">
                                            Economize {plan.discount_percent}% no total
                                        </p>
                                    )}

                                    <ul className="text-sm text-gray-500 space-y-2 mb-6 font-medium">
                                        <li className="flex items-center gap-2">✅ Gestão de Estoque</li>
                                        <li className="flex items-center gap-2">✅ Gestão de Pedidos</li>
                                        <li className="flex items-center gap-2">✅ Agendamentos</li>
                                        <li className="flex items-center gap-2">✅ Suporte Prioritário</li>
                                    </ul>
                                </div>

                                <div>
                                    <button
                                        onClick={() => handleSubscribe(plan)}
                                        disabled={loading}
                                        className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Processando...' : 'Assinar Agora'}
                                    </button>

                                    <p className="text-[10px] text-center text-red-600 mt-3 font-bold">
                                        Cobrado a cada {plan.duration_months} meses<br />
                                        Total: R$ {totalVal.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
