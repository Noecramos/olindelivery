
"use client";

import { useEffect, useState } from "react";

export default function DebugProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all products from all restaurants (simplification for debug)
        // We'll just fetch for a known restaurant ID if available, or try to list all if API supports it
        // Or assume user is on a restaurant page logic. 
        // Let's try to fetch using the restaurant slug from URL if we were in context, but here we are standalone.
        // We'll try to find "Camisa polo" by scanning all? No, let's fetch by restaurantId if we can guess it or just list from database if API allows no ID.
        // Our API requires restaurantId usually.
        // Let's try to fetch the restaurant corresponding to "mtg-unissex" first.

        async function load() {
            try {
                // 1. Get Restaurant
                const resRest = await fetch('/api/restaurants?slug=mtg-unissex');
                const restData = await resRest.json();

                if (restData && restData.id) {
                    // 2. Get Products
                    const resProd = await fetch(`/api/products?restaurantId=${restData.id}`);
                    const prodData = await resProd.json();
                    setProducts(prodData);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="p-10">Carregando dados de debug...</div>;

    return (
        <div className="p-10 font-mono text-xs">
            <h1 className="text-xl font-bold mb-5">Debug Produtos (MTG STORE UNISSEX)</h1>
            {products.map(p => (
                <div key={p.id} className="mb-8 border p-4 rounded bg-gray-50">
                    <div className="font-bold text-lg mb-2">{p.name} (ID: {p.id})</div>
                    <div className="mb-2 text-blue-600">Categoria: {p.category}</div>
                    <div className="bg-black text-green-400 p-4 rounded overflow-auto whitespace-pre-wrap">
                        {JSON.stringify(p.options, null, 2)}
                    </div>
                    <div className="mt-2 text-gray-500">
                        Typeof options: {typeof p.options} <br />
                        Is Array? {Array.isArray(p.options) ? "YES" : "NO"} <br />
                        Length: {p.options?.length}
                    </div>
                </div>
            ))}
        </div>
    );
}
