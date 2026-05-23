import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FolderKanban, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PaginaProjetos } from "./projetos/pagina";
import { PaginaFila } from "./fila/pagina";

export function PaginaProducao() {
  const [params, setParams] = useSearchParams();
  const abaUrl = params.get("aba");
  
  const [abaAtiva, setAbaAtiva] = useState<"fluxo" | "fila">(
    abaUrl === "fila" ? "fila" : "fluxo"
  );

  useEffect(() => {
    if (abaUrl === "fila" && abaAtiva !== "fila") {
      setAbaAtiva("fila");
    } else if (abaUrl !== "fila" && abaAtiva !== "fluxo") {
      setAbaAtiva("fluxo");
    }
  }, [abaUrl, abaAtiva]);

  const mudarAba = (aba: "fluxo" | "fila") => {
    setAbaAtiva(aba);
    if (aba === "fila") {
      setParams({ aba: "fila" });
    } else {
      setParams({});
    }
  };

  const abas = [
    { id: "fluxo", rotulo: "Fluxo Kanban", icone: FolderKanban },
    { id: "fila", rotulo: "Fila de Impressão", icone: Calendar },
  ];

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Tab bar switch with premium styling */}
      <div className="flex items-center border-b border-borda-sutil bg-zinc-50/30 dark:bg-white/[0.005] -mx-8 px-8 -mt-6 mb-4">
        {abas.map((aba) => {
          const ativo = abaAtiva === aba.id;
          const Icone = aba.icone;
          return (
            <button
              key={aba.id}
              onClick={() => mudarAba(aba.id as any)}
              className={`relative py-4 px-6 flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                ativo 
                  ? "text-sky-500 font-extrabold" 
                  : "text-zinc-400 hover:text-primary dark:hover:text-zinc-300"
              }`}
            >
              <Icone size={14} strokeWidth={ativo ? 3 : 2} />
              {aba.rotulo}
              {ativo && (
                <motion.div 
                  layoutId="aba-ativa-producao-principal" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-sky-500" 
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
            {abaAtiva === "fluxo" ? <PaginaProjetos /> : <PaginaFila />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
