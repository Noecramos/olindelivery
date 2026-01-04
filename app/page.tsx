"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

function MarketplaceContent() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('orderSuccess')) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        router.replace('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  useEffect(() => {
    fetch('/api/restaurants')
      .then(res => res.json())
      .then(setRestaurants)
      .catch(console.error);
  }, []);

  return (
    <div style={{ background: "#F2F4F8", minHeight: "100vh" }}>
      <main className="mobile-container relative bg-white pb-20">
        {/* Top Bar */}
        <div className="pt-10 px-6 pb-4 flex justify-between items-center bg-white sticky top-0 z-40">
          <div className="flex gap-2">
            <span className="bg-gray-100 p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold border border-yellow-200">
              N
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="px-6 mb-6">
          <p className="text-gray-400 font-medium text-sm">Olá, Cliente,</p>
          <h1 className="text-2xl font-bold text-gray-800">Boa Tarde!</h1>
        </div>

        {/* Search */}
        <div className="px-6 mb-8 relative">
          <svg className="absolute left-10 top-3.5 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Buscar comida..." className="search-input-modern" />
        </div>

        {/* Best Sellers Section (Horizontal Scroll) */}
        <div className="mb-0">
          <div className="px-6 flex justify-between items-end mb-4">
            <h2 className="font-bold text-lg text-gray-800">Populares</h2>
            <span className="text-xs font-semibold text-yellow-500 cursor-pointer">Ver todos &gt;</span>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
            {/* Mock Items for Demo Style matching image */}
            {[
              { id: 'p1', name: 'Pizza Calabresa', price: 16.00, bg: 'bg-[#FFFBEB]', icon: '🍕' },
              { id: 'p2', name: 'Bolognesa', price: 22.00, bg: 'bg-[#FEF2F2]', icon: '🍝' },
              { id: 'p3', name: 'Burger Cheddar', price: 18.50, bg: 'bg-[#ECFDF5]', icon: '🍔' },
            ].map(item => (
              <div key={item.id} className={`${item.bg} min-w-[200px] p-4 rounded-3xl flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1`}>
                <div className="text-3xl drop-shadow-md">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                  <p className="text-gray-900 font-bold mt-1">R$ {item.price.toFixed(2)}</p>
                </div>
                <div className="ml-auto bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-yellow-500">
                  &gt;
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 mb-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-bold text-lg text-gray-800">Categorias</h2>
            <span className="text-xs font-semibold text-yellow-500 cursor-pointer">Ver todas &gt;</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['Todos', 'Lanches', 'Pizza', 'Doces', 'Bebidas'].map((cat, i) => (
              <button key={cat} className={`category-tab ${i === 0 ? 'active' : ''}`}>
                {i === 0 ? '🔥 ' : ''}{cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main List (Restaurants) */}
        <div className="px-6 space-y-4">
          <h2 className="font-bold text-lg text-gray-800">Restaurantes</h2>
          {restaurants.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl">
              Nenhum restaurante encontrado.
            </div>
          ) : (
            restaurants.map(rest => (
              <Link key={rest.id} href={`/loja/${rest.slug}`}>
                <div className="item-card-row group">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 shadow-inner">
                    {rest.image ? (
                      <Image
                        src={rest.image}
                        alt={rest.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🏪</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base">{rest.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">★ 4.8</span>
                      <span className="text-xs text-gray-400•">Wait 20m</span>
                      <span className="text-xs text-gray-400">• 1.2km</span>
                    </div>
                  </div>
                  <div className="text-yellow-500 font-bold text-lg ml-2">
                    &gt;
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Sticky Bottom Nav */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-8 z-50">
          <button className="text-yellow-400" aria-label="Home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          </button>
          <button className="text-gray-500 hover:text-white transition-colors" aria-label="Favorites">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
          <div className="relative">
            <button className="bg-yellow-500 text-black p-3 rounded-full -mt-8 shadow-lg transform hover:-translate-y-1 transition-all" aria-label="Cart">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </button>
          </div>
          <button className="text-gray-500 hover:text-white transition-colors" aria-label="Orders">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </button>
          <Link href="/register" className="text-gray-500 hover:text-white transition-colors" aria-label="Profile">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </Link>
        </div>

        {showSuccess && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-3">
            <span className="bg-white text-green-500 rounded-full w-6 h-6 flex items-center justify-center font-bold">✓</span>
            <span className="font-bold">Pedido enviado com sucesso!</span>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
