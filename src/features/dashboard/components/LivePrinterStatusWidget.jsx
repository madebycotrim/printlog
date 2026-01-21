import React, { useMemo } from 'react';
import { Printer, Activity, Clock, Radio } from 'lucide-react';

export default function LivePrinterStatusWidget({ printers = [] }) {
    const stats = useMemo(() => {
        const printing = printers.filter(p => p.status === 'printing');
        const idle = printers.filter(p => p.status === 'idle');
        const maintenance = printers.filter(p => p.status === 'maintenance' || p.status === 'error');

        return {
            total: printers.length,
            printing: printing.length,
            idle: idle.length,
            maintenance: maintenance.length,
            printersList: printing.slice(0, 3) // Top 3 active prints
        };
    }, [printers]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'printing': return 'emerald';
            case 'idle': return 'zinc';
            case 'maintenance':
            case 'error': return 'rose';
            default: return 'zinc';
        }
    };

    return (
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 h-full flex flex-col hover:border-zinc-700 transition-all">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Activity className="text-emerald-500" size={20} />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Status ao Vivo</h3>
                <div className="ml-auto">
                    <div className="flex items-center gap-1.5">
                        <Radio size={10} className="text-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-400 uppercase">Live</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-center">
                    <div className="text-xl font-mono font-bold text-emerald-400">{stats.printing}</div>
                    <div className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5">Imprimindo</div>
                </div>
                <div className="p-3 bg-zinc-800/30 border border-zinc-700/50 rounded-lg text-center">
                    <div className="text-xl font-mono font-bold text-zinc-400">{stats.idle}</div>
                    <div className="text-[9px] text-zinc-600 font-bold uppercase mt-0.5">Ociosas</div>
                </div>
                <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg text-center">
                    <div className="text-xl font-mono font-bold text-rose-400">{stats.maintenance}</div>
                    <div className="text-[9px] text-rose-600 font-bold uppercase mt-0.5">Mantendo</div>
                </div>
            </div>

            {/* Active Prints */}
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                {stats.printersList.length > 0 ? (
                    stats.printersList.map((printer) => {
                        const color = getStatusColor(printer.status);
                        return (
                            <div key={printer.id} className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Printer size={12} className={`text-${color}-500`} />
                                    <span className="text-xs font-medium text-white truncate flex-1">{printer.nome}</span>
                                    <span className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`} />
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-zinc-500 flex items-center gap-1">
                                        <Clock size={10} />
                                        {Number(printer.horas_totais || 0).toFixed(0)}h totais
                                    </span>
                                    <span className={`px-2 py-0.5 rounded bg-${color}-500/10 text-${color}-500 font-bold uppercase`}>
                                        {printer.status === 'printing' ? 'Ativa' : 'Parada'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <Printer size={32} className="text-zinc-700 mb-2" />
                        <p className="text-xs text-zinc-500">Nenhuma impressão ativa</p>
                    </div>
                )}
            </div>
        </div>
    );
}
