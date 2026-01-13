import React, { useMemo } from 'react';
import { Trophy, Printer, TrendingUp, Star } from 'lucide-react';
import { formatCurrency } from '../../../utils/numbers';
import DashboardCard from './DashboardCard';

export default function HighlightsWidget({ projects = [], printers = [] }) {
    // --- CÁLCULO DE ESTATÍSTICAS ---
    const stats = useMemo(() => {
        if (!projects || projects.length === 0) return null;

        // 1. Impressora Mais Trabalhadora
        const printerUsage = {};
        projects.forEach(p => {
            const data = p.data || {};
            const pid = data.entradas?.idImpressoraSelecionada || data.entradas?.selectedPrinterId;
            const time = (Number(data.entradas?.tempo?.impressaoHoras) || 0) + ((Number(data.entradas?.tempo?.impressaoMinutos) || 0) / 60);
            if (pid) printerUsage[pid] = (printerUsage[pid] || 0) + time;
        });

        let topPrinterId = null;
        let maxTime = -1;
        Object.entries(printerUsage).forEach(([pid, time]) => {
            if (time > maxTime) {
                maxTime = time;
                topPrinterId = pid;
            }
        });

        const topPrinter = printers.find(p => String(p.id) === String(topPrinterId));

        // 2. Projeto Mais Valioso
        let topProject = null;
        let maxValue = -1;
        (projects || []).forEach(p => {
            const val = Number(p.data?.resultados?.precoFinal) || 0;
            if (val > maxValue) {
                maxValue = val;
                topProject = p;
            }
        });

        return {
            topPrinter: topPrinter ? { name: topPrinter.nome || topPrinter.modelo, hours: maxTime.toFixed(1) } : null,
            topProject: topProject ? { name: topProject.label || topProject.data?.entradas?.nomeProjeto, value: maxValue } : null
        };
    }, [projects, printers]);

    // Render vazio
    if (!stats) return (
        <DashboardCard title="Destaques" icon={Trophy} subtitle="Hall da fama" accentColor="amber">
            <div className="flex flex-col items-center justify-center h-full opacity-40 text-center">
                <Trophy size={32} className="mb-2 text-zinc-500" strokeWidth={1} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Sem destaques ainda</p>
            </div>
        </DashboardCard>
    );

    return (
        <DashboardCard title="Destaques" icon={Trophy} subtitle="Hall da fama" accentColor="amber">
            <div className="flex flex-col h-full gap-3">

                {/* 1. Impressora MVP */}
                <div className="flex-1 bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 rounded-xl p-3 relative overflow-hidden group/printer hover:border-amber-500/20 transition-all">
                    <div className="flex items-center justify-between mb-2 z-10 relative">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-500">
                            <Star size={10} className="fill-amber-500" /> MVP
                        </span>
                        <Printer size={14} className="text-amber-500/50" />
                    </div>
                    <h4 className="text-sm font-bold text-white truncate z-10 relative">{stats.topPrinter?.name || "N/A"}</h4>
                    <p className="text-[10px] text-zinc-400 z-10 relative">
                        <span className="text-zinc-200 font-bold">{stats.topPrinter?.hours || 0}h</span> operando
                    </p>

                    {/* Decor */}
                    <Printer size={60} className="absolute -right-2 -bottom-4 text-amber-500/5 transform -rotate-12 group-hover/printer:scale-110 transition-transform" />
                </div>

                {/* 2. Projeto Rico */}
                <div className="flex-1 bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10 rounded-xl p-3 relative overflow-hidden group/project hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center justify-between mb-2 z-10 relative">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-500">
                            <TrendingUp size={10} /> Recorde
                        </span>
                        <TrendingUp size={14} className="text-emerald-500/50" />
                    </div>
                    <h4 className="text-sm font-bold text-white truncate z-10 relative">{stats.topProject?.name || "N/A"}</h4>
                    <p className="text-lg font-mono font-black text-emerald-400 leading-none mt-1 z-10 relative">
                        {formatCurrency(stats.topProject?.value || 0)}
                    </p>

                    {/* Decor */}
                    <TrendingUp size={60} className="absolute -right-2 -bottom-4 text-emerald-500/5 transform rotate-6 group-hover/project:scale-110 transition-transform" />
                </div>

            </div>
        </DashboardCard>
    );
}
