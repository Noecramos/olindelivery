"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPortal() {
    const [slug, setSlug] = useState("");

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center py-8 px-4">
            <div className="w-full max-w-6xl">
                {/* Header Banner - Same width as cards */}
                <div className="h-32 md:h-40 w-full bg-cover bg-center relative rounded-t-3xl overflow-hidden" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-b-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-8 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h1 className="font-bold text-gray-800 text-3xl md:text-4xl">Portal do Parceiro</h1>
                        <p className="text-gray-600 font-medium text-lg">Gerencie seu restaurante no OlinDelivery</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                        {/* Left Column - Login */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">Já sou parceiro</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="admin-slug" className="block text-sm font-bold text-gray-700 mb-1">Identificador da Loja</label>
                                    <input
                                        id="admin-slug"
                                        name="slug"
                                        type="text"
                                        placeholder="Ex: olin-burgers"
                                        className="w-full p-4 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#EA1D2C] transition-all"
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                    />
                                </div>
                                <Link href={`/admin/${slug}`}>
                                    <button disabled={!slug} className="w-full bg-[#EA1D2C] hover:bg-[#C51623] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0 mt-2">
                                        Acessar Painel
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Column - Register */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">Quero vender no OlinDelivery</h2>
                            <p className="text-gray-600 mb-6">Cadastre sua loja e comece a vender hoje mesmo!</p>
                            <Link href="/register">
                                <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                    Cadastrar Loja
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <Link href="/admin/super" className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors">Acesso Administrativo (Super Admin)</Link>
                    </div>
                </div>

                {/* Footer */}
                <footer className="w-full text-center text-gray-400 text-xs py-6 mt-4">
                    © 2025 Noviapp Mobile Apps • <a href="http://www.noviapp.com.br" target="_blank" className="hover:underline">www.noviapp.com.br</a> • OlindAki & OlinDelivery
                </footer>
            </div>
        </div>
    );
}
