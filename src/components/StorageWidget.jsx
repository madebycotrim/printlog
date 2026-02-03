import React, { useEffect, useState } from 'react';
import { Database, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { useUser } from '../contexts/AuthContext';

export default function StorageWidget({ collapsed, className = "", variant = "sidebar" }) {
    const { user } = useUser();
    const [stats, setStats] = useState({ userUsage: 0, maxStorage: 1024 * 1024 * 1024, percentage: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        api.get(`/stats?userId=${user.id}`)
            .then(res => {
                setStats(res.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user?.id]);

    const formatBytes = (bytes, decimals = 1) => {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const percentage = stats.percentage || 0;
    const isCritical = percentage > 90;
    const isWarning = percentage > 75;

    const colorClass = isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';
    const textClass = isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400';
    const colorName = isCritical ? 'rose' : isWarning ? 'amber' : 'emerald';

    if (loading) return null;

    if (collapsed && variant === 'sidebar') {
        return (
            <div className="mx-auto w-10 h-1 mb-4 rounded-full bg-zinc-800 overflow-hidden" title={`Armazenamento: ${percentage.toFixed(1)}%`}>
                <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
            </div>
        );
    }

    // New "Stat Card" Variant for Settings Page
    if (variant === 'stat') {
        return (
            <div className={`bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-4 hover-lift group flex flex-col justify-center gap-3 relative overflow-hidden ${className}`}>
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${colorName}-500/10 text-${colorName}-400 group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                        <Database size={24} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500 mb-0.5">
                            Armazenamento
                        </h3>
                        <div className="flex items-center gap-2">
                            <p className={`text-lg font-mono font-black ${textClass} leading-none`}>
                                {formatBytes(stats.userUsage)}
                            </p>
                            <span className="text-[10px] text-zinc-600 font-mono">
                                / {formatBytes(stats.maxStorage)}
                            </span>
                        </div>
                        <p className="text-[9px] text-zinc-600 font-medium mt-1 leading-none">
                            {percentage.toFixed(1)}% utilizado
                        </p>
                    </div>
                </div>

                {/* Progress Bar for Stat Variant */}
                <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden relative z-10">
                    <div
                        className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                </div>
            </div>
        );
    }

    // Default "Sidebar Box" Variant
    return (
        <div className={`px-6 mb-4 mt-auto ${className}`}>
            <div className="p-3 bg-zinc-900/50 border border-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Database size={12} className="text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Armazenamento</span>
                    </div>
                    {isCritical && <AlertTriangle size={12} className="text-rose-500 animate-pulse" />}
                </div>

                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <div
                        className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                </div>

                <div className="flex justify-between items-end">
                    <span className={`text-xs font-bold font-mono ${textClass}`}>
                        {formatBytes(stats.userUsage)}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-mono">
                        / {formatBytes(stats.maxStorage)}
                    </span>
                </div>
            </div>
        </div>
    );
}
