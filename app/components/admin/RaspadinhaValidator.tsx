"use client";

import { useState, useEffect } from "react";

export default function RaspadinhaValidator() {
    const [code, setCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        // Function to generate the daily code
        // This MUST match the client-side logic in the raspadinha validation
        const generateCode = () => {
            const now = new Date();
            // Create a seed based on the current hour (e.g. 2023-10-27-14)
            // This rotates the code every hour for security
            // Or use getDay() for daily rotation. Let's do Hourly for better security/testing.
            const seed = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;

            // Simple hash function to generate 4 digits
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                const char = seed.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }

            // Absolute value and mod 10000 to get 4 digits
            const fourDigitCode = Math.abs(hash % 10000).toString().padStart(4, '0');
            setCode(fourDigitCode);

            // Calculate time until next rotation (next hour)
            const nextHour = new Date(now);
            nextHour.setHours(now.getHours() + 1, 0, 0, 0);
            setTimeLeft(Math.floor((nextHour.getTime() - now.getTime()) / 1000));
        };

        generateCode();
        const interval = setInterval(generateCode, 1000); // Update every second to check rotation/timer
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden w-full max-w-md mx-auto">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-600 p-6 text-center text-white">
                <h2 className="text-xl font-bold uppercase tracking-wider">Validador OlindAki</h2>
                <p className="text-sm opacity-80 mt-1">Raspadinha da Sorte</p>
            </div>

            <div className="p-8 flex flex-col items-center text-center">
                <p className="text-gray-500 font-medium mb-4 uppercase tracking-widest text-xs">Código Atual</p>

                <div className="bg-gray-50 border-4 border-dashed border-gray-200 rounded-2xl p-8 mb-6 w-full">
                    <span className="text-6xl font-mono font-bold text-gray-800 tracking-[0.2em]">
                        {code}
                    </span>
                </div>

                <div className="text-sm text-gray-400 font-medium mb-8">
                    Expira em: <span className="text-orange-500 font-bold">{formatTime(timeLeft)}</span>
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
