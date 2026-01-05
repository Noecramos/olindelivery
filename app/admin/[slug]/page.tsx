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
    const [showHistory, setShowHistory] = useState(false);

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

    const handleLogin = async () => {
        try {
            const res = await fetch('/api/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, password })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setAuth(true);
            } else {
                alert('Senha incorreta');
            }
        } catch (error) {
            alert('Erro ao verificar senha');
        }
    };

    // Calculate chart data
    // Calculate chart data
    const chartData = orders.map(o => {
        let dateObj = new Date(o.createdAt);
        if (isNaN(dateObj.getTime())) {
            // Fallback for potential simple date strings or errors
            dateObj = new Date();
        }
        return {
            date: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            sales: o.total,
            rawDate: dateObj
        };
    }).reduce((acc: any[], curr) => {
        const found = acc.find(x => x.date === curr.date);
        if (found) found.sales += curr.sales;
        else acc.push(curr);
        return acc;
    }, [])
        .sort((a: any, b: any) => a.rawDate - b.rawDate)
        .slice(-7)
        .map(x => ({ date: x.date, sales: x.sales }));

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
            <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
                {/* Header Banner */}
                <div className="h-48 md:h-64 w-full bg-cover bg-center relative" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                </div>

                <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-8 lg:px-12 pt-8 z-10 pb-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">{restaurant.name}</h1>
                        <p className="text-gray-600 text-sm font-medium">Área Administrativa</p>
                    </div>

                    <div className="card max-w-sm w-full p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white rounded-3xl animate-fade-in-up">
                        <div className="text-center mb-6">
                            {restaurant.image && <img src={restaurant.image} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-100 shadow-sm object-cover" />}
                        </div>

                        <input
                            id="adminPassword"
                            name="adminPassword"
                            type="password"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4 focus:ring-2 focus:ring-[#EA1D2C] outline-none transition-all"
                            placeholder="Senha de Acesso"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button onClick={handleLogin} className="w-full bg-[#EA1D2C] hover:bg-[#C51623] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                            Entrar
                        </button>
                    </div>
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

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F5F5F7]">
                {/* Dashboard Banner */}
                <div className="h-48 md:h-64 w-full shrink-0 relative bg-cover bg-center" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-8 flex flex-col min-h-full">

                        <div className="flex-1">
                            {tab === 'dashboard' && (
                                <div className="space-y-6 animate-fade-in">
                                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight text-gray-800">Visão Geral</h1>
                                            <p className="text-gray-600 text-sm font-medium">Acompanhe o desempenho da sua loja em tempo real.</p>
                                        </div>
                                        <span className="text-xs text-green-700 bg-white backdrop-blur px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
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
                                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                            <h3 className="font-bold text-lg text-gray-900">Últimos Pedidos</h3>
                                            <button
                                                onClick={() => setShowHistory(!showHistory)}
                                                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${showHistory ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                            >
                                                {showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
                                            </button>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {orders
                                                .filter(o => showHistory ? true : o.status !== 'sent')
                                                .map(order => (
                                                    <div key={order.id} className={`p-5 flex flex-wrap md:flex-nowrap items-center justify-between transition-colors group ${order.status === 'sent' ? 'bg-gray-50 opacity-75 grayscale-[0.5]' : 'hover:bg-gray-50'}`}>
                                                        <div className="flex items-center gap-5 mb-2 md:mb-0">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-inner ${order.status === 'sent' ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
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
                                                                    {order.paymentMethod === 'money' ? `Dinheiro ` : (order.paymentMethod?.toUpperCase() || '-')}
                                                                    {order.changeFor && <span className="text-xs text-orange-500 block">(Troco p/ {order.changeFor})</span>}
                                                                </p>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="font-bold text-gray-900 text-lg">{order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                                                        order.status === 'sent' ? 'bg-gray-100 text-gray-600' :
                                                                            'bg-green-100 text-green-700'
                                                                    }`}>
                                                                    {order.status === 'pending' ? 'Pendente' :
                                                                        order.status === 'preparing' ? 'Em Preparo' :
                                                                            order.status === 'sent' ? 'Enviado' : order.status}
                                                                </span>

                                                                {order.status === 'pending' && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!confirm('Aprovar este pedido?')) return;
                                                                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'preparing' } : o));
                                                                            try {
                                                                                await fetch('/api/orders', {
                                                                                    method: 'PUT',
                                                                                    headers: { 'Content-Type': 'application/json' },
                                                                                    body: JSON.stringify({ id: order.id, status: 'preparing' })
                                                                                });
                                                                            } catch (error) { fetchOrders(); }
                                                                        }}
                                                                        className="ml-3 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold uppercase shadow-sm"
                                                                    >
                                                                        Aprovar
                                                                    </button>
                                                                )}
                                                                {order.status === 'preparing' && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!confirm('Marcar como enviado?')) return;
                                                                            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'sent' } : o));
                                                                            try {
                                                                                await fetch('/api/orders', {
                                                                                    method: 'PUT',
                                                                                    headers: { 'Content-Type': 'application/json' },
                                                                                    body: JSON.stringify({ id: order.id, status: 'sent' })
                                                                                });
                                                                            } catch (error) { fetchOrders(); }
                                                                        }}
                                                                        className="ml-3 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold uppercase shadow-sm"
                                                                    >
                                                                        Enviar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            {orders.filter(o => showHistory ? true : o.status !== 'sent').length === 0 && (
                                                <div className="p-10 text-center text-gray-400">
                                                    {showHistory ? 'Nenhum pedido encontrado.' : 'Nenhum pedido pendente.'}
                                                </div>
                                            )}
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
                                                            } catch (e) { alert('Erro de conexão'); }
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

                            {/* Footer */}
                            <footer className="text-center text-gray-400 text-xs py-4 mt-auto">
                                © 2025 Noviapp Mobile Apps • <a href="http://www.noviapp.com.br" target="_blank" className="hover:underline">www.noviapp.com.br</a> • OlindAki & OlinDelivery
                            </footer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
