import { useLocation, useNavigate } from "react-router-dom";
import { FolderKanban, Calendar, History } from "lucide-react";

import { PaginaProjetos } from "./projetos/pagina";
import { PaginaFila } from "./fila/pagina";
import { PaginaLinhaDoTempo } from "./historico/PaginaLinhaDoTempo";

import { useState, useEffect } from "react";

export function PaginaProducao() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const abaUrl = params.get("aba");

  const [abaAtiva, setAbaAtiva] = useState<"fluxo" | "fila" | "timeline">(
    (abaUrl === "fila" || abaUrl === "timeline") ? abaUrl : "fluxo"
  );

  useEffect(() => {
    const abaValida = (abaUrl === "fila" || abaUrl === "timeline") ? abaUrl : "fluxo";
    if (abaValida !== abaAtiva) {
      setAbaAtiva(abaValida);
    }
  }, [abaUrl]);

  const mudarAba = (aba: "fluxo" | "fila" | "timeline") => {
    setAbaAtiva(aba);
    if (aba === "fluxo") {
      navigate(location.pathname, { replace: true });
    } else {
      navigate(`${location.pathname}?aba=${aba}`, { replace: true });
    }
  };

  const abas = [
    { id: "fluxo", rotulo: "Fluxo Kanban", icone: FolderKanban },
    { id: "fila", rotulo: "Fila de Impressão", icone: Calendar },
    { id: "timeline", rotulo: "Linha do Tempo", icone: History },
  ];

  return (
    <div className="flex-1 flex flex-col space-y-3 min-h-0 overflow-hidden">
      {/* Tab bar switch with premium styling */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/20 dark:bg-black/10 backdrop-blur-xl mb-3 overflow-x-auto scrollbar-none shrink-0">
        {abas.map((aba) => {
          const ativo = abaAtiva === aba.id;
          const Icone = aba.icone;
          return (
            <button
              key={aba.id}
              onClick={() => mudarAba(aba.id as any)}
              className={`relative py-3 px-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ease-out ${
                ativo 
                  ? "text-zinc-800 dark:text-zinc-100 border-b-2 border-sky-500 dark:border-sky-400 bg-zinc-100/40 dark:bg-white/[0.02] rounded-t-lg" 
                  : "text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 border-b-2 border-transparent"
              }`}
            >
              <Icone 
                size={14} 
                className={`transition-transform duration-200 ${ativo ? "scale-105 text-sky-500 dark:text-sky-400" : "text-zinc-400 dark:text-zinc-500"}`} 
              />
              <span>{aba.rotulo}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {abaAtiva === "fluxo" && <PaginaProjetos />}
        {abaAtiva === "fila" && <PaginaFila />}
        {abaAtiva === "timeline" && <PaginaLinhaDoTempo />}
      </div>
    </div>
  );
}
