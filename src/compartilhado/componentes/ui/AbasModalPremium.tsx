import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Aba {
  id: string;
  rotulo: string;
  icone: LucideIcon;
}

interface PropriedadesAbas {
  abas: Aba[];
  abaAtiva: string;
  aoMudarAba: (id: string) => void;
  corTema?: string;
}

/**
 * 🗂️ AbasModalPremium - Navegação padronizada com animação Smooth v10.0
 */
export function AbasModalPremium({
  abas,
  abaAtiva,
  aoMudarAba,
  corTema = "sky-500"
}: PropriedadesAbas) {
  const ehHex = corTema.startsWith("#");

  // Estilos dinâmicos baseados no tema (Hex ou Tailwind)
  const estiloTextoAtivo = ehHex ? { color: corTema } : {};
  const estiloLinhaAtiva = ehHex ? { backgroundColor: corTema } : {};

  // Se não for Hex, assumimos que é uma cor do Tailwind (ex: sky-500, amber-500)
  const classeTextoAtivo = ehHex ? "" : `text-${corTema}`;
  const classeLinhaAtiva = ehHex ? "" : `bg-${corTema}`;

  return (
    <div className="flex items-center px-8 border-b border-borda-sutil bg-zinc-50/30 dark:bg-white/[0.005]">
      {abas.map((aba) => (
        <button
          key={aba.id}
          onClick={() => aoMudarAba(aba.id)}
          className={`relative py-5 px-6 flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
            abaAtiva === aba.id ? classeTextoAtivo : "text-zinc-400 hover:text-primary dark:hover:text-zinc-300"
          }`}
          style={abaAtiva === aba.id ? estiloTextoAtivo : {}}
        >
          <aba.icone size={14} strokeWidth={abaAtiva === aba.id ? 3 : 2} />
          {aba.rotulo}
          {abaAtiva === aba.id && (
            <motion.div 
              layoutId="aba-ativa-premium" 
              className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${classeLinhaAtiva}`} 
              style={estiloLinhaAtiva}
            />
          )}
        </button>
      ))}
    </div>
  );
}
