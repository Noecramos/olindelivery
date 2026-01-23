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
                instagram={restaurant.instagram}
                whatsapp={restaurant.whatsapp}
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

            {/* Floating WhatsApp Button */}
            {restaurant.whatsapp && (
                <a
                    href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-24 right-4 z-40 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center animate-bounce-slow"
                    style={{ width: '60px', height: '60px' }}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118571.557-.081 1.758-.718 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                </a>
            )}

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
