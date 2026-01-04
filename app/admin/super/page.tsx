"use client";

import { useEffect, useState } from "react";

export default function SuperAdmin() {
    const [auth, setAuth] = useState(false);
    const [password, setPassword] = useState("");
    const [restaurants, setRestaurants] = useState<any[]>([]);

    useEffect(() => {
        if (auth) fetchRestaurants();
    }, [auth]);

    const fetchRestaurants = async () => {
        try {
            const res = await fetch('/api/restaurants?all=true');
            const data = await res.json();
            setRestaurants(data);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleApproval = async (id: string, currentStatus: boolean) => {
        try {
            await fetch('/api/restaurants', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, approved: !currentStatus })
            });
            fetchRestaurants();
        } catch (e) {
            alert('Erro ao atualizar');
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

    if (!auth) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F7]">
                <div className="card max-w-sm w-full p-8 shadow-xl bg-white rounded-2xl">
                    <h1 className="text-xl font-bold text-center mb-6">Super Admin</h1>
                    <input
                        type="password"
                        className="w-full p-3 bg-gray-50 rounded-xl mb-4 outline-none"
                        placeholder="Senha Mestra"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button
                        onClick={() => password === 'master' ? setAuth(true) : alert('Senha inválida')}
                        className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all"
                    >
                        Acessar
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">Gestão Global da Plataforma</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestão de Restaurantes</h1>
                        <p className="text-gray-500">Aprovação e manutenção de parceiros</p>
                    </div>
                    <button onClick={() => setAuth(false)} className="text-red-500 font-bold hover:underline">Sair</button>
                </header>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 font-bold text-gray-500 text-sm uppercase">Restaurante</th>
                                <th className="p-6 font-bold text-gray-500 text-sm uppercase">Acesso</th>
                                <th className="p-6 font-bold text-gray-500 text-sm uppercase">Status</th>
                                <th className="p-6 font-bold text-gray-500 text-sm uppercase text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {restaurants.map((r: any) => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-bold text-gray-900 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                            {r.image && <img src={r.image} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            {r.name}
                                            <p className="text-xs text-gray-400 font-normal">{r.slug}</p>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-sm">
                                            <span className="text-gray-400 text-xs">Senha:</span>
                                            <code className="bg-gray-100 px-2 py-1 rounded ml-2 font-mono text-gray-800">{r.password}</code>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${r.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {r.approved ? 'Aprovado' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right flex gap-2 justify-end">
                                        <button
                                            onClick={() => toggleApproval(r.id, r.approved)}
                                            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${r.approved ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'}`}
                                        >
                                            {r.approved ? 'Revogar' : 'Aprovar'}
                                        </button>
                                        <button
                                            onClick={() => deleteRestaurant(r.id)}
                                            className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all bg-red-50 text-red-600 hover:bg-red-100"
                                            title="Excluir Restaurante"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {restaurants.length === 0 && <div className="p-10 text-center text-gray-400">Nenhum restaurante encontrado.</div>}
                </div>
            </div>
        </div>
    );
}
