"use client";

import { useState } from "react";

interface CategoryNavProps {
    categories: string[];
    activeCategory: string;
    onSelect: (cat: string) => void;
}

export default function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
    return (
        <div className="sticky-nav" style={{ overflowX: "auto", whiteSpace: "nowrap", padding: "10px 0", scrollbarWidth: "none" }}>
            <div className="flex gap-2" style={{ padding: "0 1rem" }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onSelect(cat)}
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: "20px",
                            border: activeCategory === cat ? "1px solid var(--primary)" : "1px solid transparent",
                            background: activeCategory === cat ? "white" : "#f2f2f2",
                            color: activeCategory === cat ? "var(--primary)" : "var(--text-secondary)",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            transition: "all 0.2s"
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
