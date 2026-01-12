"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { SalesChart, TopProductsChart, StatusPieChart } from "../../components/admin/Charts";
import ProductForm from "../../components/admin/ProductForm";
import CategoryForm from "../../components/admin/CategoryForm";
import RestaurantSettings from "../../components/admin/RestaurantSettings";

export const dynamic = 'force-dynamic';

export default function StoreAdmin() {
    const params = useParams();
    const slug = params?.slug as string;
    const router = useRouter();

    const [auth, setAuth] = useState(false);
    const [password, setPassword] = useState("");
    const [restaurant, setRestaurant] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [tab, setTab] = useState('dashboard'); // dashboard | products | categories | settings
    const [showHistory, setShowHistory] = useState(false);
    const [catRefresh, setCatRefresh] = useState(0);

    // Check localStorage for existing session
    useEffect(() => {
        if (!slug) return;
        const savedAuth = localStorage.getItem(`admin_auth_${slug}`);
        if (savedAuth === 'true') {
            setAuth(true);
        }
    }, [slug]);

    // Fetch Restaurant Info
    const fetchRestaurant = async () => {
        if (!slug) return;
        try {
            const res = await fetch(`/api/restaurants?slug=${slug}`);
            if (res.ok) {
                const data = await res.json();
                setRestaurant(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Fetch Restaurant Info
    useEffect(() => {
        fetchRestaurant();
    }, [slug]);

    // Fetch Orders when Auth is true
    const fetchOrders = async () => {
        if (!restaurant) return;
        const res = await fetch(`/api/orders?restaurantId=${restaurant.id}&_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
            const serverOrders = await res.json();

            setOrders(prevOrders => {
                if (!prevOrders || prevOrders.length === 0) return serverOrders;

                const statusRank: any = { 'pending': 0, 'preparing': 1, 'sent': 2, 'delivered': 3, 'cancelled': 4 };

                return serverOrders.map((serverOrder: any) => {
                    const localOrder = prevOrders.find(p => p.id === serverOrder.id);

                    if (localOrder) {
                        // Check priorities to prevent stale read overwriting optimistic update
                        const localStatus = localOrder.status?.toLowerCase();
                        const serverStatus = serverOrder.status?.toLowerCase();

                        const localRank = statusRank[localStatus] || 0;
                        const serverRank = statusRank[serverStatus] || 0;

                        // If Local is ahead (e.g. Preparing vs Pending), keep Local Status
                        if (localRank > serverRank) {
                            return { ...serverOrder, status: localOrder.status };
                        }
                    }
                    return serverOrder;
                });
            });
        }
    };

    // Fetch Orders when Auth is true
    useEffect(() => {
        if (!auth || !restaurant) return;
        fetchOrders();
        // Polling for Real-Time updates
        const interval = setInterval(fetchOrders, 3000);
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
                // Save to localStorage
                localStorage.setItem(`admin_auth_${slug}`, 'true');
            } else {
                alert('Senha incorreta');
            }
        } catch (error) {
            alert('Erro ao verificar senha');
        }
    };

    const handleLogout = () => {
        setAuth(false);
        localStorage.removeItem(`admin_auth_${slug}`);
        setPassword("");
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
            vendas: o.total,
            rawDate: dateObj
        };
    }).reduce((acc: any[], curr) => {
        const found = acc.find(x => x.date === curr.date);
        if (found) found.vendas += curr.vendas;
        else acc.push(curr);
        return acc;
    }, [])
        .sort((a: any, b: any) => a.rawDate - b.rawDate)
        .slice(-7)
        .map(x => ({ date: x.date, vendas: x.vendas }));

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
            <div className="min-h-screen bg-gradient-to-br from-[#F5F5F7] to-[#E8E8EA] flex flex-col items-center justify-center py-8 px-4">
                <div className="w-full max-w-lg">
                    {/* Header Banner - Same width as card */}
                    <div className="h-32 md:h-40 w-full bg-cover bg-center relative rounded-t-3xl overflow-hidden shadow-lg" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                    </div>

                    {/* Content Card */}
                    <div className="bg-white rounded-b-3xl shadow-2xl p-8 md:p-10 animate-fade-in-up">
                        <div className="text-center mb-8">
                            {restaurant.image ? (
                                <img
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-xl object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-xl bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-2xl">
                                    {restaurant.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{restaurant.name}</h1>
                            <p className="text-gray-500 font-medium">Área Administrativa</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="adminPassword" className="block text-sm font-bold text-gray-700 mb-2">Senha de Acesso</label>
                                <input
                                    id="adminPassword"
                                    name="adminPassword"
                                    type="password"
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#EA1D2C] focus:ring-4 focus:ring-[#EA1D2C]/10 outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleLogin()}
                                />
                            </div>
                            <button
                                onClick={handleLogin}
                                className="w-full bg-gradient-to-r from-[#EA1D2C] to-[#C51623] hover:from-[#C51623] hover:to-[#A01419] text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                            >
                                Entrar no Painel →
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

    const printDailyReport = () => {
        const today = new Date();

        // Filter orders for today (exclude cancelled for revenue, but maybe keep for record? usually exclude for "Closing")
        const dailyOrders = orders.filter(o => {
            if (!o.createdAt) return false;
            const d = new Date(o.createdAt);
            const isToday = d.getDate() === today.getDate() &&
                d.getMonth() === today.getMonth() &&
                d.getFullYear() === today.getFullYear();
            const isValid = o.status !== 'cancelled';
            return isToday && isValid;
        });

        const totalSales = dailyOrders.reduce((acc, o) => acc + o.total, 0);
        const totalOrders = dailyOrders.length;
        const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Payment Methods
        const payments: any = { pix: 0, card: 0, money: 0 };
        const paymentsCount: any = { pix: 0, card: 0, money: 0 };

        dailyOrders.forEach(o => {
            const method = o.paymentMethod === 'card' ? 'card' : o.paymentMethod === 'pix' ? 'pix' : 'money';
            payments[method] += o.total;
            paymentsCount[method] += 1;
        });

        // Top Products
        const itemsMap: any = {};
        dailyOrders.forEach(o => {
            o.items.forEach((i: any) => {
                itemsMap[i.name] = (itemsMap[i.name] || 0) + i.quantity;
            });
        });
        const sortedItems = Object.entries(itemsMap).sort((a: any, b: any) => b[1] - a[1]);

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>Fechamento - ${today.toLocaleDateString('pt-BR')}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; color: #000; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .divider { border-top: 1px dashed black; margin: 10px 0; }
                        .bold { font-weight: bold; }
                        .flex { display: flex; justify-content: space-between; margin-bottom: 3px; }
                        .section { margin-bottom: 15px; }
                        .footer { text-align: center; margin-top: 30px; font-size: 10px; }
                        .title { font-size: 14px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="bold" style="font-size: 16px;">${restaurant.name}</div>
                        <br>
                        <div style="font-size: 14px; font-weight: bold;">FECHAMENTO DE CAIXA</div>
                        <div>${today.toLocaleString('pt-BR')}</div>
                    </div>

                    <div class="divider"></div>

                    <div class="section">
                        <div class="title">RESUMO GERAL</div>
                        <div class="flex"><span>Faturamento Total:</span> <span class="bold">${totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        <div class="flex"><span>Pedidos Realizados:</span> <span>${totalOrders}</span></div>
                        <div class="flex"><span>Ticket Médio:</span> <span>${avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                    </div>

                    <div class="divider"></div>

                    <div class="section">
                        <div class="title">Balanço por Pagamento</div>
                        <div class="flex"><span>PIX (${paymentsCount.pix}):</span> <span>${payments.pix.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        <div class="flex"><span>Cartão (${paymentsCount.card}):</span> <span>${payments.card.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        <div class="flex"><span>Dinheiro (${paymentsCount.money}):</span> <span>${payments.money.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                    </div>

                    <div class="divider"></div>

                    <div class="section">
                        <div class="title">Produtos Vendidos (Top 10)</div>
                        ${sortedItems.length === 0 ? '<div>Nenhum item vendido.</div>' : ''}
                        ${sortedItems.slice(0, 10).map(([name, qty]) => `
                            <div class="flex"><span>${qty}x ${name}</span></div>
                        `).join('')}
                    </div>

                    <div class="divider"></div>
                    
                    <div class="footer">
                        Relatório Gerado por<br>
                        <strong>OlinDelivery Sistema</strong>
                    </div>

                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to render then print
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    };


    const printOrder = (order: any) => {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) return;

        const itemsHtml = order.items.map((item: any) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${item.quantity}x ${item.name}</span>
                <span>${(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
        `).join('');

        const subtotal = order.subtotal || order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        const deliveryFee = order.deliveryFee || 0;

        const html = `
            <html>
                <head>
                    <title>Pedido #${order.ticketNumber}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .divider { border-top: 1px dashed black; margin: 10px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                        .bold { font-weight: bold; }
                        .flex { display: flex; justify-content: space-between; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="bold" style="font-size: 16px;">${restaurant.name}</div>
                        <div>Pedido #${order.ticketNumber}</div>
                        <div>${new Date().toLocaleString('pt-BR')}</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div>
                        <div class="bold">Cliente: ${order.customer.name}</div>
                        <div>${order.customer.phone}</div>
                        <div>${order.customer.address}</div>
                        ${order.customer.zipCode ? `<div>CEP: ${order.customer.zipCode}</div>` : ''}
                    </div>

                    <div class="divider"></div>
                    
                    <div>
                        <div class="bold" style="margin-bottom: 10px;">ITENS:</div>
                        ${itemsHtml}
                    </div>

                    <div class="divider"></div>
                    
                    <div style="margin-bottom: 10px;">
                        <div class="flex">
                            <span>Subtotal:</span>
                            <span>${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div class="flex">
                            <span>Taxa de Entrega:</span>
                            <span>${deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    </div>
                    
                    <div class="flex bold" style="font-size: 14px;">
                        <span>TOTAL:</span>
                        <span>${order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    
                    <div style="margin-top: 10px;">
                        Pagamento: ${order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}
                        ${order.changeFor ? `<br>Troco para: R$ ${order.changeFor}` : ''}
                    </div>

                    ${order.observations ? `
                        <div class="divider"></div>
                        <div class="bold">OBSERVACÕES:</div>
                        <div>${order.observations}</div>
                    ` : ''}

                    <div class="divider"></div>
                    <div class="footer">
                        OlinDelivery
                    </div>

                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to render then print
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col md:flex-row">
            {/* Sidebar (Responsive) */}
            <aside className="w-full md:w-20 lg:w-64 bg-white/80 backdrop-blur-xl border-r border-[#D1D1D6] md:h-screen sticky top-0 flex md:flex-col z-20 justify-between md:justify-start px-4 md:px-0">
                <div className="p-4 md:p-6 border-b border-[#D1D1D6]/50 flex items-center md:justify-center lg:justify-start gap-3">
                    {restaurant.image ? (
                        <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-gray-200"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs">
                            {restaurant.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    )}
                    <span className="font-bold truncate text-sm hidden lg:block">{restaurant.name}</span>
                </div>

                <nav className="flex md:flex-col gap-2 p-2 md:p-4 overflow-x-auto md:overflow-visible no-scrollbar">
                    <button onClick={() => setTab('dashboard')} className={`p-3 rounded-xl transition-all flex items-center gap-3 ${tab === 'dashboard' ? 'bg-red-50 text-[#EA1D2C] font-bold shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>
                        <span className="text-xl">📊</span> <span className="hidden lg:block">Painel</span>
                    </button>
                    <button onClick={() => setTab('products')} className={`p-3 rounded-xl transition-all flex items-center gap-3 ${tab === 'products' ? 'bg-red-50 text-[#EA1D2C] font-bold shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>
                        <span className="text-xl">🍔</span> <span className="hidden lg:block">Produtos</span>
                    </button>

                    <button onClick={() => setTab('settings')} className={`p-3 rounded-xl transition-all flex items-center gap-3 ${tab === 'settings' ? 'bg-red-50 text-[#EA1D2C] font-bold shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}>
                        <span className="text-xl">⚙️</span> <span className="hidden lg:block">Configurações</span>
                    </button>
                    <a href="https://wa.me/558183920320" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl transition-all flex items-center gap-3 hover:bg-green-50 text-[#25D366] hover:text-[#128C7E] mt-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        <span className="hidden lg:block">Suporte</span>
                    </a>

                    <button onClick={handleLogout} className="p-3 rounded-xl transition-all flex items-center gap-3 hover:bg-red-50 text-gray-600 hover:text-red-600">
                        <span className="text-xl">🚪</span> <span className="hidden lg:block">Sair</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#F5F5F7] to-[#E8E8EA] p-4 md:p-8">
                <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
                    {/* Header Banner - Same width as the content below */}
                    <div className="h-32 md:h-40 w-full bg-cover bg-center relative rounded-t-3xl overflow-hidden shadow-xl shrink-0" style={{ backgroundImage: "url('https://i.imgur.com/s2H2qZE.png')" }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
                        <div className="absolute bottom-4 left-6 text-white z-10">
                            <h2 className="text-xl font-bold">{restaurant.name}</h2>
                            <p className="text-xs opacity-90 font-medium">Painel Administrativo</p>
                        </div>
                    </div>

                    {/* Content Card area */}
                    <div className="w-full bg-white rounded-b-3xl shadow-2xl p-6 md:p-8 min-h-[calc(100vh-16rem)]">
                        <div className="w-full space-y-8 flex flex-col h-full">

                            <div className="flex-1">
                                {tab === 'dashboard' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                                            <div>
                                                <h1 className="text-3xl font-bold tracking-tight text-gray-800">Visão Geral</h1>
                                                <p className="text-gray-600 text-sm font-medium">Acompanhe o desempenho da sua loja em tempo real.</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={printDailyReport}
                                                    className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-black shadow-lg transition-transform hover:-translate-y-0.5"
                                                >
                                                    🖨️ Fechar Caixa
                                                </button>
                                                <span className="text-xs text-green-700 bg-white backdrop-blur px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                    Online
                                                </span>
                                            </div>
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
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setShowHistory(!showHistory)}
                                                        className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${showHistory ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                                    >
                                                        {showHistory ? 'Apenas Hoje' : 'Ver Histórico'}
                                                    </button>
                                                    {showHistory && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Tem certeza que deseja apagar permanentemente o histórico de pedidos concluídos?')) return;
                                                                try {
                                                                    // restaurant.id might be numeric or string, need to ensure we access it correctly
                                                                    const restId = restaurant?.id;
                                                                    if (!restId) return;
                                                                    await fetch(`/api/orders?restaurantId=${restId}&clearHistory=true`, { method: 'DELETE' });
                                                                    fetchOrders();
                                                                } catch (e) { alert('Erro ao limpar'); }
                                                            }}
                                                            className="text-xs font-bold px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 flex items-center gap-1"
                                                            title="Limpar Histórico"
                                                        >
                                                            🗑️ Limpar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-6">
                                                {orders
                                                    .filter(o => {
                                                        const status = o.status?.toLowerCase() || '';
                                                        // Moved 'sent' to history so it disappears from main view when 'Enviar' is clicked
                                                        const isHistory = ['sent', 'delivered', 'cancelled'].includes(status);

                                                        if (showHistory) return isHistory;
                                                        if (isHistory) return false;

                                                        try {
                                                            const orderDate = new Date(o.createdAt);
                                                            const now = new Date();
                                                            const hoursSince = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
                                                            const isToday = orderDate.toDateString() === now.toDateString();
                                                            return isToday || hoursSince < 18;
                                                        } catch (e) {
                                                            return true;
                                                        }
                                                    })
                                                    .map(order => (
                                                        <div key={order.id} className="p-6 bg-white rounded-3xl shadow-md border border-gray-100 transition-all hover:shadow-lg relative overflow-hidden">
                                                            {/* Compact Header */}
                                                            <div className="flex justify-between items-center mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xl font-black text-[#EA1D2C]">#{order.ticketNumber || '...'}</span>
                                                                    <span className="text-xs text-gray-400">
                                                                        {(() => {
                                                                            try {
                                                                                if (!order.createdAt) return 'Agora';
                                                                                let date = new Date(order.createdAt);
                                                                                if (isNaN(date.getTime())) return 'Agora';
                                                                                return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                                                            } catch (e) { return '-'; }
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                                                        order.status === 'sent' ? 'bg-green-100 text-green-700' :
                                                                            'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {order.status === 'pending' ? 'Pendente' :
                                                                        order.status === 'preparing' ? 'Preparo' :
                                                                            order.status === 'sent' ? 'Enviado' : order.status}
                                                                </span>
                                                            </div>

                                                            <hr className="border-gray-200 mb-3" />

                                                            {/* Customer Info - Compact */}
                                                            <div className="mb-3 text-sm">
                                                                <p className="font-bold text-gray-900">{order.customer.name}</p>
                                                                <p className="text-gray-500 text-xs">{order.customer.address}</p>
                                                            </div>

                                                            {/* Items - Compact List */}
                                                            <div className="mb-3 space-y-1">
                                                                {order.items.map((item: any, idx: number) => (
                                                                    <div key={idx} className="flex justify-between text-xs">
                                                                        <span className="text-gray-600">
                                                                            <span className="font-bold text-gray-900">{item.quantity}x</span> {item.name}
                                                                        </span>
                                                                        <span className="text-gray-400">
                                                                            {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Observations - Compact */}
                                                            {order.observations && (
                                                                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                                                                    ⚠️ {order.observations}
                                                                </div>
                                                            )}

                                                            {/* Delivery Fee Display */}
                                                            {(order.deliveryFee && order.deliveryFee > 0) && (
                                                                <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs">
                                                                    <div className="flex justify-between text-gray-600">
                                                                        <span>Subtotal:</span>
                                                                        <span className="font-medium">
                                                                            {(order.subtotal || order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between text-gray-600 mt-1">
                                                                        <span>Taxa de Entrega:</span>
                                                                        <span className="font-medium">
                                                                            {order.deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Footer - Total & Actions */}
                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                                                <div>
                                                                    <span className="text-lg font-black text-gray-900">
                                                                        {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                    </span>
                                                                    <span className="ml-2 text-[10px] text-gray-500 uppercase">
                                                                        {order.paymentMethod === 'pix' ? 'PIX' :
                                                                            order.paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}
                                                                    </span>
                                                                </div>

                                                                {/* Action Buttons - Compact */}
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => printOrder(order)}
                                                                        className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                                                                        title="Imprimir Pedido"
                                                                    >
                                                                        <span className="text-2xl">🖨️</span>
                                                                    </button>
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
                                                                            className="px-3 py-1 bg-black text-white hover:bg-gray-800 rounded-lg text-[10px] font-bold uppercase"
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
                                                                            className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-[10px] font-bold uppercase"
                                                                        >
                                                                            Enviar
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                                {orders.filter(o => {
                                                    const status = o.status?.toLowerCase() || '';
                                                    const isHistory = ['sent', 'delivered', 'cancelled'].includes(status);

                                                    if (showHistory) return isHistory;
                                                    if (isHistory) return false;

                                                    try {
                                                        const orderDate = new Date(o.createdAt);
                                                        const now = new Date();
                                                        const hoursSince = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
                                                        const isToday = orderDate.toDateString() === now.toDateString();
                                                        return isToday || hoursSince < 18;
                                                    } catch (e) {
                                                        return true;
                                                    }
                                                }).length === 0 && (
                                                        <div className="p-10 text-center text-gray-400">
                                                            {showHistory ? 'Nenhum pedido encontrado.' : 'Aguardando novos pedidos...'}
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
                                            <div className="space-y-12">
                                                <div>
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">Configuração de Categorias</h2>
                                                    </div>
                                                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                                                        <CategoryForm restaurantId={restaurant.id} onSave={() => setCatRefresh(Date.now())} />
                                                    </div>
                                                </div>

                                                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">Catálogo de Produtos</h2>
                                                    </div>
                                                    <ProductForm restaurantId={restaurant.id} onSave={() => alert('Salvo!')} refreshCategories={catRefresh} />
                                                </div>
                                            </div>
                                        )}
                                        {tab === 'settings' && (
                                            <div className="py-8">
                                                <RestaurantSettings
                                                    restaurant={restaurant}
                                                    onUpdate={(data: any) => {
                                                        if (data?.slug && data.slug !== slug) {
                                                            alert('A URL da sua loja mudou. Redirecionando...');
                                                            router.replace(`/admin/${data.slug}`);
                                                        } else {
                                                            fetchRestaurant();
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Area - Outside the white card */}
                    <footer className="w-full text-center text-gray-500 text-xs py-8 mt-2">
                        © 2025 Noviapp Mobile Apps • <a href="http://www.noviapp.com.br" target="_blank" className="hover:text-[#EA1D2C] transition-colors">www.noviapp.com.br</a> • OlindAki & OlinDelivery
                    </footer>
                </div >

            </main >
        </div >
    );
}
