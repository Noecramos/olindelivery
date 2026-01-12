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
    const { addToCart, count, total } = useCart();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("Lanches");
    const [toast, setToast] = useState<string | null>(null);

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

    // Group available items by category
    // Group available items by category (default to true if available status is missing)
    const activeProducts = products.filter(p => p.available !== false);
    const categories = Array.from(new Set(activeProducts.map((item: any) => item.category))).filter((c: any) => c && c.trim() !== "");

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
                                <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#3e3e3e" }}>{cat}</h2>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))", gap: "1rem" }}>
                                    {activeProducts.filter((item: any) => item.category === cat).map((item: any) => (
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
                <div className="text-center p-10 text-secondary">Nenhum produto disponível.</div>
            )}

            {restaurant.isOpen && <FloatingCart count={count} total={total} />}

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
