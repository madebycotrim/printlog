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
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            <MainSidebar />

            <main
                className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar"
                style={{ marginLeft: `${larguraSidebar}px` }}
            >
                {/* Decorative BG */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-sky-500/30 via-transparent to-transparent" />
                    </div>
                </div>

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
            </main>
        </div>
    );
}

