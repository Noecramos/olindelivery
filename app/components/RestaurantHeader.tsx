import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";

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
}

export default function RestaurantHeader({ name = "OlinDelivery", image, banner, rating = "4.9", address, deliveryTime = "30-45 min", restaurantId, ratingSum, ratingCount }: HeaderProps) {
    const { user, logout } = useAuth();
    const [config, setConfig] = useState<any>({
        headerBgColor: '#FFD700'
    });

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setConfig(data);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="relative mb-8">
            {/* Marketplace Top Bar - IDENTICAL TO MAIN PAGE */}
            <div
                className="relative pt-8 px-6 pb-4 flex justify-center items-center sticky top-0 z-40 bg-opacity-95 backdrop-blur-md transition-all duration-300 shadow-lg rounded-b-3xl bg-center bg-cover bg-no-repeat h-56"
                style={{
                    backgroundColor: config.headerBackgroundType === 'image' ? 'transparent' : (config.headerBgColor || '#FFD700'),
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
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-sm md:text-base font-medium text-gray-600">
                        <div className="flex items-center gap-3">
                            <StarRating restaurantId={restaurantId || ''} initialSum={ratingSum || 0} initialCount={ratingCount || 0} />
                            <span></span>
                            <span>•</span>
                            <span>•</span>
                            <span>{deliveryTime}</span>
                        </div>
                        {address && (
                            <>
                                <span className="hidden md:inline">•</span>
                                <span className="opacity-80 text-xs md:text-sm bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">📍 {address}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

