import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";
import { Dica } from "@/compartilhado/componentes/ui";

/**
 * Interface para as propriedades do CardPerdas.
 */
interface PropriedadesCardPerdas {
  mostrar: boolean;
  setMostrar: (v: boolean) => void;
  materialPerdido: number;
  setMaterialPerdido: (v: number) => void;
  tempoPerdido: number;
  setTempoPerdido: (v: number) => void;
  custoFalha?: number;
  modoEntrada?: 'unitario' | 'lote' | 'projeto';
}

/**
 * Card para registro de desperdício (material e tempo perdidos).
 */
export function CardPerdas({
  mostrar,
  setMostrar,
  materialPerdido,
  setMaterialPerdido,
  tempoPerdido,
  setTempoPerdido,
  custoFalha,
  modoEntrada = 'lote'
}: PropriedadesCardPerdas) {
  const textoModo = modoEntrada === 'unitario' ? 'Unidade' : modoEntrada === 'projeto' ? 'Projeto' : 'Lote';
  const [tempHora, setTempHora] = useState<string | undefined>(undefined);
  const [tempMinuto, setTempMinuto] = useState<string | undefined>(undefined);
  const [tempSegundo, setTempSegundo] = useState<string | undefined>(undefined);
  return (
    <div className="flex flex-col">
      <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(244,63,94,0.15)] transition-all z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 shadow-inner">
            <AlertTriangle size={16} className={`${materialPerdido > 0 || tempoPerdido > 0 ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">Prever falha ou erro de impressão?</span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Cobra um adicional no orçamento para cobrir possíveis peças perdidas</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMostrar(!mostrar)}
          className={`px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all border ${mostrar
            ? "bg-red-500 text-white border-red-600 shadow-sm shadow-red-500/30 hover:bg-red-600"
            : "bg-card text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/40 border-borda-sutil shadow-sm"
            }`}
        >
          {mostrar ? "Ocultar" : "Reportar"}
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
                <AlertCircle size={16} className="text-red-400" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1">
                  Taxa de Risco (Gordura)
                  <Dica texto="Estime quantas gramas de filamento ou horas costumam dar errado nesse tipo de peça. O sistema adicionará isso ao custo do cliente." posicao="baixo">
                    <HelpCircle size={14} className="text-red-400/70 hover:text-red-500 cursor-help transition-colors" />
                  </Dica>
                </h3>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Custo Adicional ({textoModo})</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-xs font-black text-muted-foreground">R$</span>
                   <span className="text-lg font-black text-red-600 dark:text-red-400 tracking-tight leading-none">
                     {((custoFalha || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-4 items-start">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider ml-1">Filamento Perdido</label>
                <div className="relative flex items-center h-11 bg-muted/40 dark:bg-zinc-800/40 rounded-xl border border-borda-sutil focus-within:border-red-500/40 transition-all shadow-inner">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={materialPerdido || ""}
                    onChange={(e) => setMaterialPerdido(Number(e.target.value))}
                    className="w-full h-11 bg-transparent px-4 font-bold text-xs text-primary dark:text-white outline-none"
                  />
                  <span className="absolute right-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest select-none">gramas</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider ml-1">Tempo Perdido</label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-red-500/40 transition-all shadow-inner">
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={tempHora !== undefined ? tempHora : (Math.floor(tempoPerdido / 60) === 0 ? "" : (Math.floor(tempoPerdido / 60) || ""))} 
                      onFocus={() => {}}
                      onBlur={() => setTempHora(undefined)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTempHora(v);
                        setTempoPerdido((v === "" ? 0 : Number(v)) * 60 + Math.floor(tempoPerdido % 60) + (tempoPerdido % 1));
                      }} 
                      className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-bold text-xs text-center text-primary dark:text-white" 
                    />
                    <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">h</span>
                  </div>

                  <span className="text-zinc-400 font-bold">:</span>

                  <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-red-500/40 transition-all shadow-inner">
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={tempMinuto !== undefined ? tempMinuto : (Math.floor(tempoPerdido % 60) === 0 ? "" : (Math.floor(tempoPerdido % 60) || ""))} 
                      onFocus={() => {}}
                      onBlur={() => setTempMinuto(undefined)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTempMinuto(v);
                        setTempoPerdido(Math.floor(tempoPerdido / 60) * 60 + (v === "" ? 0 : Number(v)) + (tempoPerdido % 1));
                      }} 
                      className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-bold text-xs text-center text-primary dark:text-white" 
                    />
                    <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">MIN</span>
                  </div>

                  <span className="text-zinc-400 font-bold">:</span>

                  <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-red-500/40 transition-all shadow-inner">
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={tempSegundo !== undefined ? tempSegundo : (Math.round((tempoPerdido % 1) * 60) === 0 ? "" : (Math.round((tempoPerdido % 1) * 60) || ""))} 
                      onFocus={() => {}}
                      onBlur={() => setTempSegundo(undefined)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTempSegundo(v);
                        setTempoPerdido(Math.floor(tempoPerdido / 60) * 60 + Math.floor(tempoPerdido % 60) + (v === "" ? 0 : Number(v) / 60));
                      }} 
                      className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-bold text-xs text-center text-primary dark:text-white" 
                    />
                    <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">SEG</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
