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
    <main style={{ minHeight: "100vh", background: "#f7f7f7" }}>
      {/* Header iFood Style */}
      <header className="ifood-header">
        <div className="container mx-auto px-4 h-full flex items-center justify-between gap-8">
          {/* Logo area */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[#ea1d2c] font-bold text-3xl tracking-tight">OlinDelivery</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <span className="nav-link text-[#ea1d2c]">Início</span>
              <span className="nav-link">Restaurantes</span>
              <span className="nav-link">Mercados</span>
              <span className="nav-link">Bebidas</span>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="search-bar">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea1d2c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Busque por item ou loja" className="search-input" />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <Link href="/register" className="hidden md:block text-sm font-bold text-gray-500 hover:text-[#ea1d2c] transition-colors">
              Cadastrar Restaurante
            </Link>
            <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors">
              <span className="text-sm font-medium text-gray-700">Entrar</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Category Filters (Scrollable) */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['Início', 'Mercado', 'Lanches', 'Brasileira', 'Pizza', 'Japonesa', 'Açaí', 'Doces', 'Promoções'].map((cat, i) => (
            <div key={cat} className={`category-pill ${i === 0 ? 'active' : ''}`}>
              {cat}
            </div>
          ))}
        </div>

        {/* Promo Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#ea1d2c] rounded-2xl p-6 text-white h-40 flex flex-col justify-center relative overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <h3 className="font-bold text-2xl relative z-10">Restaurantes <br />com Frete Grátis</h3>
            <button className="mt-4 bg-white text-[#ea1d2c] px-4 py-2 rounded-full text-sm font-bold w-fit relative z-10 hover:bg-gray-50 transition-colors">Ver Opções</button>
          </div>
          <div className="bg-[#F6D55C] rounded-2xl p-6 text-gray-800 h-40 flex flex-col justify-center relative overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10"></div>
            <h3 className="font-bold text-2xl relative z-10">Promoções <br />do Dia</h3>
            <button className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-bold w-fit relative z-10 hover:bg-gray-700 transition-colors">Confira</button>
          </div>
        </div>

        {/* Restaurants Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Lojas</h2>

          {restaurants.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-6xl mb-4">🏪</div>
              <p className="text-gray-500 mb-4">Nenhum restaurante encontrado na sua região.</p>
              <Link href="/register" className="text-[#ea1d2c] font-bold hover:underline">Cadastrar meu restaurante</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.map(rest => (
                <Link key={rest.id} href={`/loja/${rest.slug}`} className="group">
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1 flex items-start gap-4 h-full">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
                      {rest.image ? (
                        <Image src={rest.image} alt={rest.name} fill style={{ objectFit: "cover" }} />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-2xl">🏪</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate mb-1">{rest.name}</h3>
                      <div className="flex items-center gap-1 text-sm mb-1">
                        <span className="text-[#e2a032] font-bold text-xs">★ 4.9</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 text-xs">Lanches</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 text-xs">1.2km</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">40-50 min • <span className="text-green-600 font-bold">Grátis</span></span>
                        {rest.isOpen ? (
                          <span className="w-2 h-2 bg-green-500 rounded-full" title="Aberto"></span>
                        ) : (
                          <span className="w-2 h-2 bg-red-400 rounded-full" title="Fechado"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-3">
          <span className="bg-white text-green-500 rounded-full w-6 h-6 flex items-center justify-center font-bold">✓</span>
          <span className="font-bold">Pedido enviado com sucesso!</span>
        </div>
      )}
    </main>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
