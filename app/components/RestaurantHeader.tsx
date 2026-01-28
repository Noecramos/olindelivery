import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";


interface HeaderProps {
    name?: string;
    image?: string;
    banner?: string;
    rating?: string;
    address?: string;
    deliveryTime?: string;
    restaurantId?: string;
    ratingSum?: number;
    ratingCount?: number;
    instagram?: string;
    whatsapp?: string;
}

export default function RestaurantHeader({ name = "OlinDelivery", image, banner, rating = "4.9", address, deliveryTime = "30-45 min", restaurantId, ratingSum, ratingCount, instagram, whatsapp }: HeaderProps) {
    const { user, logout } = useAuth();
    const [config, setConfig] = useState<any>({
        headerBgColor: 'transparent'
    });

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setConfig(data);
            })
            .catch(console.error);
    }, []);

    const formatAddressForLink = (addr: string) => {
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
    };

    return (
        <div className="relative mb-8">
            {/* Marketplace Top Bar - IDENTICAL TO MAIN PAGE */}
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

            {/* Content Section - Displayed below Top Bar */}
            <div className="container relative mt-4 pb-4 px-4 flex flex-col items-center md:items-start md:flex-row gap-6 z-10">
                {/* Logo */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex-shrink-0">
                    <Image
                        src={image || "https://i.imgur.com/iWSJGep.png"}
                        alt={name || "Logo"}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Text Info */}
                <div className="text-center md:text-left text-gray-900 flex-1 md:mt-2">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight leading-tight">{name}</h1>
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-sm md:text-base font-medium text-gray-600 mb-2">
                        <div className="flex items-center gap-3">
                            <span>{deliveryTime}</span>
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                        {address && (
                            <a
                                href={formatAddressForLink(address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-all px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer font-bold shadow-sm hover:shadow active:scale-95 border border-blue-100"
                            >
                                <span className="text-lg">📍</span>
                                <span>Como Chegar</span>
                            </a>
                        )}

                        {instagram && (
                            <a
                                href={`https://instagram.com/${instagram.replace('@', '').replace('https://instagram.com/', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 border border-purple-400"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                Instagram
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

