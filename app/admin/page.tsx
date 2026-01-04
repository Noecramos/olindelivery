"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPortal() {
    const [slug, setSlug] = useState("");

    return (
        <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <h1 className="font-bold" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Portal do Parceiro</h1>
            <p className="text-gray-500 mb-8">Gerencie seu restaurante no OlinDelivery</p>

            <div className="card w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Já sou parceiro</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Identificador da Loja (Slug)"
                        className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                        value={slug}
                        onChange={e => setSlug(e.target.value)}
                    />
                    <Link href={`/admin/${slug}`}>
                        <button disabled={!slug} className="w-full bg-[#EA1D2C] hover:bg-[#C51623] text-white font-bold py-4 rounded-xl transition-all shadow-md disabled:opacity-50 mt-2">
                            Acessar Painel
                        </button>
                    </Link>
                </div>

                <div className="my-8 border-t border-gray-100 relative">
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-400">OU</span>
                </div>

                <h2 className="text-xl font-bold mb-4 text-gray-800">Quero vender no OlinDelivery</h2>
                <Link href="/register">
                    <button className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-md">
                        Cadastrar Loja
                    </button>
                </Link>
            </div>

            <Link href="/admin/super" className="mt-8 text-gray-300 hover:text-gray-500 text-sm">Acesso Administrativo (Super Admin)</Link>
        </div>
    );
}
