import { Box, SprayCan, ArrowRight } from "lucide-react";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";

interface PropriedadesWidgetInsumos {
  insumos: Insumo[];
  aoVerTodos: () => void;
}

export function WidgetInsumos({ insumos, aoVerTodos }: PropriedadesWidgetInsumos) {
  const criticos = [...insumos]
    .map(i => ({
      ...i,
      percentual: i.quantidadeMinima && i.quantidadeAtual 
        ? Math.min(100, (i.quantidadeAtual / (i.quantidadeMinima * 2)) * 100) 
        : 100
    }))
    .sort((a, b) => a.percentual - b.percentual)
    .slice(0, 2);

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
      
      <div className="space-y-4 flex-1 flex flex-col justify-center relative z-10">
        {criticos.length === 0 ? (
          <div className="text-center py-4 flex flex-col items-center opacity-20">
            <Box size={24} className="mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest">Estoque em dia</span>
          </div>
        ) : (
          criticos.map(insumo => (
            <div key={insumo.id} className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil group/item hover:border-sky-500/20 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-400 group-hover/item:text-sky-500 transition-colors shadow-sm">
                {insumo.nome.toLowerCase().includes('spray') || insumo.nome.toLowerCase().includes('cola') ? <SprayCan size={20} /> : <Box size={20} />}
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-black text-primary uppercase tracking-tight truncate mb-2">{insumo.nome}</div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${insumo.percentual < 20 ? "bg-rose-500 animate-pulse" : "bg-sky-500"}`}
                    style={{ width: `${insumo.percentual}%` }}
                  />
                </div>
              </div>
              <div className={`text-[11px] font-black tabular-nums ${insumo.percentual < 20 ? "text-rose-500" : "text-zinc-500"}`}>
                {Math.round(insumo.percentual)}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

