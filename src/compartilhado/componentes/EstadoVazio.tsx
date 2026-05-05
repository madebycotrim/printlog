import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface EstadoVazioProps {
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  textoBotao?: string;
  aoClicarBotao?: () => void;
}

/**
 * Componente compartilhado para estados vazios (Empty States).
 * Design premium com grade de pontos, anel de glow animado e hierarquia tipográfica.
 */
export function EstadoVazio({ titulo, descricao, icone: Icone, textoBotao, aoClicarBotao }: EstadoVazioProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-24 px-4 text-center relative overflow-hidden min-h-[480px]"
    >
      {/* Fundo: grade de pontos decorativa */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Gradiente de fade nas bordas - Removido para evitar efeito de caixa branca */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-50/50 dark:to-zinc-950/50 pointer-events-none" />
      
      {/* Conteúdo central */}
      <div className="relative z-10 flex flex-col items-center max-w-md">

        {/* Anel de glow animado + ícone */}
        <div className="relative mb-10">
          {/* Anel externo pulsante */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-zinc-300 dark:bg-zinc-500 blur-2xl"
          />

          {/* Anel médio */}
          <div className="absolute inset-2 rounded-full border border-zinc-100 dark:border-white/5" />

          {/* Container do ícone */}
          <div className="relative w-28 h-28 rounded-full bg-white dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.06] flex items-center justify-center shadow-xl">
            <Icone
              size={40}
              strokeWidth={1.25}
              className="text-zinc-400 dark:text-zinc-500"
            />
          </div>
        </div>

        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3 mb-10"
        >
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
            {titulo}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium max-w-xs mx-auto">
            {descricao}
          </p>
        </motion.div>

        {/* Botão de ação */}
        {textoBotao && aoClicarBotao && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            whileTap={{ scale: 0.97 }}
            onClick={aoClicarBotao}
            className="flex items-center gap-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black py-4 px-10 rounded-2xl shadow-xl hover:shadow-zinc-900/20 dark:hover:shadow-white/10 transition-all uppercase tracking-widest text-[11px]"
          >
            <Plus size={14} strokeWidth={3} />
            {textoBotao}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
