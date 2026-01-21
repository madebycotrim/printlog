import React, { useMemo } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { CostPieChart } from '../../../components/charts/ChartComponents';
import { formatarMoeda } from '../../../utils/numbers';

export default function CostDistributionWidget({ projects = [] }) {
    const distribution = useMemo(() => {
        const totals = projects.reduce((acc, project) => {
            if (!project.data) return acc;

            acc.material += Number(project.data.custo_material || 0);
            acc.energia += Number(project.data.custo_energia || 0);
            acc.maoDeObra += Number(project.data.custo_mao_obra || 0);
            acc.outros += Number(project.data.custo_embalagem || 0) + Number(project.data.custo_frete || 0);

            return acc;
        }, { material: 0, energia: 0, maoDeObra: 0, outros: 0 });

        const data = [
            { name: 'Material', value: totals.material },
            { name: 'Energia', value: totals.energia },
            { name: 'Mão de Obra', value: totals.maoDeObra },
            { name: 'Outros', value: totals.outros }
        ].filter(item => item.value > 0);

        return { data, total: Object.values(totals).reduce((a, b) => a + b, 0) };
    }, [projects]);

    return (
        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 h-full flex flex-col hover:border-zinc-700 transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                    <PieChartIcon className="text-amber-500" size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Distribuição de Custos</h3>
                    <p className="text-[10px] text-zinc-500">Total: {formatarMoeda(distribution.total)}</p>
                </div>
            </div>

            {distribution.data.length > 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <CostPieChart data={distribution.data} />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <PieChartIcon size={32} className="text-zinc-700 mb-2" />
                    <p className="text-xs text-zinc-500">Sem dados disponíveis</p>
                    <p className="text-[10px] text-zinc-600 mt-1">Registre custos para ver a distribuição</p>
                </div>
            )}
        </div>
    );
}
