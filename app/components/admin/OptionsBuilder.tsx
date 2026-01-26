
"use client";

import { useState, useEffect } from "react";

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

interface OptionsBuilderProps {
    initialOptions: string; // JSON string
    onChange: (json: string) => void;
}

export default function OptionsBuilder({ initialOptions, onChange }: OptionsBuilderProps) {
    const [options, setOptions] = useState<ProductOption[]>([]);

    // Parse initial JSON
    useEffect(() => {
        try {
            if (initialOptions && initialOptions.trim()) {
                const parsed = JSON.parse(initialOptions);
                if (Array.isArray(parsed)) {
                    setOptions(parsed);
                }
            } else {
                setOptions([]);
            }
        } catch (e) {
            console.error("Invalid JSON:", e);
        }
    }, [initialOptions]);

    // Update parent when sorting or modifying
    const updateOptions = (newOptions: ProductOption[]) => {
        setOptions(newOptions);
        onChange(JSON.stringify(newOptions, null, 2));
    };

    const addGroup = () => {
        const newGroup: ProductOption = {
            name: "Nova Opção",
            type: "single",
            required: true,
            values: [
                { name: "Opção 1", price: 0 }
            ]
        };
        updateOptions([...options, newGroup]);
    };

    const removeGroup = (idx: number) => {
        if (confirm("Remover este grupo de opções?")) {
            const newOptions = [...options];
            newOptions.splice(idx, 1);
            updateOptions(newOptions);
        }
    };

    const updateGroup = (idx: number, field: keyof ProductOption, value: any) => {
        const newOptions = [...options];
        newOptions[idx] = { ...newOptions[idx], [field]: value };
        updateOptions(newOptions);
    };

    const addValue = (groupIdx: number) => {
        const newOptions = [...options];
        newOptions[groupIdx].values.push({ name: "Nova Opção", price: 0 });
        updateOptions(newOptions);
    };

    const removeValue = (groupIdx: number, valIdx: number) => {
        const newOptions = [...options];
        newOptions[groupIdx].values.splice(valIdx, 1);
        updateOptions(newOptions);
    };

    const updateValue = (groupIdx: number, valIdx: number, field: keyof OptionValue, value: any) => {
        const newOptions = [...options];
        newOptions[groupIdx].values[valIdx] = { ...newOptions[groupIdx].values[valIdx], [field]: value };
        updateOptions(newOptions);
    };

    return (
        <div className="space-y-4 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
            <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-500 uppercase">Configuração de Opções</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={addGroup}
                        className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 font-bold shadow-sm transition-all"
                    >
                        + Adicionar Grupo
                    </button>
                </div>
            </div>

            {options.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                    Nenhuma opção configurada.<br />Clique em "Adicionar Grupo" para começar.
                </div>
            ) : (
                <div className="space-y-4">
                    {options.map((group, gIdx) => (
                        <div key={gIdx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative group">
                            <button
                                type="button"
                                onClick={() => removeGroup(gIdx)}
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1"
                            >
                                ✕
                            </button>

                            {/* Group Header */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Título do Grupo</label>
                                    <input
                                        value={group.name}
                                        onChange={(e) => updateGroup(gIdx, 'name', e.target.value)}
                                        className="w-full text-sm font-bold border-b border-gray-200 focus:border-blue-500 outline-none pb-1"
                                        placeholder="Ex: Tamanho"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Tipo</label>
                                        <select
                                            value={group.type}
                                            onChange={(e) => updateGroup(gIdx, 'type', e.target.value)}
                                            className="w-full text-sm border-b border-gray-200 focus:border-blue-500 outline-none pb-1 bg-transparent appearance-none"
                                        >
                                            <option value="single">Única Escolha (Radio)</option>
                                            <option value="multiple">Múltipla Escolha (Checkbox)</option>
                                        </select>
                                        <div className="absolute right-0 bottom-2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={group.required}
                                                onChange={(e) => updateGroup(gIdx, 'required', e.target.checked)}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-xs font-medium text-gray-600">Obrigatório</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Values List */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Opções de Escolha</label>
                                {group.values.map((val, vIdx) => (
                                    <div key={vIdx} className="flex gap-2 items-center">
                                        <input
                                            value={val.name}
                                            onChange={(e) => updateValue(gIdx, vIdx, 'name', e.target.value)}
                                            className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                                            placeholder="Nome (Ex: P, M, G)"
                                        />
                                        <div className="relative">
                                            <span className="absolute left-2 top-1.5 text-xs text-gray-400">R$</span>
                                            <input
                                                type="number"
                                                value={val.price}
                                                onChange={(e) => updateValue(gIdx, vIdx, 'price', Number(e.target.value))}
                                                className="w-20 text-sm border border-gray-200 rounded pl-6 pr-2 py-1 outline-none focus:border-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeValue(gIdx, vIdx)}
                                            className="text-gray-300 hover:text-red-500 px-1"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addValue(gIdx)}
                                    className="text-xs text-blue-500 hover:text-blue-700 font-medium mt-1 inline-flex items-center gap-1"
                                >
                                    + Adicionar Opção
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
