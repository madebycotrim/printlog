import { Zap, Clock, Wrench, Percent, Settings } from "lucide-react";
import { CabecalhoCard, CampoBancarioDashboard, CampoDashboard } from "./Compartilhados";
import { formatarMoedaFinancas, formatarPorcentagem, extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

interface PropsCardOperacional {
    custoEnergia: number;
    definirCustoEnergia: (v: number) => void;
    horaMaquina: number;
    definirHoraMaquina: (v: number) => void;
    horaOperador: number;
    definirHoraOperador: (v: number) => void;
    margemLucro: number;
    definirMargemLucro: (v: number) => void;
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
        <div className="rounded-2xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#121214] p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/[0.03] to-zinc-500/[0.01] dark:from-zinc-500/[0.05] dark:to-zinc-500/[0.02] pointer-events-none" />
            <CabecalhoCard titulo="Operacional" descricao="Motores base de custeio" icone={Settings} corIcone="text-amber-500" pendente={pendente} />
            <div className="grid grid-cols-2 gap-4">
                <CampoDashboard
                    label="Energia (R$/kWh)"
                    valor={String((custoEnergia / 100).toFixed(2))}
                    aoMudar={(v) => definirCustoEnergia(Math.round(extrairValorNumerico(v) * 100))}
                    icone={Zap}
                />
                <CampoDashboard
                    label="Máquina (R$/h)"
                    valor={String((horaMaquina / 100).toFixed(2))}
                    aoMudar={(v) => definirHoraMaquina(Math.round(extrairValorNumerico(v) * 100))}
                    icone={Clock}
                />
                <CampoDashboard
                    label="Operador (R$/h)"
                    valor={String((horaOperador / 100).toFixed(2))}
                    aoMudar={(v) => definirHoraOperador(Math.round(extrairValorNumerico(v) * 100))}
                    icone={Wrench}
                />
                <CampoDashboard
                    label="Margem (%)"
                    valor={String((margemLucro / 100).toFixed(2))}
                    aoMudar={(v) => definirMargemLucro(Math.round(extrairValorNumerico(v) * 100))}
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
