
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptionValue {
    name: string;
    price: number;
}

interface ProductOption {
    name: string;
    type: 'single' | 'multiple';
    required: boolean;
    min?: number;
    max?: number;
    values: OptionValue[];
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onAddToCart: (item: any) => void;
}

export default function ProductModal({ isOpen, onClose, product, onAddToCart }: ProductModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<any>({});
    const [observation, setObservation] = useState("");
    const [totalPrice, setTotalPrice] = useState(0);

    // Reset state when product opens
    useEffect(() => {
        if (isOpen && product) {
            setQuantity(1);
            setSelectedOptions({});
            setObservation("");
            setTotalPrice(Number(product.price));
        }
    }, [isOpen, product]);

    // Calculate total price whenever state changes
    useEffect(() => {
        if (!product) return;

        let extras = 0;

        // Loop through selected options to sum price
        Object.keys(selectedOptions).forEach(optionName => {
            const selection = selectedOptions[optionName];
            if (Array.isArray(selection)) {
                // Multiple selection
                selection.forEach((val: any) => extras += Number(val.price || 0));
            } else {
                // Single selection
                extras += Number(selection.price || 0);
            }
        });

        setTotalPrice((Number(product.price) + extras) * quantity);
    }, [quantity, selectedOptions, product]);

    if (!isOpen || !product) return null;

    const handleOptionChange = (optionName: string, value: any, type: 'single' | 'multiple') => {
        setSelectedOptions((prev: any) => {
            const newState = { ...prev };

            if (type === 'single') {
                newState[optionName] = value;
            } else {
                const current = newState[optionName] || [];
                const existIndex = current.findIndex((v: any) => v.name === value.name);

                if (existIndex >= 0) {
                    // Remove if exists
                    newState[optionName] = current.filter((v: any) => v.name !== value.name);
                } else {
                    // Add
                    newState[optionName] = [...current, value];
                }
            }
            return newState;
        });
    };

    const handleAddToCart = () => {
        // Validate required options
        if (product.options) {
            for (const opt of product.options) {
                if (opt.required && !selectedOptions[opt.name]) {
                    alert(`Por favor, selecione uma opção para "${opt.name}"`);
                    return;
                }
                if (opt.type === 'multiple' && opt.min && (!selectedOptions[opt.name] || selectedOptions[opt.name].length < opt.min)) {
                    alert(`Por favor, selecione pelo menos ${opt.min} opções para "${opt.name}"`);
                    return;
                }
                if (opt.type === 'multiple' && opt.max && selectedOptions[opt.name] && selectedOptions[opt.name].length > opt.max) {
                    alert(`Por favor, selecione no máximo ${opt.max} opções para "${opt.name}"`);
                    return;
                }
            }
        }

        // Generate a unique ID for cart item
        const optionsString = JSON.stringify(selectedOptions);
        // Simple hash for ID
        let hash = 0;
        for (let i = 0; i < optionsString.length; i++) {
            const char = optionsString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        const cartItemId = `${product.id}-${hash}`;

        onAddToCart({
            id: cartItemId,
            productId: product.id,
            restaurantId: product.restaurantId,
            name: product.name,
            price: totalPrice / quantity, // Store unit price with extras
            quantity: quantity,
            image: product.image,
            category: product.category,
            selectedOptions: Object.entries(selectedOptions).map(([key, value]) => ({ name: key, selection: value })),
            observation
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 md:p-4">
            <div
                className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up md:animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Image */}
                <div className="relative h-48 md:h-56 bg-gray-100 flex-shrink-0">
                    {product.image ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-4xl bg-gray-200 text-gray-400">
                            🍔
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all z-10"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 leading-tight">{product.name}</h2>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">{product.description}</p>
                        <div className="mt-2 text-green-600 font-bold text-lg">
                            {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </div>

                    {/* Options */}
                    {(() => {
                        let opts: ProductOption[] = [];
                        try {
                            if (Array.isArray(product.options)) opts = product.options;
                            else if (typeof product.options === 'string') opts = JSON.parse(product.options);
                        } catch (e) { opts = []; }

                        if (opts && opts.length > 0) {
                            return opts.map((opt: ProductOption, idx: number) => {
                                const safeType = opt.type?.toLowerCase() || 'single';

                                return (
                                    <div key={idx} className="space-y-3 pb-4 border-b border-gray-100">

                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-gray-700">
                                                {opt.name}
                                                {opt.required && <span className="ml-2 text-red-500 text-xs uppercase bg-red-50 px-2 py-0.5 rounded-full">Obrigatório</span>}
                                            </h3>
                                            {opt.max && safeType === 'multiple' && <span className="text-xs text-gray-400">Max: {opt.max}</span>}
                                        </div>

                                        <div className="space-y-2">
                                            {opt.values && opt.values.map((val: OptionValue, vIdx: number) => {
                                                const isSelected = safeType === 'single'
                                                    ? selectedOptions[opt.name]?.name === val.name
                                                    : (selectedOptions[opt.name] || []).some((v: any) => v.name === val.name);

                                                return (
                                                    <label
                                                        key={vIdx}
                                                        className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                            ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                                                            : 'border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type={safeType === 'single' ? 'radio' : 'checkbox'}
                                                                name={`option-${idx}-${opt.name}`}
                                                                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 pointer-events-none"
                                                                checked={!!isSelected}
                                                                onChange={() => handleOptionChange(opt.name, val, safeType as any)}
                                                            />
                                                            <span className="text-sm font-medium text-gray-700">{val.name}</span>
                                                        </div>
                                                        {val.price > 0 && (
                                                            <span className="text-xs font-bold text-green-700">
                                                                + {val.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </span>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            });
                        }
                    })()}

                    {/* Observations */}
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2">Alguma observação?</h3>
                        <textarea
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                            rows={3}
                            placeholder="Ex: Tirar a cebola, maionese à parte..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between gap-4 pb-8 md:pb-4">
                    <div className="flex items-center border border-gray-300 rounded-xl p-1">
                        <button
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg text-lg font-bold"
                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        >
                            -
                        </button>
                        <span className="w-8 text-center font-bold text-gray-800">{quantity}</span>
                        <button
                            className="w-10 h-10 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-lg text-lg font-bold"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            +
                        </button>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-[#EA1D2C] hover:bg-[#C51623] text-white p-4 rounded-xl font-bold flex justify-between items-center shadow-lg transition-transform active:scale-95"
                    >
                        <span>Adicionar</span>
                        <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
