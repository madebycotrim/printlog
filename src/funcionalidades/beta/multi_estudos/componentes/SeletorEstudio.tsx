import { ChevronDown, Briefcase, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usarEstudio } from "../contextos/ContextoEstudio";

export function SeletorEstudio() {
  const { estudioAtivo, estudios, definirEstudioAtivo } = usarEstudio();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", clicarFora);
    return () => document.removeEventListener("mousedown", clicarFora);
  }, []);

  if (!estudioAtivo) return null;

  return (
    <div className="px-4 mb-4 relative" ref={ref}>
      <button
        onClick={() => setAberto(!aberto)}
        className={`
                    w-full flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/[0.04] 
                    border border-gray-100 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all duration-300
                    ${aberto ? "ring-2 ring-sky-500/20 border-sky-500/50" : ""}
                `}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Briefcase size={16} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500">
              Estúdio Ativo
            </span>
            <span className="text-sm font-black text-zinc-900 dark:text-white truncate max-w-[120px]">
              {estudioAtivo.nome}
            </span>
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-300 ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-4 right-4 top-full mt-2 z-50 p-2 bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl"
          >
            <div className="space-y-1 mb-2">
              {estudios.map((estudio) => (
                <button
                  key={estudio.id}
                  onClick={() => {
                    definirEstudioAtivo(estudio.id);
                    setAberto(false);
                  }}
                  className={`
                                        w-full flex items-center gap-3 p-2.5 rounded-xl transition-all
                                        ${
                                          estudio.id === estudioAtivo.id
                                            ? "bg-sky-500 text-white font-bold"
                                            : "hover:bg-gray-50 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400"
                                        }
                                    `}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${estudio.id === estudioAtivo.id ? "bg-white" : "bg-zinc-400"}`}
                  />
                  <span className="text-xs uppercase tracking-widest font-black">{estudio.nome}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-white/5">
              <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 bg-zinc-800 text-white transition-all group opacity-50 cursor-not-allowed">
                <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Novo Estúdio (Fase 3)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
