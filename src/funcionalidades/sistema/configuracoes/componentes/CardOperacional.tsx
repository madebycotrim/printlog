import { Zap, Clock, Wrench, Percent, Settings } from "lucide-react";
import { CabecalhoCard, CampoDashboard } from "./Compartilhados";
import { formatarMoedaBr, formatarPorcentagem } from "@/compartilhado/utilitarios/formatadores";

interface PropsCardOperacional {
    custoEnergia: string;
    definirCustoEnergia: (v: string) => void;
    horaMaquina: string;
    definirHoraMaquina: (v: string) => void;
    horaOperador: string;
    definirHoraOperador: (v: string) => void;
    margemLucro: string;
    definirMargemLucro: (v: string) => void;
    pendente?: boolean;
}

export function CardOperacional({
    custoEnergia,
    definirCustoEnergia,
    horaMaquina,
    definirHoraMaquina,
    horaOperador,
    definirHoraOperador,
    margemLucro,
    definirMargemLucro,
    pendente,
}: PropsCardOperacional) {
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/[0.03] to-zinc-500/[0.01] dark:from-zinc-500/[0.05] dark:to-zinc-500/[0.02] pointer-events-none" />
            <CabecalhoCard titulo="Operacional" descricao="Motores base de custeio" icone={Settings} corIcone="text-amber-500" pendente={pendente} />
            <div className="grid grid-cols-2 gap-4">
                <CampoDashboard
                    label="Energia (R$/kWh)"
                    valor={custoEnergia}
                    aoMudar={(v) => definirCustoEnergia(formatarMoedaBr(v))}
                    icone={Zap}
                />
                <CampoDashboard
                    label="Máquina (R$/h)"
                    valor={horaMaquina}
                    aoMudar={(v) => definirHoraMaquina(formatarMoedaBr(v))}
                    icone={Clock}
                />
                <CampoDashboard
                    label="Operador (R$/h)"
                    valor={horaOperador}
                    aoMudar={(v) => definirHoraOperador(formatarMoedaBr(v))}
                    icone={Wrench}
                />
                <CampoDashboard
                    label="Margem (%)"
                    valor={margemLucro}
                    aoMudar={(v) => definirMargemLucro(formatarPorcentagem(v))}
                    icone={Percent}
                />
            </div>
            <div className="mt-auto bg-amber-50/80 dark:bg-amber-500/[0.05] p-4 rounded-2xl border border-amber-200 dark:border-amber-500/20 flex gap-3 items-start">
                <Settings size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300/90 text-justify">
                    Estes índices são aplicados de forma global no estúdio, servindo como base matriz de cálculo financeiro e execução contratual (Art. 7º, V).
                </p>
            </div>
        </div>
    );
}
