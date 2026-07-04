import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

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
    <div className={`p-6 rounded-3xl bg-card border border-borda-sutil relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl transition-all duration-500 overflow-hidden ${!mostrar ? 'opacity-60' : ''}`}>
      {/* Efeito Glow Vermelho de Fundo */}
      <div className="absolute -top-24 -right-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />
      
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-borda-sutil">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${mostrar ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-zinc-500 border-borda-sutil bg-muted/20'}`}>
            <AlertTriangle size={18} className={mostrar && (materialPerdido > 0 || tempoPerdido > 0) ? "animate-pulse" : ""} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Perdas e Falhas</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Material e tempo perdidos na impressão</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMostrar(!mostrar)}
          className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
            mostrar ? 'bg-red-500' : 'bg-muted dark:bg-zinc-700'
          }`}
          aria-label="Reportar Perdas"
        >
          <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-300 ${
            mostrar ? 'translate-x-4' : 'translate-x-0'
          }`} />
        </button>
      </div>

      <AnimatePresence>
        {mostrar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Filamento Perdido</label>
              <div className="relative flex items-center bg-muted/40 dark:bg-black/20 rounded-xl border border-borda-sutil focus-within:border-red-500/40 shadow-inner">
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
              <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Tempo Perdido</label>
              <div className="relative flex items-center bg-muted/40 dark:bg-black/20 rounded-xl border border-borda-sutil focus-within:border-red-500/40 shadow-inner">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
