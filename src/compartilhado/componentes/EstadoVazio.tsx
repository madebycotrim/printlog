import { LucideIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface EstadoVazioProps {
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  textoBotao?: string;
  aoClicarBotao?: () => void;
  children?: React.ReactNode;
}

/**
 * 🎨 EstadoVazio (Premium SaaS - Linear / Vercel Style)
 * Focado na elegância absoluta do padrão da indústria de SaaS atual.
 * Utiliza iluminação sutil (spotlights em blur), tipografia limpa, caixas com sombras
 * refinadas e animações extremamente suaves (sem distração geométrica).
 */
export function EstadoVazio({ titulo, descricao, icone: Icone, textoBotao, aoClicarBotao, children }: EstadoVazioProps) {
  return (
    <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center py-20 px-6 overflow-hidden">
      
      {/* ── Spotlight Background Ultra Suave ── */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/15 blur-[100px]"
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-[#09090b]/40 backdrop-blur-[2px]" />
      </div>

      {/* ── Conteúdo Central Premium ── */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-[420px] text-center"
      >
        
        {/* Ícone com Box-Shadow Refinado */}
        <div className="mb-8 relative">
          {/* Brilho do Ícone */}
          <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-3xl translate-y-2" />
          
          <motion.div 
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center w-20 h-20 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
          >
            {/* Detalhe de Glassmorphism Interno */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/40 dark:to-white/5 rounded-2xl pointer-events-none" />
            <Icone size={34} strokeWidth={1.5} className="text-zinc-700 dark:text-zinc-300" />
          </motion.div>
        </div>

        {/* Tipografia Limpa */}
        <div className="space-y-2.5 mb-8">
          <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {titulo}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[340px] mx-auto">
            {descricao}
          </p>
        </div>

        {children && (
          <div className="w-full mb-8">
            {children}
          </div>
        )}

        {/* Botão Padrão Ouro UI */}
        {textoBotao && aoClicarBotao && (
          <button
            onClick={aoClicarBotao}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-sm font-medium py-2.5 px-6 rounded-lg transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10 active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={2} />
            {textoBotao}
          </button>
        )}
      </motion.div>
    </div>
  );
}
