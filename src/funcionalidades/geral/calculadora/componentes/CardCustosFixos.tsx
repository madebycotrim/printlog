import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Box } from "lucide-react";
import { InputBancario } from "@/compartilhado/componentes/ui";

/**
 * Interface para as propriedades do CardCustosFixos.
 */
interface PropriedadesCardCustosFixos {
  mostrar: boolean;
  setMostrar: (v: boolean) => void;
  insumosFixos: number;
  setInsumosFixos: (v: number) => void;
  cobrarInsumosFixos: boolean;
  setCobrarInsumosFixos: (v: boolean) => void;
}

/**
 * Card para registro de custos fixos adicionais (brindes, marketing, etc).
 */
export function CardCustosFixos({
  mostrar,
  setMostrar,
  insumosFixos,
  setInsumosFixos,
  cobrarInsumosFixos: _cobrarInsumosFixos,
  setCobrarInsumosFixos
}: PropriedadesCardCustosFixos) {
  return (
    <div className="flex flex-col my-6">
      <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 via-pink-500/5 to-transparent border border-pink-500/20 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(217,70,239,0.15)] transition-all z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 shadow-inner">
            <Wallet size={16} className={`${insumosFixos > 0 ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400">Deseja adicionar custos fixos extras?</span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Brindes, mimos, marketing ou custos de gestão e embalagem</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const novoEstado = !mostrar;
            setMostrar(novoEstado);
            setCobrarInsumosFixos(novoEstado);
          }}
          className={`px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all border ${mostrar
            ? "bg-pink-500 text-white border-pink-600 shadow-sm shadow-pink-500/30 hover:bg-pink-600"
            : "bg-card text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-500/40 border-borda-sutil shadow-sm"
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

            <div className="flex items-center justify-between pb-3 border-b border-borda-sutil">
              <div className="flex items-center gap-3">
                <Box size={16} className="text-pink-400" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-pink-500">Gestão de Custos Adicionais</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider ml-1">Valor do Custo Fixo (R$)</label>
                <div className="relative flex items-center bg-muted/40 dark:bg-black/20 rounded-xl border border-borda-sutil focus-within:border-pink-500/40 shadow-inner">
                  <span className="absolute left-4 text-[10px] font-black text-muted-foreground">R$</span>
                  <InputBancario
                    placeholder="0,00"
                    value={insumosFixos || ""}
                    onChange={(e) => setInsumosFixos(Number(e.target.value))}
                    className="w-full h-11 bg-transparent pl-10 pr-4 font-black text-xs text-primary dark:text-white outline-none"
                  />
                </div>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1 ml-1">
                  Este valor será somado diretamente ao custo final do projeto.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
