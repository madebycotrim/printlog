import { Crown, Zap, User } from "lucide-react";
import { PlanoUsuario } from "@/compartilhado/tipos/modelos";

interface PropriedadesSeloPlano {
  plano?: PlanoUsuario;
  exibirSempre?: boolean;
  tamanho?: "pequeno" | "normal";
  className?: string;
}

/**
 * Selo de Plano - Identificador visual de exclusividade (Maker Fundador vs Maker Pro).
 * Reflete o novo sistema de exclusividade: os primeiros 51 são Fundadores.
 */
export function SeloPlano({ 
  plano, 
  exibirSempre = false, 
  tamanho = "normal",
  className = "" 
}: PropriedadesSeloPlano) {
  if (!plano && !exibirSempre) return null;

  const config = {
    FUNDADOR: {
      rotulo: "Maker Fundador",
      icone: Crown,
      classes: "bg-sky-500/10 border-sky-500/20 text-sky-500 shadow-[0_0_5px_rgba(14,165,233,0.1)]",
      iconeClasse: "fill-sky-500 animate-pulse",
    },
    PRO: {
      rotulo: "Maker Pro",
      icone: Zap,
      classes: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.1)]",
      iconeClasse: "fill-indigo-500",
    },
    FREE: {
      rotulo: "Maker",
      icone: User,
      classes: "bg-gray-500/10 border-gray-500/10 text-gray-400 dark:text-zinc-500",
      iconeClasse: "",
    }
  };

  const atual = config[plano || "FREE"];
  const Icone = atual.icone;

  const classesTamanho = tamanho === "pequeno" 
    ? "px-1.5 py-0.5 text-[8px] gap-1" 
    : "px-2.5 py-1 text-[9px] gap-1.5";

  const iconeTamanho = tamanho === "pequeno" ? 8 : 10;

  // Se for plano FREE e não estiver configurado para exibir sempre, não mostra nada
  if (plano === "FREE" && !exibirSempre) return null;

  return (
    <div className={`
      flex items-center rounded-full border font-black uppercase tracking-widest transition-all duration-300
      ${atual.classes} ${classesTamanho} ${className}
    `}>
      <Icone size={iconeTamanho} className={atual.iconeClasse} />
      <span>{atual.rotulo}</span>
    </div>
  );
}
