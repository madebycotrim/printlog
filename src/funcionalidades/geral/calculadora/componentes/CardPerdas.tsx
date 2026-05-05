import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle } from "lucide-react";

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
  setTempoPerdido
}: PropriedadesCardPerdas) {
  return (
    <div className="flex flex-col my-6">
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(244,63,94,0.15)] transition-all z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 shadow-inner">
            <AlertTriangle size={16} className={`${materialPerdido > 0 || tempoPerdido > 0 ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Ocorreu alguma perda ou falha nessa impressão?</span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">O prejuízo será calculado e embutido no custo operacional</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMostrar(!mostrar)}
          className={`px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all border ${mostrar
            ? "bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-500/30 hover:bg-rose-600"
            : "bg-card text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/40 border-borda-sutil shadow-sm"
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
            <div className="flex items-center gap-3 pb-3 border-b border-borda-sutil">
              <AlertCircle size={16} className="text-rose-400" />
              <h3 className="text-[10px] font-black uppercase tracking-wider text-rose-500">Registro de Desperdício</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider ml-1">Filamento Perdido</label>
                <div className="relative flex items-center bg-muted/40 dark:bg-black/20 rounded-xl border border-borda-sutil focus-within:border-rose-500/40 shadow-inner">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={materialPerdido || ""}
                    onChange={(e) => setMaterialPerdido(Number(e.target.value))}
                    className="w-full h-11 bg-transparent px-4 font-black text-xs text-primary dark:text-white outline-none"
                  />
                  <span className="absolute right-4 text-[10px] font-black text-muted-foreground">gramas</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider ml-1">Tempo Perdido</label>
                <div className="relative flex items-center bg-muted/40 dark:bg-black/20 rounded-xl border border-borda-sutil focus-within:border-rose-500/40 shadow-inner">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={tempoPerdido / 60 || ""}
                    onChange={(e) => setTempoPerdido(Number(e.target.value) * 60)}
                    className="w-full h-11 bg-transparent px-4 font-black text-xs text-primary dark:text-white outline-none"
                  />
                  <span className="absolute right-4 text-[10px] font-black text-muted-foreground">horas</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
