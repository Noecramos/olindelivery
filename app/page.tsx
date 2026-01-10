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
  const [config, setConfig] = useState<any>({
    headerImage: 'https://i.imgur.com/Fyccvly.gif',
    welcomeTitle: 'O que vamos\npedir hoje?',
    welcomeSubtitle: 'Entregar em Casa',
    footerText: '© 2025 OlindAki Delivery',
    headerBgColor: '#FFD700'
  });

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

  // Loading Splash Screen Logic - Only show once per session
  const [loading, setLoading] = useState(() => {
    // Check if splash has been shown in this session
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('splashShown');
    }
    return true;
  });

  useEffect(() => {
    if (loading) {
      // Mark splash as shown and hide after delay
      const timer = setTimeout(() => {
        setLoading(false);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('splashShown', 'true');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading]);


  useEffect(() => {
    fetch('/api/restaurants')
      .then(res => res.json())
      .then(setRestaurants)
      .catch(console.error);

    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setConfig((prev: any) => ({ ...prev, ...data }));
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FFD700] flex flex-col items-center justify-center z-[9999]">
        <div className="w-72 h-32 flex items-center justify-center animate-bounce">
          <Image src={config.headerImage || "https://i.imgur.com/yGLHWLL.png"} alt="Logo" width={240} height={100} style={{ objectFit: 'contain' }} priority />
        </div>
      </div>
    );
  }

  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // Derive unique categories from restaurants, filtering out invalid data (emails, etc)
  const forcedCategories = ['Lanches', 'Pizza', 'Hambúrguer', 'Açaí', 'Bebidas', 'Doces'];
  const dynamicCategories = restaurants.map(r => r.type)
    .filter((t: any) => typeof t === 'string' && t.length > 0 && !t.includes('@') && t.length < 30);

  const categories = ['Todos', ...Array.from(new Set([...forcedCategories, ...dynamicCategories]))];

  const getCategoryIcon = (cat: string) => {
    const map: any = {
      'Todos': '🔥',
      'Lanches': '🍔',
      'Hambúrguer': '🍔',
      'Pizza': '🍕',
      'Japonês': '🍣',
      'Doces': '🍰',
      'Açaí': '🥣',
      'Bebidas': '🥤',
      'Padaria': '🥐',
      'Brasileira': '🍛',
      'Saudável': '🥗',
      'Pastel': '🥟',
      'Sorvete': '🍦'
    };
    return map[cat] || '🍽️';
  };

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = (r.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || r.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pastelColors = [
    'bg-[#FFF4C3]', // Yellow
    'bg-[#FFE4E6]', // Pink
    'bg-[#D1FAE5]', // Green
    'bg-[#DBEAFE]', // Blue
    'bg-[#F3E8FF]', // Purple
    'bg-[#FFEDD5]', // Orange
    'bg-[#E0F2F1]', // Teal
    'bg-[#F1F8E9]', // Light Green
  ];

  return (
    <div style={{ background: "#F2F4F8", minHeight: "100vh" }}>
      <main className="mobile-container relative bg-white pb-20">
        {/* Top Bar */}
        <div
          className="pt-8 px-6 pb-4 flex justify-center items-center sticky top-0 z-40 bg-opacity-95 backdrop-blur-md transition-all duration-300 shadow-lg rounded-b-3xl bg-center bg-cover bg-no-repeat h-56"
          style={{
            backgroundColor: config.headerBackgroundType === 'image' ? 'transparent' : (config.headerBgColor || '#FFD700'),
            backgroundImage: config.headerBackgroundType === 'image' ? `url('${config.headerBackgroundImage}')` : 'none',
          }}
        >
        </div>

        {/* Greeting */}
        <div className="px-6 mb-8 mt-2">
          <p className="text-yellow-600 font-bold text-base mb-1 uppercase tracking-wider">{config.welcomeSubtitle}</p>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight" style={{ whiteSpace: 'pre-line' }}>{config.welcomeTitle}</h1>
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
            <h2 className="font-bold text-lg text-gray-800">{config.popularTitle || 'Populares'}</h2>
            <span
              className="text-xs font-semibold text-yellow-500 cursor-pointer hover:underline"
              onClick={() => document.getElementById('restaurantes')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver todos &gt;
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
            {/* Mock Items for Demo Style matching image */}
            {(config.featuredItems && config.featuredItems.length > 0
              ? (typeof config.featuredItems === 'string' ? JSON.parse(config.featuredItems) : config.featuredItems)
              : [
                { id: 'p1', name: 'Pizza Calabresa', price: 16.00, bg: 'bg-[#FFF4C3]', icon: '🍕', link: '/loja/olin-burgers' },
                { id: 'p2', name: 'Bolognesa', price: 22.00, bg: 'bg-[#FFE4E6]', icon: '🍝', link: '/loja/olin-burgers' },
                { id: 'p3', name: 'Burger Cheddar', price: 18.50, bg: 'bg-[#D1FAE5]', icon: '🍔', link: '/loja/olin-burgers' },
              ]
            ).map((item: any) => (
              <Link key={item.id} href={item.link || '#'}>
                <div className={`${item.bg || 'bg-white'} w-[240px] h-[110px] p-4 rounded-3xl flex items-center justify-between gap-3 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 flex-shrink-0 border border-black/5`}>
                  <div className="text-4xl drop-shadow-sm">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                    <p className="text-gray-900 font-bold mt-1">
                      {typeof item.price === 'number' ? `R$ ${item.price.toFixed(2)}` : item.price}
                    </p>
                  </div>
                  <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-yellow-500 hover:scale-110 transition-transform flex-shrink-0">
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
            <span
              className="text-xs font-semibold text-yellow-500 cursor-pointer hover:underline"
              onClick={() => document.getElementById('restaurantes')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver todas &gt;
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat, i) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  document.getElementById('restaurantes')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`category-tab ${selectedCategory === cat ? 'active' : pastelColors[i % pastelColors.length]}`}
              >
                {getCategoryIcon(cat)} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main List (Restaurants) */}
        <div className="px-6 space-y-4" id="restaurantes">
          <h2 className="font-bold text-lg text-gray-800">Restaurantes {selectedCategory !== 'Todos' && <span className="text-gray-400 font-normal text-sm">({selectedCategory})</span>}</h2>
          {filteredRestaurants.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl">
              Nenhum restaurante encontrado para "{selectedCategory}".
            </div>
          ) : (
            filteredRestaurants.map(rest => (
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
                      <StarRating restaurantId={rest.id} initialSum={rest.ratingSum} initialCount={rest.ratingCount} readonly={true} />
                      <span className="text-xs text-gray-400 font-medium ml-1">
                        {rest.type ? <span className="text-gray-500 mr-2">• {rest.type}</span> : ''}
                        {rest.deliveryTime || '30-45m'}
                      </span>
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
        <footer className="w-full text-center text-gray-400 text-xs py-8 mt-4 border-t border-gray-100">
          {config.footerText}
        </footer>
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
