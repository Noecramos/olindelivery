"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPortal() {
    const [slug, setSlug] = useState("");

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
            {/* Header Banner */}
            <div className="h-48 md:h-64 w-full bg-[length:100%_100%] bg-center relative" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            </div>

            {/* Content Container - FULL WIDTH */}
            <div className="flex-1 flex flex-col pb-10 pt-8">
                <div className="text-center mb-8 px-4">
                    <h1 className="font-bold text-gray-800 text-3xl md:text-4xl">Portal do Parceiro</h1>
                    <p className="text-gray-600 font-medium text-lg">Gerencie seu restaurante no OlinDelivery</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                    {/* Left Column - Login */}
                    <div className="card bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-100 pb-2">Já sou parceiro</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="admin-slug" className="block text-sm font-bold text-gray-700 mb-1">Identificador da Loja</label>
                                <input
                                    id="admin-slug"
                                    name="slug"
                                    type="text"
                                    placeholder="Ex: olin-burgers"
                                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#EA1D2C] transition-all"
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
                    <div className="card bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-100 pb-2">Quero vender no OlinDelivery</h2>
                        <p className="text-gray-600 mb-6">Cadastre sua loja e comece a vender hoje mesmo!</p>
                        <Link href="/register">
                            <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                Cadastrar Loja
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="px-4">
                    <Link href="/admin/super" className="mt-8 block text-center text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors">Acesso Administrativo (Super Admin)</Link>
                </div>

                <footer className="w-full text-center text-gray-400 text-xs py-6 mt-auto px-4">
                    © 2025 Noviapp Mobile Apps • <a href="http://www.noviapp.com.br" target="_blank" className="hover:underline">www.noviapp.com.br</a> • OlindAki & OlinDelivery
                </footer>
            </div>
        </div>
    );
}
