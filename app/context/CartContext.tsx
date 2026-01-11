"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    restaurantId?: string;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: string) => void;
    removeOne: (id: string) => void;
    clearCart: () => void;
    total: number;
    subtotal: number;
    count: number;
    deliveryFee: number;
    setDeliveryFee: (fee: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [deliveryFee, setDeliveryFee] = useState<number>(0);

    const addToCart = (product: Omit<CartItem, 'quantity'>) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const removeOne = (id: string) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === id);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.id !== id);
        });
    };

    const clearCart = () => {
        setItems([]);
        setDeliveryFee(0);
    };

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;
    const count = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, removeOne, clearCart, total, subtotal, count, deliveryFee, setDeliveryFee }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
