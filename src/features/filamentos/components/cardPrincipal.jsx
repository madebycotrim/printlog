// src/features/filamentos/components/cardPrincipal.jsx
import React, { useMemo } from "react";
import { HelpCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  colorClass = "text-sky-500", 
  subtext
}) {
  const IconComponent = Icon || HelpCircle;

  // --- CORES DO TEMA (Estilo da Oficina) ---
  const theme = useMemo(() => {
    // Cores simplificadas para facilitar a leitura rápida na bancada
    if (colorClass.includes("rose") || colorClass.includes("red")) {
      return {
        bgHover: "hover:bg-rose-500/5",
        borderHover: "hover:border-rose-500/50",
        shadow: "group-hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]",
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/20"
      };
    }
    if (colorClass.includes("emerald") || colorClass.includes("green")) {
      return {
        bgHover: "hover:bg-emerald-500/5",
        borderHover: "hover:border-emerald-500/50",
        shadow: "group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      };
    }
    if (colorClass.includes("amber") || colorClass.includes("yellow") || colorClass.includes("orange")) {
      return {
        bgHover: "hover:bg-amber-500/5",
        borderHover: "hover:border-amber-500/50",
        shadow: "group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20"
      };
    }
    // Padrão Azul/Sky (Cor da PrintLog)
    return {
      bgHover: "hover:bg-sky-500/5",
      borderHover: "hover:border-sky-500/50",
      shadow: "group-hover:shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)]",
      badge: "bg-zinc-800 text-zinc-400 border-zinc-700"
    };
  }, [colorClass]);

  return (
    <div
      className={`
        relative overflow-hidden group
        bg-[#0e0e11] border border-zinc-800/60
        rounded-2xl p-5
        transition-all duration-300 ease-out
        ${theme.borderHover} ${theme.bgHover} ${theme.shadow}
        flex flex-col justify-between min-h-[140px]
      `}
    >
      {/* --- EFEITO VISUAL --- */}
      {/* Ícone de fundo gigante para dar estilo ao card */}
      <div
        className={`
          absolute -right-6 -top-6
          opacity-[0.02] group-hover:opacity-[0.06]
          group-hover:scale-110 group-hover:-rotate-12
          transition-all duration-500 ease-out
          pointer-events-none
          ${colorClass}
        `}
      >
        <IconComponent size={140} strokeWidth={1.5} />
      </div>

      {/* --- CONTEÚDO --- */}
      <div className="relative z-10 flex flex-col h-full justify-between">

        {/* Topo: Ícone + Título Simples */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`
                p-2 rounded-lg border bg-zinc-900/50 backdrop-blur-md shadow-sm transition-colors
                border-zinc-800 group-hover:border-white/10
                ${colorClass}
              `}
            >
              <IconComponent size={18} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              {title}
            </span>
          </div>

          {/* Indicador visual de status */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
            <div className="bg-zinc-900/50 p-1 rounded-md border border-zinc-800 text-zinc-500">
              <Minus size={12} />
            </div>
          </div>
        </div>

        {/* Resultado Principal */}
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold text-zinc-100 font-mono tracking-tighter leading-none group-hover:text-white transition-colors">
            {value}
          </h3>

          {/* Legenda ou Status em destaque */}
          {subtext && (
            <div className="mt-3 flex items-center">
              <span
                className={`
                  text-[10px] font-bold px-2 py-0.5 rounded border
                  transition-colors duration-300
                  ${subtext.toString().includes('%') || subtext.toString().includes('Abaixo') || subtext.toString().includes('Pouco') 
                    ? theme.badge 
                    : 'text-zinc-500 border-transparent px-0'}
                `}
              >
                {subtext}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};