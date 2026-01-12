"use client";

import { useState } from "react";

interface CategoryNavProps {
    categories: string[];
    activeCategory: string;
    onSelect: (cat: string) => void;
}

export default function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {

    // Helper to auto-generate colorful styles keys based on category name
    const getCategoryStyle = (name: string) => {
        const lower = name.toLowerCase();
        // Check for Pizza
        if (lower.includes('pizza')) return { icon: '🍕', bg: '#FFF5EB', border: '#FFD3A3', text: '#E06C00' };
        // Check for Lanches/Burgers
        if (lower.includes('lanche') || lower.includes('burger') || lower.includes('hamb')) return { icon: '🍔', bg: '#FFEBEE', border: '#FFCDD2', text: '#C62828' };
        // Check for Drinks
        if (lower.includes('bebida') || lower.includes('suco') || lower.includes('refr')) return { icon: '🥤', bg: '#E3F2FD', border: '#BBDEFB', text: '#1565C0' };
        // Check for Acai/Dessert
        if (lower.includes('açaí') || lower.includes('acai') || lower.includes('doce') || lower.includes('sobremesa')) return { icon: '🍧', bg: '#FCE4EC', border: '#F8BBD0', text: '#C2185B' };
        // Check for Combos
        if (lower.includes('combo') || lower.includes('promo')) return { icon: '🏷️', bg: '#F3E5F5', border: '#E1BEE7', text: '#6A1B9A' };
        // Check for Portions/Appetizers
        if (lower.includes('porção') || lower.includes('petisco')) return { icon: '🍟', bg: '#FFF8E1', border: '#FFECB3', text: '#FF6F00' };
        // Default
        return { icon: '', bg: '#F5F5F5', border: '#E0E0E0', text: '#616161' };
    };

    return (
        <div className="sticky-nav" style={{ overflowX: "auto", whiteSpace: "nowrap", padding: "10px 0", scrollbarWidth: "none" }}>
            <div className="flex gap-3" style={{ padding: "0 1rem" }}>
                {categories.map(cat => {
                    const style = getCategoryStyle(cat);
                    const isActive = activeCategory === cat;
                    // If category name already has emoji, don't add another icon
                    const hasEmoji = /\p{Emoji}/u.test(cat);
                    const displayIcon = hasEmoji ? '' : style.icon;

                    return (
                        <button
                            key={cat}
                            onClick={() => onSelect(cat)}
                            className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95"
                            style={{
                                padding: "0.6rem 1.2rem",
                                borderRadius: "16px",
                                border: isActive ? `2px solid ${style.text}` : `1px solid ${style.border}`,
                                background: isActive ? 'white' : style.bg,
                                color: isActive ? style.text : (style.text === '#616161' ? '#424242' : style.text),
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                opacity: isActive ? 1 : 0.9
                            }}
                        >
                            {displayIcon && <span>{displayIcon}</span>}
                            <span>{cat}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
