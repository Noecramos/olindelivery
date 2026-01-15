"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import RestaurantHeader from "../../components/RestaurantHeader";
import CategoryNav from "../../components/CategoryNav";
import ProductCard from "../../components/ProductCard";
import FloatingCart from "../../components/FloatingCart";

export const dynamic = 'force-dynamic';

export default function StoreFront() {
    const { slug } = useParams();
    const router = useRouter();
    const { addToCart, count, total, items } = useCart();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("Lanches");
    const [toast, setToast] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!slug) return;

        // Fetch Restaurant Details
        fetch(`/api/restaurants?slug=${slug}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setRestaurant(data);
                if (data) {
                    // Fetch Products for this restaurant
                    fetch(`/api/products?restaurantId=${data.id}`)
                        .then(res => res.json())
                        .then(setProducts);
                }
            });
    }, [slug]);

    if (!restaurant) return <div className="p-10 text-center">Carregando loja...</div>;

    // Filter products by search term
    const filteredProducts = products.filter(p =>
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        p.available !== false
    );

    // Group available items by category
    const categories = Array.from(new Set(filteredProducts.map((item: any) => item.category)))
        .filter((c: any) => c && c.trim() !== "");

    const handleAdd = (item: any) => {
        addToCart(item);
        setToast(`${item.name} adicionado!`);
        setTimeout(() => setToast(null), 2000);
    };

    const handleScrollToCategory = (cat: string) => {
        setActiveCategory(cat);
        const element = document.getElementById(cat);
        if (element) {
            const yOffset = -120;
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <main style={{ paddingBottom: "100px", minHeight: "100vh" }}>

            {/* Pass dynamic data to header if needed, for now resizing to match */}
            <RestaurantHeader
                name={restaurant.name}
                image={restaurant.image}
                banner={restaurant.banner}
                rating="4.9" // Dynamic in future
                address={restaurant.address}
                deliveryTime={restaurant.deliveryTime}
                restaurantId={restaurant.id}
                ratingSum={restaurant.ratingSum}
                ratingCount={restaurant.ratingCount}
            />

            {!restaurant.isOpen && (
                <div className="bg-red-500 text-white text-center p-2 font-bold sticky top-[60px] z-50">
                    ⛔ ESTA LOJA ESTÁ FECHADA NO MOMENTO
                </div>
            )}

            {/* Search Bar - Store Level */}
            <div className="px-4 mb-6">
                <div className="relative max-w-md mx-auto">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input
                        type="text"
                        placeholder={`O que você procura em ${restaurant.name}?`}
                        className="w-full pl-12 pr-4 py-4 bg-gray-100/50 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500 transition-all text-sm font-medium border border-gray-100 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {categories.length > 0 ? (
                <>
                    <CategoryNav
                        categories={categories}
                        activeCategory={activeCategory}
                        onSelect={handleScrollToCategory}
                    />

                    <div className="container" style={{ paddingTop: "1.5rem" }}>
                        {categories.map((cat: any) => (
                            <section key={cat} id={cat} style={{ marginBottom: "2rem" }}>
                                <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#3e3e3e", fontWeight: "bold", paddingLeft: "1rem" }}>{cat}</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
                                    {filteredProducts.filter((item: any) => item.category === cat).map((item: any) => (
                                        <div key={item.id} style={{ opacity: restaurant.isOpen ? 1 : 0.6, pointerEvents: restaurant.isOpen ? 'auto' : 'none' }}>
                                            <ProductCard item={item} onAdd={() => handleAdd(item)} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center p-20 text-gray-400">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="font-medium text-lg">Nenhum produto encontrado.</p>
                    <p className="text-sm">Tente buscar por termos diferentes ou confira outras categorias.</p>
                </div>
            )}

            {restaurant.isOpen && (!items.length || items[0].restaurantId === restaurant.id) && <FloatingCart count={count} total={total} />}

            {toast && (
                <div className="animate-fade-in" style={{
                    position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
                    background: "#323232", color: "white", padding: "0.8rem 1.5rem", borderRadius: "8px",
                    zIndex: 200, fontSize: "0.9rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}>
                    {toast}
                </div>
            )}
        </main>
    );
}
