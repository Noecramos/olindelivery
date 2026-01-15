"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function MainHeader() {
    const { user, logout } = useAuth();
    const [config, setConfig] = useState<any>({
        headerImage: 'https://rfbwcz2lzvkh4d7s.public.blob.vercel-storage.com/olindelivery-favicon.jpg',
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
        <div
            className="relative pt-8 px-6 pb-4 flex justify-center items-center sticky top-0 z-40 bg-opacity-95 backdrop-blur-md transition-all duration-300 shadow-lg rounded-b-3xl bg-center bg-cover bg-no-repeat h-48"
            style={{
                backgroundColor: config.headerBackgroundType === 'image' ? 'transparent' : (config.headerBgColor || '#FFD700'),
                backgroundImage: config.headerBackgroundType === 'image' ? `url('${config.headerBackgroundImage}')` : 'none',
            }}
        >
            {/* Logo in the center */}
            <div className="w-48 h-24 flex items-center justify-center">
                <Link href="/">
                    <Image
                        src={config.headerImage || "https://rfbwcz2lzvkh4d7s.public.blob.vercel-storage.com/olindelivery-favicon.jpg"}
                        alt="Logo"
                        width={200}
                        height={80}
                        style={{ objectFit: 'contain' }}
                        priority
                        unoptimized
                    />
                </Link>
            </div>

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

            {/* Back Button (Only visible on subpages) */}
            <div className="absolute top-4 left-4 z-[60]">
                <button
                    onClick={() => window.history.back()}
                    className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40 transition-all md:hidden"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
