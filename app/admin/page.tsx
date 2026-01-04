"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPortal() {
    const [stores, setStores] = useState<any[]>([]);

    useEffect(() => {
        // Fetch all restaurants
        fetch('/api/restaurants').then(res => res.json()).then(setStores);
    }, []);

    const createTestStore = async () => {
        await fetch('/api/restaurants', {
            method: 'POST',
            body: JSON.stringify({
                name: "Olin Burgers",
                slug: "olin-burgers",
                image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=150&q=80"
            })
        });
        window.location.reload();
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <h1 className="font-bold" style={{ fontSize: "2rem", marginBottom: "2rem" }}>Portal do Parceiro</h1>

            <div className="grid gap-4" style={{ width: "100%", maxWidth: "500px" }}>
                {stores.length === 0 && (
                    <div className="text-center text-secondary">
                        <p>Nenhuma loja encontrada.</p>
                        <button onClick={createTestStore} className="btn btn-primary mt-4">Criar Loja de Teste</button>
                    </div>
                )}

                {stores.map(store => (
                    <Link key={store.id} href={`/admin/${store.slug}`}>
                        <div className="card flex items-center gap-4 hover:shadow-lg transition-shadow" style={{ padding: "1.5rem", cursor: "pointer", background: "white", borderRadius: "8px", border: "1px solid #eee" }}>
                            <div style={{ width: 50, height: 50, background: "#eee", borderRadius: "50%", overflow: "hidden" }}>
                                {store.image && <img src={store.image} alt={store.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                            </div>
                            <div>
                                <h3 className="font-bold">{store.name}</h3>
                                <p className="text-sm text-secondary">Acessar Painel Administrativo &rarr;</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <p className="text-secondary text-sm" style={{ marginTop: "2rem" }}>OlinDelivery SaaS v2.0</p>
        </div>
    );
}
