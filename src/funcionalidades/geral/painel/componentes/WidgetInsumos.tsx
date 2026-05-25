import { Box, ArrowRight } from "lucide-react";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { CATEGORIAS } from "@/funcionalidades/producao/insumos/constantes";

interface PropriedadesWidgetInsumos {
  insumos: Insumo[];
  aoVerTodos: () => void;
}

const CORES_HEX: Record<string, string> = {
  Limpeza: "#0ea5e9", // sky-500
  Embalagem: "#f59e0b", // amber-500
  Embrulho: "#ec4899", // pink-500
  Fixação: "#ef4444", // red-500
  Eletrônica: "#8b5cf6", // violet-500
  Acabamento: "#10b981", // emerald-500
  Proteção: "#14b8a6", // teal-500
  Geral: "#71717a", // zinc-500
  Outros: "#78716c", // stone-500
};

const BORDAS_HOVER: Record<string, string> = {
  Limpeza: "hover:border-sky-500/30",
  Embalagem: "hover:border-amber-500/30",
  Embrulho: "hover:border-pink-500/30",
  Fixação: "hover:border-red-500/30",
  Eletrônica: "hover:border-violet-500/30",
  Acabamento: "hover:border-emerald-500/30",
  Proteção: "hover:border-teal-500/30",
  Geral: "hover:border-zinc-500/30",
  Outros: "hover:border-stone-500/30",
};

const TEXTOS_HOVER: Record<string, string> = {
  Limpeza: "group-hover/item:text-sky-500",
  Embalagem: "group-hover/item:text-amber-500",
  Embrulho: "group-hover/item:text-pink-500",
  Fixação: "group-hover/item:text-red-500",
  Eletrônica: "group-hover/item:text-violet-500",
  Acabamento: "group-hover/item:text-emerald-500",
  Proteção: "group-hover/item:text-teal-500",
  Geral: "group-hover/item:text-zinc-500",
  Outros: "group-hover/item:text-stone-500",
};

export function WidgetInsumos({ insumos, aoVerTodos }: PropriedadesWidgetInsumos) {
  const criticos = [...insumos]
    .map(i => ({
      ...i,
      percentual: i.quantidadeMinima && i.quantidadeAtual 
        ? Math.min(100, (i.quantidadeAtual / (i.quantidadeMinima * 2)) * 100) 
        : 100
    }))
    .sort((a, b) => (a.quantidadeAtual || 0) - (b.quantidadeAtual || 0))
    .slice(0, 8);

  return (
    <div className="bg-card border border-borda-sutil rounded-[2rem] p-8 h-full shadow-media flex flex-col group/widget relative overflow-hidden transition-all hover:bg-zinc-50 dark:hover:bg-white/[0.01]">
      {/* Grid Pattern Background - Subtil */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex flex-col">
          <h4 className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">Insumos Críticos</h4>
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Monitor de Reposição</span>
        </div>
        <button 
          onClick={aoVerTodos}
          className="group/btn flex items-center gap-2 text-[10px] text-sky-500 font-black hover:opacity-80 transition-all tracking-widest uppercase"
        >
          REPOR
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-borda-sutil pr-1 relative z-10">
        {criticos.length === 0 ? (
          <div className="col-span-2 text-center py-8 flex flex-col items-center opacity-20">
            <Box size={24} className="mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">Estoque em dia</span>
          </div>
        ) : (
          criticos.map((insumo, idx) => {
            const categoriaCor = CORES_HEX[insumo.categoria] || "#f59e0b"; // Fallback para amber
            const bordaHover = BORDAS_HOVER[insumo.categoria] || "hover:border-amber-500/30";
            const textoHover = TEXTOS_HOVER[insumo.categoria] || "group-hover/item:text-amber-500";
            const categoriaInfo = CATEGORIAS.find(c => c.id.toLowerCase() === insumo.categoria?.toLowerCase());
            const IconeCategoria = categoriaInfo?.icone || Box;
            
            return (
              <div key={insumo.id} className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-zinc-50 dark:bg-white/[0.02] border border-borda-sutil ${bordaHover} transition-all hover:bg-white/[0.04] dark:hover:bg-white/[0.04] group/item shadow-sm hover:shadow-md text-center`}>
                {/* Gráfico circular animado ao redor do ícone */}
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0 mb-3">
                  <style>{`
                    @keyframes svg-insumo-gauge-fill-${idx} {
                      from { stroke-dashoffset: 131.95; }
                      to { stroke-dashoffset: ${131.95 * (1 - insumo.percentual / 100)}; }
                    }
                  `}</style>
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                    {/* Círculo de fundo */}
                    <circle
                      cx="24"
                      cy="24"
                      r="21"
                      className="stroke-zinc-200 dark:stroke-zinc-800/80"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    {/* Círculo de progresso */}
                    <circle
                      cx="24"
                      cy="24"
                      r="21"
                      stroke={insumo.quantidadeAtual < insumo.quantidadeMinima ? "#f43f5e" : categoriaCor}
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={131.95}
                      style={{
                        animation: `svg-insumo-gauge-fill-${idx} 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                        filter: `drop-shadow(0 0 4px ${insumo.quantidadeAtual < insumo.quantidadeMinima ? "#f43f5e" : categoriaCor}40)`
                      }}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Ícone interno (totalmente circular, sem fundo) */}
                  <div className={`w-9 h-9 flex items-center justify-center rounded-full z-10 transition-all duration-300 group-hover/item:scale-110 ${
                    insumo.quantidadeAtual < insumo.quantidadeMinima 
                      ? "text-rose-400 group-hover/item:text-rose-500" 
                      : `text-zinc-400 ${textoHover}`
                  }`}>
                    <IconeCategoria size={20} />
                  </div>
                </div>

                {/* Informações organizadas de forma vertical e centralizada */}
                <div className="space-y-1 w-full min-w-0">
                  <h5 className={`text-[11px] font-black text-primary dark:text-zinc-200 uppercase tracking-wider truncate leading-tight transition-colors ${textoHover}`}>
                    {insumo.nome}
                  </h5>
                  
                  {/* Quantidade e Porcentagem em uma única linha organizada */}
                  <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                    <span className="font-extrabold" style={{ color: insumo.quantidadeAtual < insumo.quantidadeMinima ? "#f43f5e" : categoriaCor }}>
                      {Math.round(insumo.percentual)}%
                    </span>
                    <span>•</span>
                    <span className="tabular-nums font-medium">
                      {insumo.quantidadeAtual}{insumo.unidadeMedida || 'un'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
