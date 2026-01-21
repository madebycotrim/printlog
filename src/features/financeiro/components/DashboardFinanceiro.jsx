import React, { useMemo, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Printer, Zap } from 'lucide-react';
import { formatarMoeda } from '../../../utils/numbers';
import { calcularEstatisticasGlobais, calcularRoiPorImpressora } from '../logic/roi';
import { Sparkline } from '../../../components/charts/ChartComponents';
import { subDays, format, parseISO } from 'date-fns';
import { celebrateGoal } from '../../../utils/confetti';
import { soundSystem } from '../../../utils/soundSystem';

export default function DashboardFinanceiro({ projects, printers }) {

    // 1. Cálculos Globais (Apenas Projetos Finalizados/Pagos? Ou todos? Vamos usar 'finalizado' e 'producao')
    // Assumindo que 'finalizado' = Realizado.

    // 1. Cálculos Globais (Apenas Projetos Finalizados/Pagos)
    const stats = useMemo(() => {
        return calcularEstatisticasGlobais(projects);
    }, [projects]);


    // 2. ROI por Impressora
    const roiPrinters = useMemo(() => {
        return calcularRoiPorImpressora(projects, printers);
    }, [projects, printers]);

    // 3. Sparkline data (últimos 7 dias)
    const sparklineData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
            return { date, value: 0 };
        });

        projects.forEach(p => {
            if (!p.createdAt || !p.data) return;
            const projectDate = format(parseISO(p.createdAt), 'yyyy-MM-dd');
            const entry = last7Days.find(d => d.date === projectDate);
            if (entry) {
                entry.value += Number(p.data.lucro_liquido || 0);
            }
        });

        return last7Days;
    }, [projects]);

    // Goal detection & celebration
    const goalReached = useRef(false);
    const monthlyGoal = 10000; // R$ 10.000 meta mensal (configurável)

    useEffect(() => {
        if (stats.lucroTotal >= monthlyGoal && !goalReached.current) {
            goalReached.current = true;
            setTimeout(() => {
                celebrateGoal();
                soundSystem.success();
            }, 500);
        }

        if (stats.lucroTotal < monthlyGoal) {
            goalReached.current = false;
        }
    }, [stats.lucroTotal]);


    return (
        <div className="space-y-8 animate-fade-in-up">

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-tour="dashboard-kpi">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900/60 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Receita Total</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-white mb-2">
                        {formatarMoeda(stats.receitaTotal)}
                    </div>
                    <div className="h-10 -mx-2">
                        <Sparkline data={sparklineData} color="#10b981" />
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900/60 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                            <TrendingDown size={20} />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Custos</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-zinc-200">
                        {formatarMoeda(stats.custoTotal)}
                    </div>
                    <div className="mt-2 flex gap-2 text-[10px] uppercase font-bold text-zinc-600">
                        <span>Mat: {formatarMoeda(stats.custoMaterial)}</span>
                        <span>•</span>
                        <span>Ener: {formatarMoeda(stats.custoEnergia)}</span>
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900/60 transition-colors relative overflow-hidden group">
                    {/* Glow effect for profit */}
                    <div className="absolute top-0 right-0 p-8 bg-sky-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-sky-500/10 rounded-lg text-sky-500">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Lucro Líquido</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-sky-400 relative z-10">
                        {formatarMoeda(stats.lucroTotal)}
                    </div>
                </div>
            </div>

            {/* ROI Table */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="text-amber-500" size={20} />
                        Retorno sobre Investimento (ROI)
                    </h3>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Por Equipamento</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500">
                            <tr>
                                <th className="p-4">Impressora</th>
                                <th className="p-4 text-right">Custo Aquisição</th>
                                <th className="p-4 text-right">Lucro Gerado</th>
                                <th className="p-4 text-center">ROI (%)</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50 text-sm text-zinc-300">
                            {roiPrinters.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-900/30 transition-colors">
                                    <td className="p-4 font-medium flex items-center gap-3">
                                        <Printer size={16} className="text-zinc-600" />
                                        <div>
                                            <div className="text-white">{p.nome}</div>
                                            <div className="text-[10px] text-zinc-500">{p.marca} {p.modelo}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-mono text-zinc-400">
                                        {formatarMoeda(Number(p.preco || 0))}
                                    </td>
                                    <td className="p-4 text-right font-mono text-emerald-400">
                                        + {formatarMoeda(p.stats.profit)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`font-mono font-bold ${p.roi >= 100 ? 'text-sky-400' : 'text-zinc-500'}`}>
                                            {p.roi.toFixed(1)}%
                                        </span>
                                        {/* Progress Bar */}
                                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full mx-auto mt-1 overflow-hidden">
                                            <div
                                                className={`h-full ${p.roi >= 100 ? 'bg-sky-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(p.roi, 100)}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {p.roi >= 100 ? (
                                            <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-500 text-[10px] font-bold uppercase border border-sky-500/20">Pago</span>
                                        ) : (
                                            <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase border border-zinc-700">Pagando</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {roiPrinters.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-zinc-500 text-xs uppercase tracking-widest">
                                        Nenhum dado financeiro vinculado a impressoras.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
