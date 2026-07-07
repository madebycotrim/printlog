import { memo } from "react";
import { Activity, Clock } from "lucide-react";
import { ContadorAnimado } from "@/compartilhado/componentes/ui";

interface CardDepreciacaoProps {
  depreciacao: number;
  cobrarDesgaste: boolean;
  setCobrarDesgaste: (v: boolean) => void;
  anosVidaUtil: 5 | 3 | 2;
  setAnosVidaUtil: (v: 5 | 3 | 2) => void;
  tempo: number;
  quantidade: number;
  modoEntrada: 'unitario' | 'lote' | 'projeto';
}

export const CardDepreciacao = memo(function CardDepreciacao({
  depreciacao,
  cobrarDesgaste,
  setCobrarDesgaste,
  anosVidaUtil = 5,
  setAnosVidaUtil,
  tempo,
  quantidade,
  modoEntrada
}: CardDepreciacaoProps) {
  return (
    <div className={`p-5 rounded-3xl bg-card/60 border border-borda-sutil relative flex flex-col shadow-2xl backdrop-blur-3xl group transition-all duration-500 overflow-hidden premium-card premium-card-stone w-full h-full`}>
      <div className="absolute -top-24 -right-20 w-80 h-80 bg-stone-500/10 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />
      
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-borda-sutil">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-400 border border-stone-500/30 bg-gradient-to-br from-stone-500/10 to-zinc-500/10">
            <Activity size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Desgaste e Depreciação</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Vida útil do equipamento</span>
          </div>
        </div>
      </div>
      
      <div className={`flex-1 flex flex-col justify-between pt-4 transition-opacity duration-300`}>
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-black uppercase text-muted-foreground tracking-wider mb-2">Perfil de Vida Útil</label>
            <div className="flex bg-muted/30 dark:bg-zinc-900/60 p-0.5 rounded-xl border border-borda-sutil">
              {([
                { value: 5, label: "Padrão", anos: "5 anos" },
                { value: 3, label: "Severo", anos: "3 anos" },
                { value: 2, label: "Extremo", anos: "2 anos" }
              ] as const).map((opcao) => (
                <button
                  key={opcao.value}
                  type="button"
                  onClick={() => {
                    if (cobrarDesgaste && anosVidaUtil === opcao.value) {
                      setCobrarDesgaste(false);
                    } else {
                      setAnosVidaUtil(opcao.value);
                      setCobrarDesgaste(true);
                    }
                  }}
                  className={`flex-1 flex flex-col items-center justify-center text-[9px] font-black uppercase py-1.5 rounded-lg transition-all cursor-pointer ${
                    cobrarDesgaste && anosVidaUtil === opcao.value
                      ? opcao.value === 5
                        ? 'bg-stone-500/20 text-stone-600 dark:text-stone-400 border border-stone-500/30 shadow-sm'
                        : opcao.value === 3
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm'
                      : 'text-muted-foreground border border-transparent hover:text-primary dark:hover:text-white'
                  }`}
                >
                  <span>{opcao.label}</span>
                  <span className="text-[8px] font-bold opacity-60 normal-case">{opcao.anos}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end mt-4 transition-opacity duration-300">
            <div className="w-full p-4 rounded-2xl flex flex-col bg-stone-500/5 border border-stone-500/10 select-none relative overflow-hidden group gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Custo Horário</span>
                   <div className="flex items-baseline gap-0.5 z-10">
                     <span className="font-black text-xl text-stone-600 dark:text-stone-400 tracking-tight leading-none">
                       <ContadorAnimado valor={cobrarDesgaste ? (depreciacao / 100) || 0 : 0} />
                     </span>
                     <span className="text-[10px] font-black text-muted-foreground/60 select-none">/h</span>
                   </div>
                </div>
                
                <div className="w-px h-8 bg-borda-sutil mx-2" />

                <div className="flex flex-col items-end">
                   <span className="text-[9px] font-black uppercase text-stone-600 dark:text-stone-500 tracking-wider mb-1.5">
                     Custo p/ {modoEntrada === 'unitario' ? 'Peça' : modoEntrada === 'projeto' ? 'Projeto' : 'Lote'} ({quantidade}x)
                   </span>
                   <span className={`text-xl font-black tracking-tight leading-none ${cobrarDesgaste ? 'text-stone-600 dark:text-stone-400' : 'text-muted-foreground'}`}>
                     <ContadorAnimado valor={cobrarDesgaste ? (tempo / 60) * (depreciacao / 100) * quantidade : 0} />
                   </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[8px] font-bold text-muted-foreground/80 justify-center bg-black/5 dark:bg-black/20 py-1.5 px-2 rounded-lg border border-black/5 dark:border-white/5 w-full">
                  <Clock size={10} className="text-stone-500" />
                  <span>
                    BASE: (Máquina / {anosVidaUtil} Anos) / 12M / 240h
                  </span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-stone-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-stone-500/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
