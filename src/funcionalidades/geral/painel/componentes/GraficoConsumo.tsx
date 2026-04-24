import { useState, useEffect, useMemo } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";

export function GraficoConsumo() {
    const [isMounted, setIsMounted] = useState(false);
    const materiais = usarArmazemMateriais((s) => s.materiais);

    // 🧮 CÁLCULO DE DADOS REAIS
    const dadosGrafico = useMemo(() => {
        const hoje = new Date();
        const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
        
        // Inicializa os últimos 7 dias com zero
        const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
            const data = new Date();
            data.setDate(hoje.getDate() - (6 - i));
            return {
                dataStr: data.toISOString().split('T')[0],
                nome: diasSemana[data.getDay()],
                valor: 0
            };
        });

        // Agrega o consumo real de todos os materiais
        materiais.forEach(material => {
            const historico = Array.isArray(material.historicoUso) ? material.historicoUso : [];
            historico.forEach(registro => {
                const dataRegistro = new Date(Number(registro.id)).toISOString().split('T')[0];
                const diaEncontrado = ultimos7Dias.find(d => d.dataStr === dataRegistro);
                if (diaEncontrado) {
                    diaEncontrado.valor += registro.quantidadeGastaGramas;
                }
            });
        });

        return ultimos7Dias;
    }, [materiais]);

    useEffect(() => {
        // Aguarda um pouco mais para garantir que o layout CSS (Tailwind) terminou de processar
        const construtor = setTimeout(() => setIsMounted(true), 150);
        return () => clearTimeout(construtor);
    }, []);

    return (
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[450px]">
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

            <div className="h-[300px] w-full relative min-h-[300px] overflow-hidden">
                {isMounted && (
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <AreaChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
