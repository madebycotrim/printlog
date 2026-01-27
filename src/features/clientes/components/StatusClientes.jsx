import React, { useMemo } from 'react';
import { Users, Building2, User } from 'lucide-react';
import StatsWidget from '../../../components/ui/StatsWidget';
import { differenceInDays, parseISO } from 'date-fns';

export default function StatusClientes({ clients = [] }) {
    const stats = useMemo(() => {
        const total = clients.length;
        const empresas = clients.filter(c => c.empresa && c.empresa.trim().length > 0).length;
        const pessoas = total - empresas;

        // Novos nos últimos 30 dias (se createdAt existir)
        const novos = clients.filter(c => {
            if (!c.createdAt) return false;
            try {
                return differenceInDays(new Date(), parseISO(c.createdAt)) <= 30;
            } catch (e) { return false; }
        }).length;

        return { total, empresas, pessoas, novos };
    }, [clients]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsWidget
                title="Total de Clientes"
                value={stats.total.toString()}
                icon={Users}
                colorTheme="zinc"
                secondaryLabel="Base de Contatos"
                secondaryValue="Cadastros ativos"
            />

            <StatsWidget
                title="Empresas"
                value={stats.empresas.toString()}
                icon={Building2}
                colorTheme="sky"
                secondaryLabel="Pessoas Jurídicas"
                secondaryValue="Clientes corporativos"
            />

            <StatsWidget
                title="Pessoas Físicas"
                value={stats.pessoas.toString()}
                icon={User}
                colorTheme="emerald"
                secondaryLabel="Consumidores"
                secondaryValue="Clientes finais"
            />
        </div>
    );
}
