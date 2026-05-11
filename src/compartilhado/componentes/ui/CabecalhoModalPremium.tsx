import { ReactNode } from "react";
import { X } from "lucide-react";

interface PropriedadesCabecalho {
  titulo: string;
  subtitulo: ReactNode;
  icone: ReactNode;
  aoFechar: () => void;
  corTema?: string; // Hex ou classe Tailwind (ex: sky-500)
}

/**
 * 💎 CabecalhoModalPremium - O padrão de ouro para cabeçalhos de modal v10.0
 */
export function CabecalhoModalPremium({
  titulo,
  subtitulo,
  icone,
  aoFechar,
  corTema = "sky-500"
}: PropriedadesCabecalho) {
  // Verificamos se é uma classe Tailwind ou um Hex
  const ehHex = corTema.startsWith("#");
  const estiloAura = ehHex ? { backgroundColor: corTema } : {};
  const classeAura = ehHex ? "" : `bg-${corTema}`;

  return (
    <div className="relative px-8 py-8 flex items-center justify-between border-b border-borda-sutil overflow-hidden rounded-t-2xl">
      {/* Brilho de fundo (Aura) */}
      <div 
        className={`absolute -left-20 -top-20 w-80 h-80 blur-[100px] opacity-10 pointer-events-none transition-colors duration-1000 ${classeAura}`}
        style={estiloAura}
      />
      
      <div className="relative z-10 flex items-center gap-6">
        {/* Container do Ícone/Imagem */}
        <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center border border-borda-sutil overflow-hidden shadow-inner">
           {icone}
        </div>
        
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tighter leading-none">
            {titulo}
          </h3>
          <div className="flex items-center gap-2">
            {subtitulo}
          </div>
        </div>
      </div>

      <button 
        onClick={aoFechar} 
        className="relative z-10 p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400 hover:text-primary dark:hover:text-white transition-all active:scale-90"
      >
        <X size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
