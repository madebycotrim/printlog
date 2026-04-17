import { motion } from "framer-motion";

interface PropriedadesAcoesDescarte {
  aoConfirmarDescarte: () => void;
  aoContinuarEditando: () => void;
}

/**
 * Componente padronizado para confirmação de descarte de alterações.
 * Segue o padrão visual de elite (Regra 3.0).
 */
export function AcoesDescarte({ aoConfirmarDescarte, aoContinuarEditando }: PropriedadesAcoesDescarte) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 5 }}
      className="flex flex-col items-end gap-3 w-full animate-in fade-in duration-300"
    >
      <div className="flex items-center gap-6 w-full justify-between md:justify-end">
        <button
          type="button"
          onClick={aoConfirmarDescarte}
          className="px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-red-600 hover:text-red-500 transition-all"
        >
          Descartar Alterações
        </button>
        <button
          type="button"
          onClick={aoContinuarEditando}
          className="px-10 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-xl hover:brightness-110"
        >
          Continuar Editando
        </button>
      </div>
      
      <div className="flex flex-col items-end px-2">
        <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">
          Há alterações não salvas
        </span>
        <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.1em]">
          O progresso atual será perdido se você sair
        </span>
      </div>
    </motion.div>
  );
}
