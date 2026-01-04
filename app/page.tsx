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
    <main style={{ minHeight: "100vh", background: "#fcfcfc" }}>
      {/* Helper Header */}
      <header className="sticky top-0 z-50 bg-white border-b" style={{ height: "70px", display: "flex", alignItems: "center", padding: "0 1rem" }}>
        <div className="container flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image src="/logo.jpg" alt="OlinDelivery" fill style={{ objectFit: 'cover' }} />
            </div>
            <span className="font-bold text-primary text-xl">OlinDelivery</span>
          </div>
          <Link href="/register" className="text-sm font-medium text-secondary hover:text-primary">Cadastrar Restaurante</Link>
        </div>
      </header>

      <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <h1 className="text-2xl font-bold mb-6">Restaurantes Disponíveis</h1>

        {restaurants.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-secondary">Nenhum restaurante encontrado.</p>
            <Link href="/register" className="text-primary font-bold">Cadastrar meu restaurante</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(rest => (
              <Link key={rest.id} href={`/loja/${rest.slug}`}>
                <div className="card hover:shadow-lg transition-all cursor-pointer flex items-center gap-4 p-4 border border-gray-100">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {rest.image ? (
                      <Image src={rest.image} alt={rest.name} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{rest.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <span className="text-yellow-500">★ 4.9</span>
                      <span>•</span>
                      <span>Lanches</span>
                    </div>
                    <div className="mt-3">
                      {rest.isOpen ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Aberto</span>
                      ) : (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Fechado</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showSuccess && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-fade-in flex items-center gap-3">
          <span className="text-xl">✅</span>
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
