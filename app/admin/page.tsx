"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPortal() {
    const [slug, setSlug] = useState("");

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F5F7] to-[#E8E8EA] flex flex-col items-center justify-center py-8 px-4">
            <div className="w-full max-w-6xl">
                {/* Header Banner - Same width as cards */}
                <div className="h-32 md:h-40 w-full bg-cover bg-center relative rounded-t-3xl overflow-hidden shadow-lg" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-b-3xl shadow-2xl p-8 md:p-10 animate-fade-in-up">
                    <div className="text-center mb-10">
                        <h1 className="font-bold text-gray-800 text-3xl md:text-4xl mb-2">Portal do Parceiro</h1>
                        <p className="text-gray-600 font-medium text-lg">Gerencie seu restaurante no OlinDelivery</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
                        {/* Left Column - Login */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                                <span className="text-2xl">🏪</span>
                                Já sou parceiro
                            </h2>
                            <div className="space-y-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <label htmlFor="admin-slug" className="block text-sm font-bold text-gray-700 mb-2">Identificador da Loja</label>
                                    <input
                                        id="admin-slug"
                                        name="slug"
                                        type="text"
                                        placeholder="Ex: olin-burgers"
                                        className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 outline-none focus:border-[#EA1D2C] focus:ring-4 focus:ring-[#EA1D2C]/10 transition-all font-medium"
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                    />
                                </div>
                                <div className="mt-6">
                                    <Link href={`/admin/${slug}`} className="block">
                                        <button
                                            disabled={!slug}
                                            className="w-full bg-gradient-to-r from-[#EA1D2C] to-[#C51623] hover:from-[#C51623] hover:to-[#A01419] text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
                                        >
                                            Acessar Painel →
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Register */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                Quero vender
                            </h2>
                            <div className="flex-1 flex flex-col justify-between">
                                <p className="text-gray-600 mb-6 leading-relaxed font-medium">
                                    Cadastre seu restaurante na maior plataforma de delivery de Olinda e comece a vender hoje mesmo!
                                </p>
                                <div className="mt-auto">
                                    <Link href="/register" className="block">
                                        <button className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1">
                                            Cadastrar Agora →
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Footer */}
                <footer className="w-full text-center text-gray-500 text-xs py-6 mt-4">
                    © 2025 Noviapp Mobile Apps • <a href="http://www.noviapp.com.br" target="_blank" className="hover:text-[#EA1D2C] transition-colors">www.noviapp.com.br</a> • OlindAki & OlinDelivery
                </footer>
            </div>
        </div>
    );
}
