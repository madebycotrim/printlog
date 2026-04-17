import { useState, useEffect } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

const DADOS_GRAFICO = [
    { nome: "Seg", valor: 400 },
    { nome: "Ter", valor: 300 },
    { nome: "Qua", valor: 600 },
    { nome: "Qui", valor: 800 },
    { nome: "Sex", valor: 500 },
    { nome: "Sab", valor: 900 },
    { nome: "Dom", valor: 700 },
];

export function GraficoConsumo() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const construtor = setTimeout(() => setIsMounted(true), 50);
        return () => clearTimeout(construtor);
    }, []);

    return (
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black tracking-tight dark:text-white">Consumo de Filamento</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Gramas consumidas por dia nesta semana</p>
                </div>
                <select className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold px-3 py-2 outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                    <option>Últimos 7 dias</option>
                    <option>Últimos 30 dias</option>
                </select>
            </div>

            <div className="h-[300px] w-full">
                {isMounted && (
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <AreaChart data={DADOS_GRAFICO}>
                            <defs>
                                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--cor-primaria)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--cor-primaria)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                            <XAxis
                                dataKey="nome"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#18181b',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                cursor={{ stroke: "var(--cor-primaria)", strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="valor"
                                stroke="var(--cor-primaria)"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorValor)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
