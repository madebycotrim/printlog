import React, { useMemo } from 'react';
import { Printer, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import DashboardCard from './DashboardCard';
import { usePrinters } from '../../impressoras/logic/consultasImpressora';
import { useProjectsStore } from '../../projetos/logic/projetos';

export default function FleetSummaryWidget({ className = '', maintenanceInterval = 300 }) {
    const { data: printers = [] } = usePrinters();
    const { projects } = useProjectsStore();

    const stats = useMemo(() => {
        if (!printers || printers.length === 0) return null;

        const total = printers.length;
        let active = 0;
        let errors = 0;
        let maintenanceRequired = 0;

        const printerHealths = printers.map(p => {
            // Calculate simulated maintenance health
            // (Logic adapted from old MaintenanceWidget)
            let totalHours = 0;
            const pid = String(p.id);

            if (projects) {
                (projects || []).forEach(proj => {
                    const selectedId = proj.entradas?.idImpressoraSelecionada;
                    if (selectedId && String(selectedId) === pid) {
                        const h = Number(proj.entradas?.tempo?.impressaoHoras) || 0;
                        const m = Number(proj.entradas?.tempo?.impressaoMinutos) || 0;
                        totalHours += h + (m / 60);
                    }
                });
            }

            const hoursSinceLast = totalHours % maintenanceInterval;
            const health = Math.max(0, 100 - ((hoursSinceLast / maintenanceInterval) * 100));

            if (health < 50) maintenanceRequired++;
            if (p.status === 'error') errors++; // Assuming printer object has status if connected live
            else active++; // Assuming non-error is active for now

            return { ...p, health, hoursSinceLast };
        }).sort((a, b) => a.health - b.health); // Lowest health first

        return {
            total,
            active,
            errors,
            maintenanceRequired,
            printers: printerHealths
        };
    }, [printers, projects, maintenanceInterval]);

    if (!stats) {
        return (
            <DashboardCard
                title="Frota"
                icon={Printer}
                accentColor="zinc"
            >
                <div className="flex flex-col items-center justify-center h-full opacity-40">
                    <Printer size={32} className="mb-2 text-zinc-500" />
                    <p className="text-[10px] font-bold uppercase">Nenhuma impressora</p>
                </div>
            </DashboardCard>
        )
    }

    const hasCriticalIssues = stats.errors > 0 || stats.maintenanceRequired > 0;
    const accentColor = hasCriticalIssues ? (stats.errors > 0 ? 'rose' : 'amber') : 'sky';

    // Get worst 2 printers for display
    const warningPrinters = stats.printers.slice(0, 2);

    return (
        <DashboardCard
            title="Frota"
            subtitle={`${stats.active}/${stats.total} Ativas`}
            icon={Printer}
            accentColor={accentColor}
            className={className}
        >
            <div className="flex flex-col h-full justify-between gap-4">

                {/* Status Overview */}
                <div className="flex items-center gap-4">
                    <div className={`flex-1 rounded-xl p-3 border ${hasCriticalIssues ? 'bg-rose-500/5 border-rose-500/10' : 'bg-sky-500/5 border-sky-500/10'}`}>
                        {hasCriticalIssues ? (
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-rose-500/20 p-2 text-rose-400">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white leading-none">{stats.errors + stats.maintenanceRequired}</p>
                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Atenção</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-sky-500/20 p-2 text-sky-400">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white leading-none">100%</p>
                                    <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wide">Operacional</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Maintenance List / Health Bars */}
                <div className="space-y-2.5">
                    {warningPrinters.map(p => (
                        <div key={p.id}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[100px]">{p.nome || p.modelo}</span>
                                <span className={`text-[10px] font-mono font-bold ${p.health < 20 ? 'text-rose-400' : 'text-zinc-500'}`}>
                                    {p.health.toFixed(0)}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    style={{ width: `${p.health}%` }}
                                    className={`h-full rounded-full transition-all duration-500 ${p.health < 20 ? 'bg-rose-500 animate-pulse' :
                                        p.health < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}
                                />
                            </div>
                        </div>
                    ))}
                    {warningPrinters.length < stats.total && (
                        <p className="text-[10px] text-center text-zinc-600 mt-2 font-medium">
                            + {stats.total - warningPrinters.length} impressoras saudáveis
                        </p>
                    )}
                </div>

            </div>
        </DashboardCard>
    );
}
