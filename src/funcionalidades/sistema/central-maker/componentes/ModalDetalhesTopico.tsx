import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Clock } from "lucide-react";
import { useState } from "react";

interface InterfaceTopico {
  id: string;
  titulo: string;
  conteudo: string;
  nivel: string;
  atualizado: string;
  atualizado: string;
  categoria?: string;
  cor?: string;
  level?: string;
}

interface Propriedades {
  topico: InterfaceTopico | null;
  aoFechar: () => void;
}

export function ModalDetalhesTopico({ topico, aoFechar }: Propriedades) {
  if (!topico) return null;

  return (
    <Dialogo
      aberto={!!topico}
      aoFechar={aoFechar}
      titulo={`${topico.categoria}  -//-  ${topico.titulo}`}
      larguraMax="max-w-3xl"
    >
      <div className="p-8 md:p-12 space-y-12 bg-white dark:bg-[#0c0c0e] relative overflow-hidden">
        {/* Elementos Decorativos de Fundo */}
        <div
          className={`absolute top-0 right-0 w-96 h-96 ${topico.cor?.replace("text", "bg") || "bg-sky-500"}/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none`}
        />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-none">
                Instrução <span className={topico.cor || "text-sky-500"}>Técnica</span>
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    Revisão: {topico.atualizado}
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className={`text-[10px] font-black ${topico.cor || "text-sky-500"} uppercase tracking-widest`}>
                  ID: {topico.id}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`px-5 py-2.5 rounded-xl ${topico.cor || "text-[var(--cor-primaria)]"} bg-current/10 border border-current/20 shadow-lg shadow-current/5 backdrop-blur-sm self-start md:self-center`}
          >
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">
              Nível: {topico.level || topico.nivel}
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <div
              className={`w-2 h-8 rounded-full bg-gradient-to-b ${topico.cor?.replace("text", "bg") || "bg-sky-500"} ${topico.cor?.replace("text", "bg").replace("-500", "-600") || "bg-sky-600"} shadow-lg opacity-80`}
            />
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-zinc-500">
              Parâmetros Operacionais
            </h4>
          </div>
          <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-zinc-300 font-medium tracking-tight">
            {topico.conteudo}
          </p>
        </div>

        </div>
      </div>
      </div>
    </Dialogo>
  );
}
