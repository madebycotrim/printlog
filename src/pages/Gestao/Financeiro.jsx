import React, { useEffect } from 'react';

import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import { useProjectsStore } from '../../features/projetos/logic/projetos';
import { usePrinters } from '../../features/impressoras/logic/consultasImpressora';
import DashboardFinanceiro from '../../features/financeiro/components/DashboardFinanceiro';

export default function FinanceiroPage() {
    const { projects, fetchHistory } = useProjectsStore();
    const { data: printers = [] } = usePrinters();

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <ManagementLayout>

            <PageHeader
                title="Financeiro"
                subtitle="Fluxo de caixa, Lucratividade e ROI"
                accentColor="text-emerald-500"
            />

            <DashboardFinanceiro projects={projects} printers={printers} />


        </ManagementLayout>
    );
}

