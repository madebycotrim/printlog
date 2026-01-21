import React, { useEffect } from 'react';

import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import { useProjectsStore } from '../../features/projetos/logic/projects';
import { usePrinters } from '../../features/impressoras/logic/printerQueries';
import DashboardFinanceiro from '../../features/financeiro/components/DashboardFinanceiro';

export default function FinanceiroPage() {
    const { projects, fetchHistory } = useProjectsStore();
    const { data: printers = [] } = usePrinters();

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

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

