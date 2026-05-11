import { LucideIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface EstadoVazioProps {
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  textoBotao?: string;
  aoClicarBotao?: () => void;
}

/**
 * 🎨 EstadoVazio (Versão Studio Seamless)
 * Totalmente integrado ao design system atual do PrintLog v2.
 * Foco em minimalismo, tipografia Studio e integração com a grade técnica.
 */
export function EstadoVazio({ titulo, descricao, icone: Icone, textoBotao, aoClicarBotao }: EstadoVazioProps) {
  return (
    <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center py-12 px-6">
      
      {/* ── Brilho de Profundidade Sutil (Integrado ao Fundo) ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* ── Conteúdo Central ── */}
      <div className="relative z-10 flex flex-col items-center max-w-md text-center">
        
        {/* Container de Ícone (Estilo Studio) */}
        <div className="mb-10 relative">
          {/* Círculo de Foco Sutil */}
          <div className="absolute inset-0 scale-150 bg-sky-500/10 blur-2xl rounded-full" />
          
          <div className="relative w-24 h-24 rounded-2xl bg-muted/30 border border-borda-sutil flex items-center justify-center shadow-sm backdrop-blur-sm">
            <Icone 
              size={40} 
              strokeWidth={1} 
              className="text-primary opacity-40" 
            />
          </div>
        </div>

        {/* Tipografia Studio (Alta Fidelidade) */}
        <div className="space-y-3">
          <h3 className="text-3xl font-black text-primary uppercase tracking-tighter leading-none">
            {titulo}
          </h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[280px] mx-auto">
            {descricao}
          </p>
        </div>

        {/* Botão Padronizado (Mesmo estilo do Header) */}
        {textoBotao && aoClicarBotao && (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={aoClicarBotao}
            className="mt-10 flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-sky-500/20 transition-all uppercase tracking-widest text-[11px]"
          >
            <Plus size={16} strokeWidth={3} />
            {textoBotao}
          </motion.button>
        )}
      </div>

      {/* Linhas Técnicas de Canto (Muito Sutis) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/[0.02] rounded-full pointer-events-none" />
    </div>
  );
}
