import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";
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
    <div className={`p-6 rounded-3xl bg-card border border-borda-sutil relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl transition-all duration-500 overflow-hidden ${!mostrar ? 'opacity-60' : ''}`}>
      {/* Efeito Glow Rosa de Fundo */}
      <div className="absolute -top-24 -right-20 w-80 h-80 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />
      
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-borda-sutil">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${mostrar ? 'text-pink-500 border-pink-500/30 bg-pink-500/10' : 'text-zinc-500 border-borda-sutil bg-muted/20'}`}>
            <Wallet size={18} className={mostrar && insumosFixos > 0 ? "animate-pulse" : ""} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Custos Fixos e Extras</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Brindes, embalagens, marketing ou adicionais</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const novoEstado = !mostrar;
            setMostrar(novoEstado);
            setCobrarInsumosFixos(novoEstado);
          }}
          className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500/50 ${
            mostrar ? 'bg-pink-500' : 'bg-muted dark:bg-zinc-700'
          }`}
          aria-label="Adicionar Custos Fixos"
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
            className="flex flex-col gap-1.5 relative z-10"
          >
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Valor do Custo Fixo (R$)</label>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
