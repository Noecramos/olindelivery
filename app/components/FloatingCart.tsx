"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface FloatingCartProps {
    count: number;
    total: number;
}

export default function FloatingCart({ count, total }: FloatingCartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || count === 0) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: "0",
            left: "0",
            right: "0",
            padding: "1rem",
            background: "linear-gradient(to top, white 80%, transparent)",
            zIndex: 50
        }}>
            <div className="container" style={{ padding: 0 }}>
                <Link href="/checkout">
                    <button className="btn btn-primary btn-full flex justify-between items-center" style={{ padding: "1rem", borderRadius: "8px", boxShadow: "0 4px 12px rgba(234, 29, 44, 0.4)" }}>
                        <div className="flex items-center gap-2">
                            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>
                                {count}
                            </div>
                            <span>Ver sacola</span>
                        </div>
                        <span className="font-bold">
                            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </button>
                </Link>
            </div>
        </div>
    );
}
