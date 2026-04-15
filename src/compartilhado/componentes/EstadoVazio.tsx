import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface EstadoVazioProps {
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  textoBotao?: string;
  aoClicarBotao?: () => void;
}

/**
 * Componente compartilhado para estados vazios (Empty States).
 * Segue o padrão visual premium do PrintLog v9.0.
 */
export function EstadoVazio({ titulo, descricao, icone: Icone, textoBotao, aoClicarBotao }: EstadoVazioProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-6 px-4 text-center h-full min-h-[400px] relative overflow-hidden"
    >
      {/* Ícone de fundo (Marca d'água) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] dark:opacity-[0.03] pointer-events-none">
        <Icone size={400} strokeWidth={0.5} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Ícone principal */}
        <div className="text-zinc-300 dark:text-zinc-700 mb-6 drop-shadow-sm">
          <Icone size={64} strokeWidth={1.5} />
        </div>

        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">{titulo}</h3>

        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-10 text-sm leading-relaxed font-medium">
          {descricao}
        </p>

        {textoBotao && aoClicarBotao && (
          <button
            onClick={aoClicarBotao}
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black py-3.5 px-10 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest text-[11px]"
          >
            {textoBotao}
          </button>
        )}
      </div>
    </motion.div>
  );
}
