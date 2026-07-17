import { motion, AnimatePresence } from "framer-motion";
import { PenTool, HelpCircle } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { InputBancario, Dica } from "@/compartilhado/componentes/ui";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

interface CardModelagemProps {
  tempoModelagem: number; // minutos
  setTempoModelagem: (v: number) => void;
  valorHoraModelagem: number; // centavos
  setValorHoraModelagem: (v: number) => void;
  modoEntrada?: 'unitario' | 'lote' | 'projeto';
  mostrar: boolean;
  setMostrar: (v: boolean) => void;
}

export const CardModelagem = memo(function CardModelagem({
  tempoModelagem,
  setTempoModelagem,
  valorHoraModelagem,
  setValorHoraModelagem,
  modoEntrada = 'lote',
  mostrar,
  setMostrar
}: CardModelagemProps) {
  const textoModo = modoEntrada === 'unitario' ? 'Unidade' : modoEntrada === 'projeto' ? 'Projeto' : 'Lote';
  const [tempHora, setTempHora] = useState<string | undefined>(undefined);
  const [tempMinuto, setTempMinuto] = useState<string | undefined>(undefined);
  const [tempSegundo, setTempSegundo] = useState<string | undefined>(undefined);

  // Mantém o painel aberto caso haja valor configurado via load/snapshot
  useEffect(() => {
    if (tempoModelagem > 0) {
      setMostrar(true);
    }
  }, [tempoModelagem]);

  return (
    <div className="flex flex-col">
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(6,182,212,0.15)] transition-all z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-inner">
            <PenTool size={16} className={`${tempoModelagem > 0 ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Deseja adicionar horas de design (CAD)?</span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Modelagem 3D sob medida e adequação de peças</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const novoEstado = !mostrar;
            setMostrar(novoEstado);
            if (!novoEstado) {
              setTempoModelagem(0);
              setValorHoraModelagem(0); // Reset para default
            }
          }}
          className={`px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all border ${mostrar
            ? "bg-cyan-500 text-white border-cyan-600 shadow-sm shadow-cyan-500/30 hover:bg-cyan-600"
            : "bg-card text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 border-borda-sutil shadow-sm"
            }`}
        >
          {mostrar ? "Ocultar" : "Adicionar"}
        </button>
      </div>

      <AnimatePresence>
        {mostrar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-6 pt-8 rounded-b-xl bg-[linear-gradient(to_bottom,transparent_12px,var(--bg-card)_12px)] shadow-sm space-y-4 -mt-3 z-0 relative overflow-hidden"
          >
            {/* Quininhas para preencher o gap dos cantos arredondados */}
            <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_100%_0%,transparent_12px,var(--bg-card)_12px)] z-[-1]" />
            <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_0%_0%,transparent_12px,var(--bg-card)_12px)] z-[-1]" />

            <div className="flex items-center justify-between pb-3 border-b border-borda-sutil mb-4">
              <div className="flex items-center gap-3">
                <PenTool size={16} className="text-cyan-400" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-cyan-500 flex items-center gap-1">
                  Gestão de Modelagem 3D
                  <Dica texto="O tempo gasto no computador desenhando a peça do zero, ajustando as dimensões de um modelo pronto ou fatiando para a máquina." posicao="baixo">
                    <HelpCircle size={14} className="text-cyan-400/70 hover:text-cyan-500 cursor-help transition-colors" />
                  </Dica>
                </h3>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Custo Adicional ({textoModo})</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-xs font-black text-muted-foreground">R$</span>
                   <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 tracking-tight leading-none">
                     {((Math.round((tempoModelagem / 60) * valorHoraModelagem)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-4 items-start">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider ml-1">Valor da Hora (R$)</label>
                    <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-cyan-500/40 transition-all shadow-inner overflow-hidden">
                      <span className="absolute left-3 text-[10px] font-black text-muted-foreground">R$</span>
                      <InputBancario 
                        placeholder="0.00" 
                        value={valorHoraModelagem === 0 ? "" : valorHoraModelagem / 100} 
                        onChange={(e) => setValorHoraModelagem(Math.round(extrairValorNumerico(e.target.value) * 100))} 
                        className="w-full h-11 pl-10 pr-4 bg-transparent outline-none font-bold text-xs text-primary dark:text-white text-left" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider ml-1">Tempo de Projeto</label>
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-cyan-500/40 transition-all shadow-inner">
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={tempHora !== undefined ? tempHora : (Math.floor(tempoModelagem / 60) === 0 ? "" : (Math.floor(tempoModelagem / 60) || ""))} 
                          onFocus={() => {}}
                          onBlur={() => setTempHora(undefined)}
                          onChange={(e) => {
                            const v = e.target.value;
                            setTempHora(v);
                            setTempoModelagem((v === "" ? 0 : Number(v)) * 60 + Math.floor(tempoModelagem % 60) + (tempoModelagem % 1));
                          }} 
                          className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-bold text-xs text-center text-primary dark:text-white" 
                        />
                        <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">h</span>
                      </div>

                      <span className="text-zinc-400 font-bold">:</span>

                      <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-cyan-500/40 transition-all shadow-inner">
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={tempMinuto !== undefined ? tempMinuto : (Math.floor(tempoModelagem % 60) === 0 ? "" : (Math.floor(tempoModelagem % 60) || ""))} 
                          onFocus={() => {}}
                          onBlur={() => setTempMinuto(undefined)}
                          onChange={(e) => {
                            const v = e.target.value;
                            setTempMinuto(v);
                            setTempoModelagem(Math.floor(tempoModelagem / 60) * 60 + (v === "" ? 0 : Number(v)) + (tempoModelagem % 1));
                          }} 
                          className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-bold text-xs text-center text-primary dark:text-white" 
                        />
                        <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">MIN</span>
                      </div>

                      <span className="text-zinc-400 font-bold">:</span>

                      <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-cyan-500/40 transition-all shadow-inner">
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={tempSegundo !== undefined ? tempSegundo : (Math.round((tempoModelagem % 1) * 60) === 0 ? "" : (Math.round((tempoModelagem % 1) * 60) || ""))} 
                          onFocus={() => {}}
                          onBlur={() => setTempSegundo(undefined)}
                          onChange={(e) => {
                            const v = e.target.value;
                            setTempSegundo(v);
                            setTempoModelagem(Math.floor(tempoModelagem / 60) * 60 + Math.floor(tempoModelagem % 60) + (v === "" ? 0 : Number(v) / 60));
                          }} 
                          className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-bold text-xs text-center text-primary dark:text-white" 
                        />
                        <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">SEG</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
