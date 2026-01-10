"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import StarRating from "./components/StarRating";

function MarketplaceContent() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Loading Splash Screen Logic
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading or wait for resources
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    fetch('/api/restaurants')
      .then(res => res.json())
      .then(setRestaurants)
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#ea1d2c] flex flex-col items-center justify-center z-[9999]">
        <div className="w-72 h-32 bg-white rounded-2xl flex items-center justify-center shadow-lg p-4 animate-bounce">
          <Image src="https://i.imgur.com/yGLHWLL.png" alt="Logo" width={240} height={100} style={{ objectFit: 'contain' }} priority />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F2F4F8", minHeight: "100vh" }}>
      <main className="mobile-container relative bg-white pb-20">
        {/* Top Bar */}
        {/* Top Bar */}
        <div className="pt-8 px-6 pb-4 flex justify-center items-center bg-white sticky top-0 z-40 bg-opacity-95 backdrop-blur-sm">
          <Image
            src="https://i.imgur.com/iWSJGep.png"
            alt="OlinDelivery Logo"
            width={150}
            height={50}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        {/* Greeting */}
        <div className="px-6 mb-8 mt-2">
          <p className="text-gray-400 font-medium text-sm mb-1">Entregar em <span className="text-[#F6D55C] font-bold">Casa</span></p>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">O que vamos<br />pedir hoje?</h1>
        </div>

        {/* Search */}
        <div className="px-6 mb-10 relative">
          <svg className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Buscar restaurantes..."
            className="search-input-modern"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              { id: 'p1', name: 'Pizza Calabresa', price: 16.00, bg: 'bg-[#FFFBEB]', icon: '🍕', link: '/loja/olin-burgers' },
              { id: 'p2', name: 'Bolognesa', price: 22.00, bg: 'bg-[#FEF2F2]', icon: '🍝', link: '/loja/olin-burgers' },
              { id: 'p3', name: 'Burger Cheddar', price: 18.50, bg: 'bg-[#ECFDF5]', icon: '🍔', link: '/loja/olin-burgers' },
            ].map(item => (
              <Link key={item.id} href={item.link}>
                <div className={`${item.bg} min-w-[200px] p-4 rounded-3xl flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1`}>
                  <div className="text-3xl drop-shadow-md">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                    <p className="text-gray-900 font-bold mt-1">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="ml-auto bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-yellow-500">
                    &gt;
                  </div>
                </div>
              </Link>
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
          {restaurants.filter(r => (r.name || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl">
              Nenhum restaurante encontrado.
            </div>
          ) : (
            restaurants.filter(r => (r.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(rest => (
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
                    <div className="flex flex-col items-start gap-1 mt-1">
                      <StarRating restaurantId={rest.id} initialSum={rest.ratingSum} initialCount={rest.ratingCount} />
                      <span className="text-xs text-gray-400 font-medium ml-1">{rest.deliveryTime || '30-45m'}</span>
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
