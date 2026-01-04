"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { SalesChart, TopProductsChart, StatusPieChart } from "../../components/admin/Charts";
import ProductForm from "../../components/admin/ProductForm";
import CategoryForm from "../../components/admin/CategoryForm";

export default function StoreAdmin() {
    const params = useParams();
    const slug = params?.slug as string;

    const [auth, setAuth] = useState(false);
    const [password, setPassword] = useState("");
    const [restaurant, setRestaurant] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [tab, setTab] = useState('dashboard'); // dashboard | products | categories | settings

    // Fetch Restaurant Info
    useEffect(() => {
        if (!slug) return;
        fetch(`/api/restaurants?slug=${slug}`)
            .then(res => res.ok ? res.json() : null)
            .then(setRestaurant)
            .catch(console.error);
    }, [slug]);

    // Fetch Orders when Auth is true
    const fetchOrders = async () => {
        if (!restaurant) return;
        const res = await fetch(`/api/orders?restaurantId=${restaurant.id}`);
        const data = await res.json();
        setOrders(data);
    };

    // Fetch Orders when Auth is true
    useEffect(() => {
        if (!auth || !restaurant) return;
        fetchOrders();
        // Polling for Real-Time updates
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [auth, restaurant]);

    const handleLogin = () => {
        if (password === 'admin') setAuth(true);
        else alert('Senha incorreta');
    };

    // Calculate chart data
    const chartData = orders.map(o => ({
        date: new Date(o.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        sales: o.total
    })).reduce((acc: any[], curr) => {
        const found = acc.find(x => x.date === curr.date);
        if (found) found.sales += curr.sales;
        else acc.push(curr);
        return acc;
    }, []).slice(-7);

    const topProducts = orders.flatMap(o => o.items).reduce((acc: any, item: any) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
        return acc;
    }, {});

    const topProductsData = Object.entries(topProducts).map(([name, count]) => ({ name: name, count: count })).sort((a: any, b: any) => b.count - a.count).slice(0, 5);

    // Prepare Pie Chart Data (Status)
    const statusData = [
        { name: 'Entregue', value: orders.filter(o => o.status === 'delivered').length },
        { name: 'Enviado', value: orders.filter(o => o.status === 'sent').length },
        { name: 'Pendente', value: orders.filter(o => o.status === 'pending').length },
        { name: 'Cancelado', value: orders.filter(o => o.status === 'cancelled').length },
        { name: 'Preparo', value: orders.filter(o => o.status === 'preparing').length },
    ].filter(i => i.value > 0);

    if (!restaurant) return <div className="p-10 text-center">Carregando loja...</div>;

    if (!auth) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F7]">
                <div className="card max-w-sm w-full p-8 shadow-xl bg-white/80 backdrop-blur-md rounded-2xl">
                    <div className="text-center mb-6">
                        {restaurant.image && <img src={restaurant.image} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-md" />}
                        <h2 className="text-xl font-bold text-gray-800">{restaurant.name}</h2>
                        <p className="text-sm text-gray-500">Área Administrativa</p>
                    </div>

                    <input
                        id="adminPassword"
                        name="adminPassword"
                        type="password"
                        className="w-full p-3 bg-gray-50 border-none rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Senha de Acesso"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin} className="w-full bg-[#EA1D2C] hover:bg-[#C51623] text-white font-bold py-3 rounded-xl transition-all shadow-md">
                        Entrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col md:flex-row">
            {/* Sidebar (Responsive) */}
            <aside className="w-full md:w-20 lg:w-64 bg-white/80 backdrop-blur-xl border-r border-[#D1D1D6] md:h-screen sticky top-0 flex md:flex-col z-20 justify-between md:justify-start px-4 md:px-0">
                <div className="p-4 md:p-6 border-b border-[#D1D1D6]/50 flex items-center md:justify-center lg:justify-start gap-3">
                    {restaurant.image && <img src={restaurant.image} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200" />}
                    <span className="font-bold truncate text-sm hidden lg:block">{restaurant.name}</span>
                </div>

                <nav className="flex md:flex-col gap-2 p-2 md:p-4 overflow-x-auto md:overflow-visible no-scrollbar">
                    <button onClick={() => setTab('dashboard')} className={`p-3 rounded-xl transition-all flex items-center gap-3 ${tab === 'dashboard' ? 'bg-red-50 text-[#EA1D2C] font-bold shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>
                        <span className="text-xl">📊</span> <span className="hidden lg:block">Dashboard</span>
                    </button>
                    <button onClick={() => setTab('products')} className={`p-3 rounded-xl transition-all flex items-center gap-3 ${tab === 'products' ? 'bg-red-50 text-[#EA1D2C] font-bold shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>
                        <span className="text-xl">🍔</span> <span className="hidden lg:block">Produtos</span>
                    </button>
                    <button onClick={() => setTab('categories')} className={`p-3 rounded-xl transition-all flex items-center gap-3 ${tab === 'categories' ? 'bg-red-50 text-[#EA1D2C] font-bold shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>
                        <span className="text-xl">🏷️</span> <span className="hidden lg:block">Categorias</span>
                    </button>
                    <button onClick={() => setTab('settings')} className={`p-3 rounded-xl transition-all flex items-center gap-3 ${tab === 'settings' ? 'bg-red-50 text-[#EA1D2C] font-bold shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>
                        <span className="text-xl">⚙️</span> <span className="hidden lg:block">Configurações</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content Area - Centered Container */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-8">

                    {tab === 'dashboard' && (
                        <div className="space-y-6 animate-fade-in">
                            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Visão Geral</h1>
                                    <p className="text-gray-500 text-sm">Acompanhe o desempenho da sua loja em tempo real.</p>
                                </div>
                                <span className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-sm border border-green-100">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Atualização em Tempo Real
                                </span>
                            </header>

                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-32 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow duration-300">
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Vendas Hoje</h3>
                                    <p className="text-4xl font-bold text-[#EA1D2C] tracking-tight">
                                        {orders.reduce((acc, o) => acc + o.total, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-32 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow duration-300">
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total de Pedidos</h3>
                                    <p className="text-4xl font-bold text-gray-800 tracking-tight">{orders.length}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between h-32 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow duration-300">
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ticket Médio</h3>
                                    <p className="text-4xl font-bold text-green-600 tracking-tight">
                                        {(orders.reduce((acc, o) => acc + o.total, 0) / (orders.length || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                            </div>

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Pie Chart - Status */}
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center w-full min-w-0">
                                    <h3 className="font-bold text-gray-800 mb-4 w-full text-left">Status dos Pedidos</h3>
                                    <StatusPieChart data={statusData} />
                                </div>

                                {/* Line Chart - Sales (Takes up 2 columns) */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-w-0">
                                    <h3 className="font-bold text-gray-800 mb-4">Vendas por Período</h3>
                                    <SalesChart data={chartData} />
                                </div>
                            </div>

                            {/* Recent Orders Cards */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-bold text-lg text-gray-900">Últimos Pedidos</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {orders.filter(o => o.status !== 'sent').map(order => (
                                        <div key={order.id} className="p-5 flex flex-wrap md:flex-nowrap items-center justify-between hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center gap-5 mb-2 md:mb-0">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shadow-inner">
                                                    #{order.ticketNumber || '...'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">{order.customer.name}</p>
                                                    <p className="text-sm text-gray-500 font-medium">
                                                        {order.items.length} itens • {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 font-semibold uppercase">Pagamento</p>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {order.paymentMethod === 'money' ? `Dinheiro ` : order.paymentMethod?.toUpperCase() || '-'}
                                                        {order.changeFor && <span className="text-xs text-orange-500 block">(Troco p/ {order.changeFor})</span>}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 text-lg">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                        {order.status === 'pending' ? 'Pendente' : (order.status === 'preparing' ? 'Em Preparo' : order.status)}
                                                    </span>
                                                    {order.status === 'pending' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Aprovar este pedido?')) return;

                                                                // Optimistic Update
                                                                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'preparing' } : o));

                                                                try {
                                                                    const res = await fetch('/api/orders', {
                                                                        method: 'PUT',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ id: order.id, status: 'preparing' })
                                                                    });
                                                                    if (!res.ok) throw new Error('Falha ao atualizar');
                                                                } catch (error) {
                                                                    alert('Erro ao aprovar pedido. Tente novamente.');
                                                                    fetchOrders(); // Revert if failed
                                                                }
                                                            }}
                                                            className="ml-3 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold uppercase shadow-sm transition-all"
                                                        >
                                                            Aprovar
                                                        </button>
                                                    )}
                                                    {order.status === 'preparing' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Marcar como enviado? O pedido sairá da lista.')) return;

                                                                // Optimistic Update
                                                                setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'sent' } : o));

                                                                try {
                                                                    const res = await fetch('/api/orders', {
                                                                        method: 'PUT',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ id: order.id, status: 'sent' })
                                                                    });
                                                                    if (!res.ok) throw new Error('Falha ao atualizar');
                                                                } catch (error) {
                                                                    alert('Erro ao enviar pedido. Tente novamente.');
                                                                    fetchOrders(); // Revert
                                                                }
                                                            }}
                                                            className="ml-3 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold uppercase shadow-sm transition-all"
                                                        >
                                                            Enviar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && <div className="p-10 text-center text-gray-400">Nenhum pedido hoje.</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other Tabs handled generically with centered containers */}
                    {(tab !== 'dashboard') && (
                        <div className="animate-fade-in bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
                            {tab === 'products' && (
                                <>
                                    <h2 className="text-2xl font-bold mb-6">Meus Produtos</h2>
                                    <ProductForm restaurantId={restaurant.id} onSave={() => alert('Salvo!')} />
                                </>
                            )}
                            {tab === 'categories' && (
                                <>
                                    <h2 className="text-2xl font-bold mb-6">Categorias do Menu</h2>
                                    <CategoryForm restaurantId={restaurant.id} onSave={() => alert('Salvo!')} />
                                </>
                            )}
                            {tab === 'settings' && (
                                <div className="max-w-xl mx-auto text-center py-10">
                                    <h2 className="text-2xl font-bold mb-4">Status da Loja</h2>
                                    <button
                                        onClick={async () => {
                                            const newStatus = !restaurant.isOpen;
                                            // Optimistic UI
                                            setRestaurant((prev: any) => ({ ...prev, isOpen: newStatus }));

                                            try {
                                                await fetch('/api/restaurants', {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ id: restaurant.id, isOpen: newStatus })
                                                });
                                            } catch (e) {
                                                alert('Erro ao atualizar status');
                                                setRestaurant((prev: any) => ({ ...prev, isOpen: !newStatus }));
                                            }
                                        }}
                                        className={`w-full py-4 text-xl font-bold rounded-2xl transition-all transform hover:scale-105 shadow-xl ${restaurant.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                                    >
                                        {restaurant.isOpen ? '🟢 LOJA ABERTA (Clique para Fechar)' : '🔴 LOJA FECHADA (Clique para Abrir)'}
                                    </button>
                                    <p className="mt-4 text-gray-500 text-sm">
                                        {restaurant.isOpen
                                            ? 'Sua loja está visível para os clientes e aceitando novos pedidos.'
                                            : 'Sua loja aparece como "Fechada" e não aceita novos pedidos.'}
                                    </p>

                                    <div className="mt-10 text-left">
                                        <label className="block text-gray-700 font-bold mb-2">Tempo de Entrega</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200"
                                                placeholder="Ex: 30-45 min"
                                                value={restaurant.deliveryTime || ''}
                                                onChange={(e) => setRestaurant({ ...restaurant, deliveryTime: e.target.value })}
                                            />
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch('/api/restaurants', {
                                                            method: 'PUT',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ id: restaurant.id, deliveryTime: restaurant.deliveryTime })
                                                        });
                                                        if (res.ok) alert('Tempo de entrega atualizado!');
                                                        else alert('Erro ao salvar');
                                                    } catch (e) {
                                                        alert('Erro de conexão');
                                                    }
                                                }}
                                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                                            >
                                                Salvar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
