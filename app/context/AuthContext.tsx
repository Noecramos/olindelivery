"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    zipCode: string;
    address: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    register: (data: any) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await fetch("/api/auth/me", { cache: "no-store" });
            const data = await res.json();
            if (data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, pass: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: pass }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setUser(data.user);
                return true;
            } else {
                alert(data.error || "Erro ao login");
                return false;
            }
        } catch (e) {
            alert("Erro de conexão");
            return false;
        }
    };

    const register = async (formData: any) => {
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setUser(data.user);
                return true;
            } else {
                alert(data.error || "Erro ao cadastrar");
                return false;
            }
        } catch (e) {
            alert("Erro de conexão");
            return false;
        }
    };

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        router.push("/login"); // or root
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
