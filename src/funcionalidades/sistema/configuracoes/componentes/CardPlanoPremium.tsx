import { Shield, Sparkles, Calendar, RotateCcw, Crown, Zap } from "lucide-react";

interface PropsCardPlanoPremium {
    plano: string;
    cicloPagamento?: string;
    vencimentoPlano?: string | null;
}

export function CardPlanoPremium({
    plano,
    cicloPagamento,
    vencimentoPlano,
}: PropsCardPlanoPremium) {
    const obterDiasRestantes = () => {
        if (cicloPagamento === "VITALICIO" || plano === "FUNDADOR") return "Vitalício";
        if (!vencimentoPlano) return "---";

        const hoje = new Date();
        const venc = new Date(vencimentoPlano);
        const diffTempo = venc.getTime() - hoje.getTime();
        const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        if (diffDias < 0) return `Expirado há ${Math.abs(diffDias)} dias`;
        if (diffDias === 0) return "Expira hoje!";
        return `${diffDias} dias restantes`;
    };

    const obterDataVencimentoFormatada = () => {
        if (cicloPagamento === "VITALICIO" || plano === "FUNDADOR") return "Acesso Vitalício";
        if (!vencimentoPlano) return "---";

        const venc = new Date(vencimentoPlano);
        return venc.toLocaleDateString('pt-BR');
    };

    const ehFundador = plano === "FUNDADOR";

    return (
        <div className="relative rounded-[24px] overflow-hidden border border-gray-200/50 dark:border-white/[0.03] bg-white dark:bg-[#0c0c0e] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_80px_-16px_rgba(0,0,0,0.6)] group transition-all duration-700">
            {/* Gradientes e Efeitos de Luz Premium */}
            <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),transparent_50%)] pointer-events-none blur-3xl animate-pulse duration-[10s]" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12),transparent_50%)] pointer-events-none blur-3xl" />

            {/* Coluna Esquerda: Badge e Destaque do Plano */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 z-10 w-full md:w-1/3 shrink-0">
                <div className={`p-4 rounded-3xl ${ehFundador ? 'bg-gradient-to-tr from-sky-500/20 to-blue-500/10 text-sky-500 shadow-[0_12px_24px_rgba(14,165,233,0.15)]' : 'bg-gradient-to-tr from-indigo-500/20 to-purple-500/10 text-indigo-500 shadow-[0_12px_24px_rgba(99,102,241,0.15)]'} border border-white/10`}>
                    {ehFundador ? <Crown size={32} className="animate-bounce fill-sky-500" /> : <Zap size={32} className="animate-pulse fill-indigo-500" />}
                </div>
                <div>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 dark:text-zinc-500">
                        Nível de Acesso
                    </span>
                    <h3 className={`text-4xl font-black tracking-tighter mt-1 bg-clip-text text-transparent bg-gradient-to-r ${ehFundador ? 'from-sky-500 via-blue-400 to-cyan-500' : 'from-indigo-500 via-purple-500 to-pink-500'}`}>
                        {ehFundador ? 'Maker Fundador' : 'Maker Pro'}
                    </h3>
                </div>
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${ehFundador ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}`}>
                    <Shield size={12} />
                    CONTA VERIFICADA
                </div>
            </div>

            {/* Divisor vertical em telas grandes */}
            <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-gray-200 dark:via-white/5 to-transparent shrink-0" />

            {/* Coluna Direita: Métricas de Assinatura */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 z-10 w-full flex-1">
                <div className="flex flex-col gap-1 items-center md:items-start">
                    <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        <RotateCcw size={14} className="text-gray-400 dark:text-zinc-600" />
                        Faturamento
                    </div>
                    <span className="text-xl font-black text-gray-800 dark:text-zinc-200 mt-1 uppercase tracking-tight">
                        {cicloPagamento || "MENSAL"}
                    </span>
                </div>

                <div className="flex flex-col gap-1 items-center md:items-start">
                    <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        <Calendar size={14} className="text-gray-400 dark:text-zinc-600" />
                        Renovação
                    </div>
                    <span className="text-xl font-black text-gray-800 dark:text-zinc-200 mt-1 tracking-tight">
                        {obterDataVencimentoFormatada()}
                    </span>
                </div>

                <div className="flex flex-col gap-1 items-center md:items-start">
                    <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        <Sparkles size={14} className="text-gray-400 dark:text-zinc-600" />
                        Tempo Restante
                    </div>
                    <span className={`text-xl font-black mt-1 tracking-tight uppercase ${obterDiasRestantes().includes("Expirado") ? "text-red-500 animate-pulse" : "text-emerald-500"}`}>
                        {obterDiasRestantes()}
                    </span>
                </div>
            </div>
        </div>
    );
}
