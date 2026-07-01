import React from "react";
import { Check } from "lucide-react";

export interface Etapa {
  id: number;
  titulo: string;
}

interface PropriedadesIndicadorEtapas {
  etapas: Etapa[];
  etapaAtual: number;
  corTema?: string;
}

export function IndicadorEtapas({ etapas, etapaAtual, corTema = "sky-500" }: PropriedadesIndicadorEtapas) {
  return (
    <div className="w-full pb-6">
      <div className="flex items-start justify-between w-full">
        {etapas.map((etapa, index) => {
          const isAtiva = etapaAtual === etapa.id;
          const isConcluida = etapaAtual > etapa.id;
          
          return (
            <React.Fragment key={etapa.id}>
              <div className="flex flex-col items-center gap-3 relative z-10 px-2 sm:px-4">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
                    isAtiva 
                      ? `bg-${corTema} text-white shadow-lg shadow-${corTema}/30 scale-110` 
                      : isConcluida
                        ? `bg-${corTema}/10 text-${corTema}`
                        : "bg-zinc-100 dark:bg-white/5 text-zinc-400"
                  }`}
                >
                  {isConcluida ? <Check size={14} strokeWidth={3} /> : etapa.id}
                </div>
                <span 
                  className={`text-[9px] font-black uppercase tracking-wider hidden sm:block transition-colors duration-300 max-w-[100px] text-center ${
                    isAtiva 
                      ? `text-${corTema}` 
                      : isConcluida 
                        ? "text-zinc-600 dark:text-zinc-400" 
                        : "text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  {etapa.titulo}
                </span>
              </div>
              
              {/* Linha conectora entre as etapas */}
              {index < etapas.length - 1 && (
                <div className="flex-1 h-[2px] bg-zinc-100 dark:bg-white/5 mt-4 mx-2" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
