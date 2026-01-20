"use client";

import { useState, useEffect } from "react";

export default function RaspadinhaValidator() {
    const [code, setCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);

    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchCode = async () => {
        try {
            const res = await fetch('/api/raspadinha/code');
            const data = await res.json();
            if (data.code) {
                setCode(prev => {
                    if (prev !== data.code) {
                        // Flash or animate could go here
                    }
                    return data.code;
                });
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error("Failed to fetch code", e);
        }
    };

    useEffect(() => {
        fetchCode();
        const interval = setInterval(fetchCode, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden w-full max-w-md mx-auto">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-600 p-6 text-center text-white relative">
                <h2 className="text-xl font-bold uppercase tracking-wider">Validador OlindAki</h2>
                <p className="text-sm opacity-80 mt-1">Raspadinha da Sorte</p>
                <button
                    onClick={fetchCode}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Atualizar Código"
                >
                    🔄
                </button>
            </div>

            <div className="p-8 flex flex-col items-center text-center">
                <div className="flex justify-between w-full items-center mb-4 px-2">
                    <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">Código Atual</p>
                    <p className="text-[10px] text-gray-400">Atualizado às {lastUpdated.toLocaleTimeString()}</p>
                </div>

                <div className="bg-gray-50 border-4 border-dashed border-gray-200 rounded-2xl p-8 mb-6 w-full relative">
                    <span className="text-6xl font-mono font-bold text-gray-800 tracking-[0.2em]">
                        {code || '....'}
                    </span>
                </div>

                <div className="text-sm text-gray-400 font-medium mb-8">
                    <span className="text-orange-500 font-bold">✨ Código Único (Expira ao usar)</span>
                </div>

                <div className="bg-blue-50 text-blue-800 p-6 rounded-2xl text-left text-sm w-full">
                    <p className="font-black mb-2 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        Como validar:
                    </p>
                    <ol className="list-decimal pl-4 space-y-2 marker:font-bold">
                        <li>O cliente mostrará a tela de "Validação" no celular dele.</li>
                        <li>Digite o código acima <b>({code})</b> no celular dele.</li>
                        <li>O prêmio será liberado instantaneamente na tela dele.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
