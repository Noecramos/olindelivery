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
    };
    onAdd: () => void;
}

export default function ProductCard({ item, onAdd }: ProductCardProps) {
    return (
        <div className="product-card" onClick={onAdd}>

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
                        <span style={{ fontSize: "2.5rem", color: "#ccc" }}>🍔</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div style={{ padding: "0.75rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                    <h3 className="font-medium truncate" style={{ color: "var(--text)", marginBottom: "0.25rem", fontSize: "0.9rem" }}>{item.name}</h3>
                    <p className="line-clamp-2" style={{ color: "var(--text-secondary)", fontSize: "0.75rem", lineHeight: "1.3" }}>{item.description}</p>
                </div>

                <div className="flex justify-between items-center" style={{ marginTop: "auto" }}>
                    <span style={{ color: "var(--primary)", fontWeight: "bold", fontSize: "1rem" }}>
                        {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <button className="add-btn">
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}
