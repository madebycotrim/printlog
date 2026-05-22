import { useState, useEffect, useMemo } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    CartesianGrid,
    YAxis
} from "recharts";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";

export function GraficoConsumo() {
    const [isMounted, setIsMounted] = useState(false);
    const materiais = useArmazemMateriais((s) => s.materiais);

    const dadosGrafico = useMemo(() => {
        const hoje = new Date();
        const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
        
        const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
            const data = new Date();
            data.setDate(hoje.getDate() - (6 - i));
            return {
                dataStr: data.toISOString().split('T')[0],
                nome: diasSemana[data.getDay()],
                valor: 0
            };
        });

        materiais.forEach(material => {
            const historico = Array.isArray(material.historicoUso) ? material.historicoUso : [];
            historico.forEach(registro => {
                const dataRaw = registro.data;
                if (!dataRaw) return;
                
                const d = new Date(dataRaw);
                if (isNaN(d.getTime())) return;

                const dataRegistro = d.toISOString().split('T')[0];
                const diaEncontrado = ultimos7Dias.find(d => d.dataStr === dataRegistro);
                if (diaEncontrado) {
                    diaEncontrado.valor += registro.quantidadeGastaGramas;
                }
            });
        });

        return ultimos7Dias;
    }, [materiais]);

    useEffect(() => {
        const construtor = setTimeout(() => setIsMounted(true), 300);
        return () => clearTimeout(construtor);
    }, []);

    return (
        <div className="bg-card border border-borda-sutil rounded-3xl p-8 shadow-media relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/5 blur-[100px] pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex flex-col">
                    <h3 className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">Consumo Semanal</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-primary tracking-tighter">Fluxo MP</span>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest italic">Real-time</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-borda-sutil text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                        Grama (g)
                    </div>
                </div>
            </div>

            <div className="h-[280px] w-full relative z-10">
                {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dadosGrafico} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis
                                dataKey="nome"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 9, fontWeight: 900 }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4' }}
                                contentStyle={{
                                    backgroundColor: '#0c0c0e',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                                }}
                                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                labelStyle={{ display: 'none' }}
                                formatter={(value: any) => [`${value}g`, 'CONSUMO']}
                            />
                            <Area
                                type="monotone"
                                dataKey="valor"
                                stroke="#0ea5e9"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorConsumo)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

