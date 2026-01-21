import React, { useMemo } from 'react';
import { Package, AlertTriangle, TrendingUp, Boxes } from 'lucide-react';
import { formatarMoeda, formatDecimal } from '../../../utils/numbers';

export default function MaterialStatsWidget({ filaments = [] }) {
    const stats = useMemo(() => {
        const totalValue = filaments.reduce((sum, f) => {
            const weight = Number(f.peso_total_grama || 0) / 1000; // kg
            const pricePerKg = Number(f.preco_kg || 0);
            return sum + (weight * pricePerKg);
        }, 0);

        const critical = filaments.filter(f => {
            const percent = (Number(f.peso_atual_grama || 0) / Number(f.peso_total_grama || 1)) * 100;
            return percent < 20;
        });

        const mostUsed = filaments.reduce((acc, f) => {
            const used = Number(f.peso_total_grama || 0) - Number(f.peso_atual_grama || 0);
            if (!acc || used > acc.used) {
                return { ...f, used };
            }
            return acc;
        }, null);

        return {
            totalValue,
            criticalCount: critical.length,
            totalMaterials: filaments.length,
            mostUsed: mostUsed ? `${mostUsed.marca} ${mostUsed.nome}` : 'N/A',
            mostUsedWeight: mostUsed ? (mostUsed.used / 1000).toFixed(1) : 0
        };
    }, [filaments]);

    return (
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 h-full flex flex-col hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 rounded-lg">
                        <Package className="text-rose-500" size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Estoque de Materiais</h3>
                </div>
                {stats.criticalCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <AlertTriangle size={12} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-500">{stats.criticalCount} crítico{stats.criticalCount > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            <div className="space-y-4 flex-1">
                {/* Total Value */}
                <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800/50">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Valor em Estoque</div>
                    <div className="text-2xl font-mono font-bold text-rose-400">{formatarMoeda(stats.totalValue)}</div>
                </div>

                {/* Total Materials */}
                <div className="flex items-center justify-between p-3 bg-zinc-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Boxes size={14} className="text-zinc-600" />
                        <span className="text-xs text-zinc-400">Materiais Cadastrados</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-white">{stats.totalMaterials}</span>
                </div>

                {/* Most Used */}
                <div className="p-3 bg-gradient-to-br from-rose-500/5 to-transparent rounded-lg border border-rose-500/10">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={12} className="text-rose-500" />
                        <span className="text-[10px] font-bold text-rose-400 uppercase">Mais Usado</span>
                    </div>
                    <div className="text-xs text-white font-medium truncate">{stats.mostUsed}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">{stats.mostUsedWeight} kg consumidos</div>
                </div>
            </div>
        </div>
    );
}
