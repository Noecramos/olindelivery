"use client";

import Image from "next/image";

interface ProductCardProps {
    item: {
        id: string | number;
        name: string;
        description: string;
        price: number;
        category: string;
        image?: string;
        isCombo?: boolean;
        comboItems?: any[];
    };
    onAdd: () => void;
}

export default function ProductCard({ item, onAdd }: ProductCardProps) {
    const isCombo = item.isCombo;
    const comboItemsList = isCombo && item.comboItems ? item.comboItems.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') : '';

    // Calculate savings
    let savingsEl = null;
    if (isCombo && item.comboItems) {
        const total = item.comboItems.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
        const savings = total - item.price;
        if (savings > 0) {
            const percent = Math.round((savings / total) * 100);
            savingsEl = (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 mt-1 inline-block">
                    -{percent}% OFF
                </span>
            );
        }
    }

    return (
        <div className="product-card group relative" onClick={onAdd}>

            {/* Combo Badge */}
            {isCombo && (
                <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border border-white/20 animate-pulse">
                    🎁 COMBO
                </div>
            )}

            {/* Image Section */}
            <div className="product-image-wrapper">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="product-image-transition"
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", background: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "2.5rem", color: "#ccc" }}>{isCombo ? '🎁' : '🍔'}</span>
                    </div>
                )}

                {/* Product Share Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Create deep link for product
                        const shareUrl = new URL(window.location.href);
                        shareUrl.searchParams.set('produto', item.id.toString());
                        const finalUrl = shareUrl.toString();

                        const text = `Olha esse produto: ${item.name} por ${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}!`;

                        if (navigator.share) {
                            navigator.share({
                                title: item.name,
                                text: text,
                                url: finalUrl,
                            }).catch(console.error);
                        } else {
                            navigator.clipboard.writeText(`${text} ${finalUrl}`);
                            alert("Link do produto copiado!");
                        }
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md z-10 hover:scale-110 transition-transform"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>
            </div>

            {/* Content Section */}
            <div style={{ padding: "0.75rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate" style={{ color: "var(--text)", marginBottom: "0.25rem", fontSize: "0.9rem" }}>{item.name}</h3>
                        {savingsEl}
                    </div>

                    <p className="line-clamp-2" style={{ color: "var(--text-secondary)", fontSize: "0.75rem", lineHeight: "1.3" }}>
                        {isCombo
                            ? (item.description || comboItemsList)
                            : item.description}
                    </p>
                    {isCombo && comboItemsList && item.description && (
                        <p className="line-clamp-1 mt-1 text-[10px] text-gray-500 font-medium">
                            Inclui: {comboItemsList}
                        </p>
                    )}
                </div>

                <div className="flex justify-between items-center" style={{ marginTop: "auto" }}>
                    <span style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "1rem" }}>
                        {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <button className="add-btn group-hover:bg-[#EA1D2C] group-hover:text-white transition-colors">
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}
