import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FolderKanban, Calendar, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PaginaProjetos } from "./projetos/pagina";
import { PaginaFila } from "./fila/pagina";
import { PaginaLinhaDoTempo } from "./historico/PaginaLinhaDoTempo";

export function PaginaProducao() {
  const [params, setParams] = useSearchParams();
  const abaUrl = params.get("aba");
  
  const [abaAtiva, setAbaAtiva] = useState<"fluxo" | "fila" | "timeline">(
    (abaUrl as any) || "fluxo"
  );

  useEffect(() => {
    if (abaUrl && abaUrl !== abaAtiva) {
      setAbaAtiva(abaUrl as any);
    }
  }, [abaUrl, abaAtiva]);

  const mudarAba = (aba: "fluxo" | "fila" | "timeline") => {
    setAbaAtiva(aba);
    if (aba === "fluxo") {
      setParams({});
    } else {
      setParams({ aba });
    }
  };

  const abas = [
    { id: "fluxo", rotulo: "Fluxo Kanban", icone: FolderKanban },
    { id: "fila", rotulo: "Fila de Impressão", icone: Calendar },
    { id: "timeline", rotulo: "Linha do Tempo", icone: History },
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Tab bar switch with premium styling */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 backdrop-blur-xl -mt-6 md:-mt-8 lg:-mt-10 -mx-6 md:-mx-8 lg:-mx-10 px-6 md:px-8 lg:px-10 mb-6">
        {abas.map((aba) => {
          const ativo = abaAtiva === aba.id;
          const Icone = aba.icone;
          return (
            <button
              key={aba.id}
              onClick={() => mudarAba(aba.id as any)}
              className={`relative py-4 px-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ease-out group ${
                ativo 
                  ? "text-primary dark:text-[#38bdf8]" 
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {ativo && (
                <motion.div
                  layoutId="aba-ativa-producao-bg"
                  className="absolute inset-0 bg-gradient-to-t from-primary/10 dark:from-[#38bdf8]/15 to-transparent rounded-t-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              <Icone 
                size={15} 
                strokeWidth={ativo ? 2.5 : 2} 
                className={`relative z-10 transition-transform duration-300 ${ativo ? "scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" : "group-hover:scale-110 group-hover:text-primary dark:group-hover:text-[#38bdf8]"}`} 
              />
              <span className="relative z-10">{aba.rotulo}</span>
              
              {ativo && (
                <motion.div 
                  layoutId="aba-ativa-producao-linha" 
                  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-primary dark:bg-[#38bdf8] shadow-[0_-2px_12px_rgba(56,189,248,0.6)]" 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={abaAtiva}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {abaAtiva === "fluxo" && <PaginaProjetos />}
            {abaAtiva === "fila" && <PaginaFila />}
            {abaAtiva === "timeline" && <PaginaLinhaDoTempo />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
