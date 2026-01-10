"use client";

import { useEffect, useState } from "react";
import RestaurantSettings from "../../components/admin/RestaurantSettings";
import GlobalConfigForm from "../../components/admin/GlobalConfigForm";

export default function SuperAdmin() {
    const [auth, setAuth] = useState(false);
    const [password, setPassword] = useState("");
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [editingRestaurant, setEditingRestaurant] = useState<any>(null);
    const [tab, setTab] = useState<'restaurants' | 'config'>('restaurants');

    // Check localStorage for existing session
    useEffect(() => {
        const savedAuth = localStorage.getItem('super_admin_auth');
        if (savedAuth === 'true') {
            setAuth(true);
        }
    }, []);

    useEffect(() => {
        if (auth) fetchRestaurants();
    }, [auth]);

    const fetchRestaurants = async () => {
        try {
            const res = await fetch(`/api/restaurants?all=true&t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            setRestaurants(data);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleApproval = async (restaurant: any) => {
        const newStatus = !restaurant.approved;
        try {
            const res = await fetch('/api/restaurants', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: restaurant.id, approved: newStatus })
            });

            const data = await res.json();
            const finalPassword = data.password || restaurant.password;

            if (newStatus) {
                // Update local state to show password immediately
                setRestaurants(prev => prev.map(r => r.id === restaurant.id ? { ...r, approved: true, password: finalPassword } : r));

                // Send WhatsApp
                const phone = restaurant.whatsapp || restaurant.phone;
                if (phone) {
                    let cleanPhone = phone.replace(/\D/g, '');
                    // Ensure country code 55 is present
                    if (!cleanPhone.startsWith('55') && cleanPhone.length > 0) {
                        cleanPhone = '55' + cleanPhone;
                    }
                    const message = `Olá, ${restaurant.responsibleName || 'Parceiro'}! %0A%0ASua loja *${restaurant.name}* foi aprovada no OlinDelivery! 🚀%0A%0AAcesse seu painel administrativo:%0ALink: https://olindelivery.vercel.app/admin/${restaurant.slug}%0A%0A*Suas Credenciais:*%0ALogin: ${restaurant.slug}%0ASenha: ${finalPassword}%0A%0ABoas vendas!`;
                    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
                } else {
                    alert('Restaurante aprovado! Senha gerada: ' + finalPassword);
                }
            } else {
                setRestaurants(prev => prev.map(r => r.id === restaurant.id ? { ...r, approved: false } : r));
            }
        } catch (e) {
            alert('Erro ao atualizar');
        }
    };

    const resetPassword = async (restaurant: any) => {
        if (!confirm(`Deseja realmente resetar a senha de ${restaurant.name}?`)) return;
        try {
            const res = await fetch('/api/restaurants', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: restaurant.id, resetPassword: true })
            });

            const data = await res.json();
            if (res.ok) {
                setRestaurants(prev => prev.map(r => r.id === restaurant.id ? { ...r, password: data.password } : r));
                alert(`Nova senha de ${restaurant.name}: ${data.password}`);
            }
        } catch (e) {
            alert('Erro ao resetar senha');
        }
    };

    const deleteRestaurant = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este restaurante? Essa ação não pode ser desfeita.')) return;

        try {
            await fetch(`/api/restaurants?id=${id}`, {
                method: 'DELETE',
            });
            fetchRestaurants();
        } catch (e) {
            alert('Erro ao excluir');
        }
    };

    const handleLogin = async () => {
        try {
            const res = await fetch('/api/admin/verify-super', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            if (res.ok) {
                setAuth(true);
                // Save to localStorage
                localStorage.setItem('super_admin_auth', 'true');
            } else {
                alert('Senha inválida');
            }
        } catch (e) {
            alert('Erro ao verificar senha');
        }
    };

    const handleLogout = () => {
        setAuth(false);
        localStorage.removeItem('super_admin_auth');
        setPassword("");
    };

    const handleResetPassword = async () => {
        if (!confirm('Deseja resetar a senha mestra? Uma nova senha será enviada para o e-mail cadastrado.')) return;

        try {
            const res = await fetch('/api/admin/super-reset', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                if (data.tempPassword) {
                    alert(`${data.message}\n\nCOMO O E-MAIL NÃO FOI CONFIGURADO, SUA NOVA SENHA É: ${data.tempPassword}\n\nPor favor, anote-a agora.`);
                } else {
                    alert(data.message);
                }
            } else {
                alert(data.error || 'Erro ao resetar senha');
            }
        } catch (e) {
            alert('Erro de conexão');
        }
    };

    if (!auth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F5F5F7] to-[#E8E8EA] flex flex-col items-center justify-center py-8 px-4">
                <div className="w-full max-w-lg">
                    {/* Header Banner - Same width as card */}
                    <div className="h-32 md:h-40 w-full bg-cover bg-center relative rounded-t-3xl overflow-hidden shadow-lg" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                    </div>

                    {/* Content Card */}
                    <div className="bg-white rounded-b-3xl shadow-2xl p-8 md:p-10 animate-fade-in-up">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Super Admin</h1>
                            <p className="text-gray-500 font-medium">Gestão Global da Plataforma</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="master-password" className="block text-sm font-bold text-gray-700 mb-2">Senha Mestra</label>
                                <input
                                    id="master-password"
                                    name="password"
                                    type="password"
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#EA1D2C] focus:ring-4 focus:ring-[#EA1D2C]/10 outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleLogin()}
                                />
                                <div className="mt-2 text-right">
                                    <button
                                        onClick={handleResetPassword}
                                        className="text-xs text-gray-400 hover:text-[#EA1D2C] transition-colors font-medium"
                                    >
                                        Esqueci minha senha
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleLogin}
                                className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                            >
                                Acessar Gerenciamento →
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="w-full text-center text-gray-500 text-xs py-6 mt-4">
                        © 2025 Noviapp Mobile Apps • <a href="http://www.noviapp.com.br" target="_blank" className="hover:text-[#EA1D2C] transition-colors">www.noviapp.com.br</a>
                    </footer>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F5F7] to-[#E8E8EA] flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-7xl">
                {/* Header Banner - Same width as card */}
                <div className="h-32 md:h-40 w-full bg-cover bg-center relative rounded-t-3xl overflow-hidden shadow-xl" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-6 md:left-8 text-white z-10">
                        <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">Gestão Global</h1>
                        <p className="text-xs md:text-sm font-medium opacity-90">Controle total de parceiros OlinDelivery</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="absolute bottom-4 right-6 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg font-bold hover:bg-white hover:text-red-600 transition-all text-sm border border-white/30"
                    >
                        Sair
                    </button>
                </div>

                {editingRestaurant && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                            <button
                                onClick={() => setEditingRestaurant(null)}
                                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors z-10 font-bold"
                            >
                                ✕
                            </button>
                            <div className="p-8">
                                <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar: {editingRestaurant.name}</h2>
                                <RestaurantSettings
                                    restaurant={editingRestaurant}
                                    onUpdate={() => {
                                        fetchRestaurants();
                                        setEditingRestaurant(null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Card Content */}
                <div className="bg-white rounded-b-3xl shadow-2xl p-6 md:p-8 animate-fade-in-up min-h-[500px]">

                    <div className="flex gap-6 mb-8 border-b border-gray-100 pb-px">
                        <button
                            onClick={() => setTab('restaurants')}
                            className={`pb-4 px-2 font-bold transition-all relative ${tab === 'restaurants' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Restaurantes
                        </button>
                        <button
                            onClick={() => setTab('config')}
                            className={`pb-4 px-2 font-bold transition-all relative ${tab === 'config' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Customização do App
                        </button>
                    </div>

                    {tab === 'restaurants' ? (
                        <div className="overflow-x-auto overflow-hidden rounded-2xl border border-gray-100 shadow-lg animate-fade-in">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="p-6 font-bold text-gray-500 text-xs uppercase tracking-wider">Restaurante</th>
                                        <th className="p-6 font-bold text-gray-500 text-xs uppercase tracking-wider">Slug (Login)</th>
                                        <th className="p-6 font-bold text-gray-500 text-xs uppercase tracking-wider">Senha</th>
                                        <th className="p-6 font-bold text-gray-500 text-xs uppercase tracking-wider text-center">Status</th>
                                        <th className="p-6 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {restaurants.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    {r.image ? (
                                                        <img
                                                            src={r.image}
                                                            alt={r.name}
                                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs border-2 border-white shadow-md">
                                                            {r.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-900 group-hover:text-[#EA1D2C] transition-colors">{r.name}</div>
                                                        <div className="text-xs text-gray-500 font-medium">{r.responsibleName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <code className="bg-blue-50 px-3 py-1 rounded-lg text-xs font-bold text-blue-700">{r.slug || '---'}</code>
                                            </td>
                                            <td className="p-6">
                                                <code className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600">{r.password || '---'}</code>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${r.approved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                                    {r.approved ? 'ATIVO' : 'PENDENTE'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                                                    <button
                                                        onClick={() => setEditingRestaurant(r)}
                                                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Editar Detalhes"
                                                    >
                                                        <span className="text-lg">✏️</span>
                                                    </button>
                                                    <button
                                                        onClick={() => toggleApproval(r)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 ${r.approved ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-[#EA1D2C] hover:bg-[#C51623] text-white'}`}
                                                    >
                                                        {r.approved ? 'Pausar' : 'Aprovar'}
                                                    </button>
                                                    <button
                                                        onClick={() => resetPassword(r)}
                                                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Resetar Senha"
                                                    >
                                                        <span className="text-lg">🔑</span>
                                                    </button>
                                                    <button
                                                        onClick={() => deleteRestaurant(r.id)}
                                                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Excluir"
                                                    >
                                                        <span className="text-lg">🗑️</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {restaurants.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center text-gray-400 font-medium">Nenhum restaurante encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <GlobalConfigForm />
                    )}
                </div>

                {/* Footer outside the card */}
                <footer className="footer text-center text-gray-500 text-xs py-10 mt-2">
                    © 2025 Noviapp Mobile Apps • <a href="http://www.noviapp.com.br" target="_blank" className="hover:text-[#EA1D2C] transition-colors font-medium">www.noviapp.com.br</a> • OlindAki & OlinDelivery
                </footer>
            </div>
        </div>
    );
}
