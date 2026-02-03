"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(email, password);
        setLoading(false);
        if (success) {
            router.push(returnUrl);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 animate-fade-in-up">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Bem-vindo(a)</h1>
                <p className="text-gray-500 mt-2">Faça login para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C] transition-all"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C] transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#EA1D2C] hover:bg-[#C51623] text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all text-lg disabled:opacity-50"
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-500">
                    Não tem uma conta?{" "}
                    <Link href={`/signup?returnUrl=${encodeURIComponent(returnUrl)}`} className="text-[#EA1D2C] font-bold hover:underline">
                        Cadastre-se
                    </Link>
                </p>
            </div>

            <div className="mt-4 text-center">
                <Link href="/" className="text-gray-400 text-sm hover:text-gray-600">
                    Voltar ao início
                </Link>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
            {/* ZAPPY Header */}
            <div
                className="relative pt-8 px-6 pb-4 flex justify-center items-center sticky top-0 z-40 bg-opacity-95 backdrop-blur-md transition-all duration-300 shadow-lg rounded-b-3xl h-64"
                style={{
                    backgroundColor: '#FFD700',
                    backgroundImage: `url('/header-zappy.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 40%',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Back to Home Link */}
                <Link
                    href="/"
                    className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full shadow-lg border border-gray-200 text-sm font-bold flex items-center gap-2 hover:bg-white transition-transform hover:scale-105 active:scale-95"
                >
                    ← Voltar
                </Link>
            </div>

            {/* Login Form */}
            <div className="flex-1 flex items-center justify-center py-8 px-4">
                <Suspense fallback={<div className="text-center">Carregando...</div>}>
                    <LoginForm />
                </Suspense>
            </div>

            {/* Footer */}
            <footer className="w-full text-center text-gray-400 text-xs py-6 border-t border-gray-100">
                © 2026 Noviapp Mobile Apps • ZAPPY®
            </footer>
        </div>
    );
}
