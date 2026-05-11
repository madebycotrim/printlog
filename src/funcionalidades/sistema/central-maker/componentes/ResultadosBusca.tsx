import { motion } from "framer-motion";
import { Search, X, ChevronRight } from "lucide-react";
import { EstadoVazio } from "@/compartilhado/componentes";
import { InterfaceTopico } from "../utilitarios/dados";

interface PropriedadesResultados {
  busca: string;
  resultados: any[];
  aoLimpar: () => void;
  aoSelecionar: (topico: InterfaceTopico) => void;
}

export function ResultadosBusca({ busca, resultados, aoLimpar, aoSelecionar }: PropriedadesResultados) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.04] pb-6">
        <div className="flex items-center gap-3">
          <Search size={18} style={{ color: "var(--cor-primaria)" }} />
          <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
            Resultados para: <span style={{ color: "var(--cor-primaria)" }}>"{busca}"</span>
          </h2>
        </div>
        <button
          onClick={aoLimpar}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Limpar <X size={14} />
        </button>
      </div>

      {resultados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resultados.map((topico, index) => (
            <motion.button
              key={topico.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
              onClick={() => aoSelecionar(topico)}
              className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-card-fundo border border-gray-100 dark:border-white/[0.04] hover:bg-[var(--cor-primaria)]/5 transition-colors duration-500 group text-left shadow-sm hover:shadow-xl"
              style={{ borderLeft: "4px solid var(--cor-primaria)" }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400`}
                  >
                    {topico.categoria}
                  </span>
                </div>
                <h4 className="text-sm font-black text-gray-800 dark:text-zinc-200 uppercase tracking-tight">
                  {topico.titulo}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500 font-medium line-clamp-1">
                  {topico.conteudo}
                </p>
              </div>
              <ChevronRight
                size={18}
                className="text-gray-300 group-hover:translate-x-1 transition-all"
                style={{ color: "var(--cor-primaria)" }}
              />
            </motion.button>
          ))}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhum resultado encontrado"
          descricao="Tente buscar por termos técnicos diferentes ou consulte as categorias abaixo."
          icone={Search}
        />
      )}
    </div>
  );
}
