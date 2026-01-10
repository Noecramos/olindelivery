"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

export function StatusPieChart({ data }: { data: any[] }) {
    const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

    if (!data || data.length === 0) {
        return <div className="text-center text-gray-400 py-10">Sem dados disponíveis</div>;
    }

    return (
        <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function SalesChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-400 py-10">Sem dados disponíveis</div>;
    }

    return (
        <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        cursor={{ stroke: '#EA1D2C', strokeWidth: 1 }}
                    />
                    <Line type="monotone" dataKey="vendas" stroke="#EA1D2C" strokeWidth={3} dot={{ r: 4, fill: '#EA1D2C', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TopProductsChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-400 py-10">Sem dados disponíveis</div>;
    }

    return (
        <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} stroke="#4B5563" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
