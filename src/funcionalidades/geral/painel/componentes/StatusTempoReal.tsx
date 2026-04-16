import { ChevronRight } from "lucide-react";
import { StatusItem } from "./StatusItem";

export function StatusTempoReal() {
    return (
        <div className="bg-white dark:bg-card rounded-2xl p-8 border border-borda-sutil flex flex-col" style={{ boxShadow: "var(--sombra-suave)" }}>
            <h3 className="text-xl font-black tracking-tight dark:text-white mb-6 uppercase">Status em Tempo Real</h3>

            <div className="space-y-6 flex-1">
                <StatusItem
                    titulo="Impressão em Curso"
                    maquina="Ender 3 S1"
                    progresso={75}
                    status="OPERANDO"
                    cor="bg-emerald-500"
                />
                <StatusItem
                    titulo="Aguardando Coleta"
                    maquina="Kobra Neo"
                    progresso={100}
                    status="CONCLUÍDO"
                    cor="bg-blue-500"
                />
                <StatusItem
                    titulo="Erro de Nivelamento"
                    maquina="Bambu Lab P1S"
                    progresso={12}
                    status="ALERTA"
                    cor="bg-rose-500"
                />
            </div>

            <button className="mt-8 w-full py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-sm uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                Ver Monitor Global
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
