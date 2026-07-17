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
 * 🎨 EstadoVazio (Versão Premium Animada)
 * Design premium com micro-animações, glow effects e flutuação.
 */
export function EstadoVazio({ titulo, descricao, icone: Icone, textoBotao, aoClicarBotao, children }: EstadoVazioProps) {
  return (
    <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center py-16 px-6 overflow-hidden">
      
      {/* ── Background Elements Animados ── */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none" 
        style={{ backgroundColor: "rgba(var(--cor-primaria-rgb), 0.1)" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/[0.03] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-white/[0.01] rounded-full pointer-events-none dashed-border-spin" />

      {/* ── Conteúdo Central ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
        className="relative z-10 flex flex-col items-center max-w-md text-center"
      >
        
        {/* Container de Ícone Animado */}
        <motion.div 
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-10 relative group"
        >
          {/* Glow Dinâmico no Hover */}
          <div 
            className="absolute inset-0 blur-2xl rounded-full scale-110 opacity-50 group-hover:opacity-100 transition-opacity duration-700" 
            style={{ backgroundColor: "rgba(var(--cor-primaria-rgb), 0.2)" }}
          />
          
          <div 
            className="relative w-28 h-28 rounded-[2rem] bg-zinc-100/50 dark:bg-black/50 border border-borda-sutil dark:border-white/5 flex items-center justify-center shadow-2xl backdrop-blur-xl transition-colors duration-500"
            style={{ 
              borderColor: "var(--cor-primaria)",
              boxShadow: "0 0 0 1px rgba(var(--cor-primaria-rgb), 0.3) inset"
            }}
          >
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icone 
                size={48} 
                strokeWidth={1.5} 
                className="drop-shadow-[0_0_15px_currentColor]" 
                style={{ color: "var(--cor-primaria)" }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Tipografia */}
        <div className="space-y-4">
          <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 uppercase tracking-tighter leading-none">
            {titulo}
          </h3>
          <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed max-w-[320px] mx-auto">
            {descricao}
          </p>
        </div>

        {children && (
          <div className="mt-8 max-w-md w-full text-left">
            {children}
          </div>
        )}

        {/* Botão */}
        {textoBotao && aoClicarBotao && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.15 }}
          >
            <motion.button
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={aoClicarBotao}
              className="mt-12 relative overflow-hidden group flex items-center gap-3 text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] text-[11px]"
              style={{ 
                backgroundColor: "var(--cor-primaria)",
                boxShadow: "0 10px 40px -10px rgba(var(--cor-primaria-rgb), 0.8)"
              }}
            >
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" 
              />
              
              <Plus size={18} strokeWidth={3} className="relative z-10" />
              <span className="relative z-10">{textoBotao}</span>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
