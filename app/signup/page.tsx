"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

function SignupForm() {
    const { register } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';
    const [cpfError, setCpfError] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        cpf: "",
        zipCode: "",
        address: ""
    });

    // Address parts
    const [addressParts, setAddressParts] = useState({
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: ""
    });

    // CPF Validation Function - validates check digits
    const validateCPF = (cpf: string): boolean => {
        const cleanCPF = cpf.replace(/\D/g, '');

        // Must have 11 digits
        if (cleanCPF.length !== 11) return false;

        // Check for known invalid patterns (all same digits)
        if (/^(\d)\1+$/.test(cleanCPF)) return false;

        // Validate first check digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

        // Validate second check digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

        return true;
    };

    // Format CPF as XXX.XXX.XXX-XX
    const formatCPF = (value: string): string => {
        const clean = value.replace(/\D/g, '').slice(0, 11);
        if (clean.length <= 3) return clean;
        if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
        if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
        return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
    };

    const handleCPFChange = (value: string) => {
        const formatted = formatCPF(value);
        setForm(prev => ({ ...prev, cpf: formatted }));

        const clean = formatted.replace(/\D/g, '');
        if (clean.length === 11) {
            if (validateCPF(clean)) {
                setCpfError("");
            } else {
                setCpfError("CPF inválido");
            }
        } else {
            setCpfError("");
        }
    };

    const handleZipCode = async (val: string) => {
        const clean = val.replace(/\D/g, '');
        setForm(prev => ({ ...prev, zipCode: val }));

        if (clean.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setAddressParts(prev => ({
                        ...prev,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf
                    }));
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    const updateAddress = () => {
        const { street, number, neighborhood, city, state, complement } = addressParts;
        if (street && city) {
            let full = `${street}, ${number}`;
            if (complement) full += ` (${complement})`;
            full += `, ${neighborhood}, ${city} - ${state}`;
            return full;
        }
        return form.address;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate CPF before submission
        const cleanCPF = form.cpf.replace(/\D/g, '');
        if (cleanCPF.length === 11 && !validateCPF(cleanCPF)) {
            setCpfError("CPF inválido. Por favor, verifique.");
            return;
        }

        setLoading(true);

        const finalAddress = updateAddress();

        const success = await register({
            ...form,
            address: finalAddress || form.address // Fallback
        });

        setLoading(false);
        if (success) {
            router.push(returnUrl);
        }
    };

    return (
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 animate-fade-in-up">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Criar Conta</h1>
                <p className="text-gray-500 mt-2">Preencha seus dados para agilizar seus pedidos</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                    <input
                        id="name"
                        name="name"
                        required
                        className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                </div>

                {/* CPF Field */}
                <div>
                    <label htmlFor="cpf" className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
                    <div className="relative">
                        <input
                            id="cpf"
                            name="cpf"
                            required
                            className={`w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 ${cpfError ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-[#EA1D2C]'}`}
                            placeholder="000.000.000-00"
                            value={form.cpf}
                            onChange={e => handleCPFChange(e.target.value)}
                            maxLength={14}
                        />
                        {form.cpf.replace(/\D/g, '').length === 11 && !cpfError && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                        )}
                    </div>
                    {cpfError && <p className="text-red-500 text-xs mt-1">{cpfError}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input
                            id="email"
                            name="email"
                            required
                            type="email"
                            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
                        <input
                            id="password"
                            name="password"
                            required
                            type="password"
                            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">WhatsApp / Telefone</label>
                    <input
                        id="phone"
                        name="phone"
                        required
                        className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#EA1D2C]"
                        placeholder="(81) 99999-9999"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                </div>

                {/* Address Section */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-2 text-sm">Endereço de Entrega</h3>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="col-span-1">
                            <input
                                id="zipCode"
                                name="zipCode"
                                placeholder="CEP"
                                className="w-full p-2 bg-white rounded-lg border border-gray-300 outline-none text-sm"
                                value={form.zipCode}
                                onChange={e => handleZipCode(e.target.value)}
                                maxLength={9}
                            />
                        </div>
                        <div className="col-span-2">
                            <input
                                id="street"
                                name="street"
                                placeholder="Rua / Logradouro"
                                readOnly
                                className="w-full p-2 bg-gray-100 rounded-lg border border-gray-200 outline-none text-sm text-gray-500"
                                value={addressParts.street}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        <div className="col-span-1">
                            <input
                                id="number"
                                name="number"
                                placeholder="Nº"
                                className="w-full p-2 bg-white rounded-lg border border-gray-300 outline-none text-sm"
                                value={addressParts.number}
                                onChange={e => setAddressParts({ ...addressParts, number: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-1">
                            <input
                                id="complement"
                                name="complement"
                                placeholder="Comp."
                                className="w-full p-2 bg-white rounded-lg border border-gray-300 outline-none text-sm"
                                value={addressParts.complement}
                                onChange={e => setAddressParts({ ...addressParts, complement: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <input
                                id="neighborhood"
                                name="neighborhood"
                                placeholder="Bairro"
                                className="w-full p-2 bg-gray-100 rounded-lg border border-gray-200 outline-none text-sm text-gray-500"
                                value={addressParts.neighborhood}
                                readOnly
                            />
                        </div>
                    </div>
                </div>


                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#EA1D2C] hover:bg-[#C51623] text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all text-lg disabled:opacity-50"
                >
                    {loading ? "Cadastrando..." : "Cadastrar"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-500">
                    Já tem conta?{" "}
                    <Link href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} className="text-[#EA1D2C] font-bold hover:underline">
                        Fazer Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center py-8 px-4">
            <Suspense fallback={<div className="text-center">Carregando...</div>}>
                <SignupForm />
            </Suspense>
        </div>
    );
}
