import React, { useEffect, useState } from 'react';
import { Wallet, DollarSign } from 'lucide-react';
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import { useProjectsStore } from '../../features/projetos/logic/projects';
import { usePrinterStore } from '../../features/impressoras/logic/printer';
import DashboardFinanceiro from '../../features/financeiro/components/DashboardFinanceiro';

export default function FinanceiroPage() {
    const { projects, fetchHistory } = useProjectsStore();
    const { printers, fetchPrinters } = usePrinterStore();

    useEffect(() => {
        fetchHistory();
        fetchPrinters();
    }, [fetchHistory, fetchPrinters]);

    return (
        <ManagementLayout>
            <div className="relative z-10 p-8 xl:p-12 max-w-[1600px] mx-auto w-full">

                <PageHeader
                    title="Financeiro"
                    subtitle="Fluxo de caixa, Lucratividade e ROI"
                />

                <DashboardFinanceiro projects={projects} printers={printers} />

            </div>
        </ManagementLayout>
    );
}

