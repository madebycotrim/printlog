import React from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl">
                <p className="text-xs text-zinc-500 font-bold uppercase mb-1">{label}</p>
                {payload.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span className="text-zinc-400">{item.name}:</span>
                        <span className="font-mono font-bold text-white">{item.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Revenue Line Chart
export const RevenueLineChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#52525b" style={{ fontSize: 10 }} />
                <YAxis stroke="#52525b" style={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} name="Receita" />
                <Line type="monotone" dataKey="custo" stroke="#f43f5e" strokeWidth={2} name="Custo" />
                <Line type="monotone" dataKey="lucro" stroke="#0ea5e9" strokeWidth={2} name="Lucro" />
            </LineChart>
        </ResponsiveContainer>
    );
};

// Cost Distribution Pie Chart
export const CostPieChart = ({ data }) => {
    const COLORS = ['#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6'];

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    );
};

// Sparkline (Mini chart for KPIs)
export const Sparkline = ({ data, color = "#0ea5e9" }) => {
    return (
        <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Area type="monotone" dataKey="value" stroke={color} fill={`${color}20`} strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// Bar Chart for comparisons
export const ComparisonBarChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#52525b" style={{ fontSize: 10 }} />
                <YAxis stroke="#52525b" style={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};
