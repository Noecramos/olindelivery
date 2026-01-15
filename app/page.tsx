"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import StarRating from "./components/StarRating";
import { useAuth } from "./context/AuthContext";

function MarketplaceContent() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [config, setConfig] = useState<any>({
    headerImage: 'https://i.imgur.com/Fyccvly.gif',
    welcomeTitle: 'O que vamos\npedir hoje?',
    welcomeSubtitle: 'Entregar em Casa',
    footerText: '© 2025 OlindAki Delivery',
    headerBgColor: 'transparent'
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/orders?customerEmail=${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setRecentOrders(data.slice(0, 3));
        })
        .catch(console.error);
    } else {
      setRecentOrders([]);
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.get('orderSuccess')) {
      setShowSuccess(true);
      // Remove query param without refresh
      window.history.replaceState({}, '', window.location.pathname);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Loading Splash Screen Logic - Only show once per session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent hydration mismatch by checking session only on client mount
    if (typeof window !== 'undefined') {
      try {
        const hasShownSplash = sessionStorage.getItem('splashShown');
        if (hasShownSplash) {
          setLoading(false);
        } else {
          const timer = setTimeout(() => {
            setLoading(false);
            try { sessionStorage.setItem('splashShown', 'true'); } catch (e) { }
          }, 4000);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        // Fallback if sessionStorage is blocked
        setLoading(false);
      }
    }
  }, []);

  const safeJsonParse = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("Failed to parse featuredItems", e);
      return [];
    }
  };

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
          <Image src="https://i.imgur.com/Fyccvly.gif" alt="Logo" width={240} height={100} style={{ objectFit: 'contain' }} priority unoptimized />
        </div>
      </div>
    );
  }



  // Derive unique categories from restaurants, filtering out invalid data (emails, etc)
  const forcedCategories = ['Lanches', 'Pizza', 'Açaí', 'Bebidas', 'Doces'];
  const dynamicCategories = restaurants.map(r => r.type)
    .filter((t: any) => typeof t === 'string' && t.length > 0 && !t.includes('@') && t.length < 30 && t !== 'Deposito Bebidas' && t !== 'Depósito de Bebidas');

  const categories = ['Todos', ...Array.from(new Set([...forcedCategories, ...dynamicCategories]))];

  const getCategoryIcon = (cat: string) => {
    const map: any = {
      'Todos': '🔥',
      'Lanches': '🍔',
      'Hambúrguer': '🍔',
      'Hamburgueria': '🍔',
      'Pizza': '🍕',
      'Pizzaria': '🍕',
      'Japonês': '🍣',
      'Sushi': '🍣',
      'Oriental': '🍣',
      'Doces': '🍰',
      'Sobremesa': '🍰',
      'Açaí': '🥣',
      'Bebidas': '🥤',
      'Padaria': '🥐',
      'Brasileira': '🍛',
      'Comida': '🍲',
      'Comida Caseira': '🍲',
      'Saudável': '🥗',
      'Salada': '🥗',
      'Pastel': '🥟',
      'Sorvete': '🍦',
      'Churrasco': '🥩',
      'Carne': '🥩',
      'Café': '☕',
      'Massas': '🍝',
      'Italiana': '🍝',
      'Mexicano': '🌮',
      'Vegano': '🥦'
    };
    // Case insensitive lookup
    if (!cat || typeof cat !== 'string') return '🍽️';
    const normalizedCat = Object.keys(map).find(key => key.toLowerCase() === cat.toLowerCase());
    return normalizedCat ? map[normalizedCat] : '🍽️';
  };

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = (r.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || r.type === selectedCategory || (selectedCategory === 'Bebidas' && (r.type === 'Deposito Bebidas' || r.type === 'Depósito de Bebidas'));
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
          className="relative pt-8 px-6 pb-4 flex justify-center items-center sticky top-0 z-40 bg-opacity-95 backdrop-blur-md transition-all duration-300 shadow-lg rounded-b-3xl bg-center bg-cover bg-no-repeat h-56"
          style={{
            backgroundColor: config.headerBackgroundType === 'image' ? 'transparent' : (config.headerBgColor || 'transparent'),
            backgroundImage: config.headerBackgroundType === 'image' ? `url('${config.headerBackgroundImage}')` : 'none',
          }}
        >
          {/* User Profile / Login Button - Absolute Positioned */}
          <div className="absolute top-4 right-4 z-[60]">
            {user ? (
              <div className="flex items-center gap-2 bg-white p-2 pr-4 rounded-full shadow-lg border border-gray-100 animate-fade-in">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg border border-gray-200">👤</div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-gray-800 leading-none">{user.name?.split(' ')[0]}</span>
                  <button onClick={logout} className="text-[10px] font-bold text-red-500 hover:underline leading-none mt-1">Sair</button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <div className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-transform hover:scale-105 active:scale-95">
                  <span className="text-lg">👤</span>
                  <span>Entrar</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Greeting */}
        <div className="px-6 mb-8 mt-2">
          <p className="text-yellow-600 font-bold text-base mb-1 uppercase tracking-wider">{config.welcomeSubtitle}</p>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight" style={{ whiteSpace: 'pre-line' }}>{config.welcomeTitle}</h1>
        </div>

        {/* Order Again Section */}
        {user && recentOrders.length > 0 && (
          <div className="mb-10 px-6 animate-fade-in">
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-bold text-lg text-gray-800">Pedir novamente ⚡</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {recentOrders.map((order: any) => (
                <Link key={order.id} href={`/loja/${order.restaurantSlug}`}>
                  <div className="bg-white border border-gray-100 shadow-sm w-[260px] p-4 rounded-3xl flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                      {order.restaurantImage ? (
                        <img src={order.restaurantImage} alt={order.restaurantName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🏬</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm truncate">{order.restaurantName}</h3>
                      <p className="text-gray-500 text-xs truncate">
                        {(order.items && typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])).length} {(order.items && typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])).length === 1 ? 'item' : 'itens'} • {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="bg-yellow-400 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0">
                      <span className="text-lg">↺</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-6 mb-10 relative">
          <svg className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            id="searchRestaurants"
            name="search"
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
              ? (typeof config.featuredItems === 'string' ? safeJsonParse(config.featuredItems) : config.featuredItems)
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
