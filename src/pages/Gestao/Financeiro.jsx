import React, { useEffect, useState } from 'react';
import { Wallet, DollarSign } from 'lucide-react';
import MainSidebar from "../../layouts/mainSidebar";
import { useProjectsStore } from '../../features/projetos/logic/projects';
import { usePrinterStore } from '../../features/impressoras/logic/printer';
import DashboardFinanceiro from '../../features/financeiro/components/DashboardFinanceiro';

import { useSidebarStore } from '../../stores/sidebarStore';

export default function FinanceiroPage() {
    const { projects, fetchHistory } = useProjectsStore();
    const { printers, fetchPrinters } = usePrinterStore();
    const { width: larguraSidebar } = useSidebarStore();

    useEffect(() => {
        fetchHistory();
        fetchPrinters();
    }, [fetchHistory, fetchPrinters]);

    return (
        <ManagementLayout>
            <div className="relative z-10 p-8 xl:p-12 max-w-[1600px] mx-auto w-full">

                {/* Header */}
                <div className="mb-12 animate-fade-in-up">
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
                        <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
                            <Wallet className="w-8 h-8 text-sky-400" />
                        </div>
                        Financeiro
                    </h1>
                    <p className="text-sm text-zinc-500 capitalize ml-1">
                        Fluxo de caixa, Lucratividade e ROI
                    </p>
                </div>

                <DashboardFinanceiro projects={projects} printers={printers} />

            </div>
        </ManagementLayout>
    );
}

