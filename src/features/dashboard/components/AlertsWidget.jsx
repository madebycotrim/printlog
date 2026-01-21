import React from 'react';
import { AlertCircle, AlertTriangle, Info, Package, Wrench, Bell, CheckCircle } from 'lucide-react';
import DashboardCard from './DashboardCard';

/**
 * Widget de Alertas e Notificações (Premium)
 */
export default function AlertsWidget({ alerts = [], className = '' }) {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const warningCount = alerts.filter(a => a.severity === 'warning').length;

    const getAlertIcon = (severity) => {
        switch (severity) {
            case 'critical': return AlertCircle;
            case 'warning': return AlertTriangle;
            default: return Info;
        }
    };

    const getAlertColor = (severity) => {
        switch (severity) {
            case 'critical': return { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', icon: 'text-rose-500' };
            case 'warning': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'text-amber-500' };
            default: return { bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', icon: 'text-sky-500' };
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'filament': return Package;
            case 'printer': return Wrench;
            default: return Bell;
        }
    };

    // Determina a cor de destaque do card
    const accentColor = criticalCount > 0 ? 'rose' : (warningCount > 0 ? 'amber' : 'emerald');

    return (
        <DashboardCard
            title="Central de Alertas"
            subtitle={`${alerts.length} notificações ativas`}
            icon={Bell}
            accentColor={accentColor}
            className={className}
            headerAction={
                (criticalCount > 0 || warningCount > 0) && (
                    <div className="flex gap-1.5">
                        {criticalCount > 0 && (
                            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black shadow-lg shadow-rose-500/20 animate-pulse">
                                {criticalCount}
                            </div>
                        )}
                        {warningCount > 0 && (
                            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-black">
                                {warningCount}
                            </div>
                        )}
                    </div>
                )
            }
        >
            {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 opacity-50 space-y-3 p-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]">
                        <CheckCircle size={32} className="text-emerald-500" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-zinc-300">Tudo Tranquilo</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Sem alertas ativos</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 -mr-2">
                    {alerts.map((alert, index) => {
                        const colors = getAlertColor(alert.severity);
                        const AlertIcon = getAlertIcon(alert.severity);
                        const TypeIcon = getTypeIcon(alert.type);

                        return (
                            <div
                                key={alert.id || index}
                                className={`
                                    relative p-3 rounded-xl border backdrop-blur-md flex gap-3
                                    ${colors.bg} ${colors.border}
                                    group/item hover:scale-[1.02] transition-all duration-300 cursor-default
                                `}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-black/20 border border-white/5`}>
                                    <TypeIcon size={14} className={colors.icon} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <h4 className={`text-xs font-bold ${colors.text} truncate`}>
                                            {alert.title}
                                        </h4>
                                        <AlertIcon size={14} className={colors.icon} />
                                    </div>
                                    <p className="text-[11px] text-zinc-300/80 leading-snug font-medium line-clamp-2">
                                        {alert.message}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardCard>
    );
}
