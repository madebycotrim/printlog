import { useState } from "react";
import { Trophy, Sparkles } from "lucide-react";
import { useMedalhasMaker } from "@/compartilhado/hooks/useMedalhasMaker";
import { ModalSalaTrofeus } from "./ModalSalaTrofeus";

interface PropriedadesBadgeMaker {
  tamanho?: "pequeno" | "normal" | "grande";
  className?: string;
  exibirContagem?: boolean;
}

/**
 * Badge Maker - Substitui os antigos selos VIP/Planos por Medalhas & Conquistas acumuláveis.
 * Clicável: abre a Sala de Troféus Maker.
 */
export function BadgeMaker({
  tamanho = "normal",
  className = "",
  exibirContagem = true,
}: PropriedadesBadgeMaker) {
  const [modalAberto, setModalAberto] = useState(false);
  const { totalConquistadas, medalhaDestaque, nivelMaker } = useMedalhasMaker();

  const classesTamanho = {
    pequeno: "px-2 py-0.5 text-[8px] gap-1",
    normal: "px-2.5 py-1 text-[9px] gap-1.5",
    grande: "px-3.5 py-1.5 text-xs gap-2",
  }[tamanho];

  const iconeTamanho = tamanho === "pequeno" ? 10 : tamanho === "grande" ? 14 : 11;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAberto(true)}
        title="Ver suas medalhas e conquistas maker"
        className={`
          inline-flex items-center rounded-full font-black uppercase tracking-wider transition-all duration-300
          border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50
          hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.15)] cursor-pointer select-none group
          ${classesTamanho} ${className}
        `}
      >
        <Trophy
          size={iconeTamanho}
          className="text-amber-400 group-hover:rotate-12 transition-transform shrink-0"
        />
        <span>
          {exibirContagem
            ? `${totalConquistadas} ${totalConquistadas === 1 ? "Medalha" : "Medalhas"}`
            : (medalhaDestaque?.titulo || nivelMaker.titulo)}
        </span>
        <Sparkles size={iconeTamanho - 2} className="text-amber-400/80 animate-pulse shrink-0" />
      </button>

      <ModalSalaTrofeus
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
      />
    </>
  );
}
