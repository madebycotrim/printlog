import { Carretel, GarrafaResina } from "@/compartilhado/componentes";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { ArrowRight } from "lucide-react";

interface PropriedadesWidgetMateriais {
  materiais: Material[];
  aoVerTodos: () => void;
}

export function WidgetMateriais({ materiais, aoVerTodos }: PropriedadesWidgetMateriais) {
  const criticos = [...materiais]
    .map(m => ({
      ...m,
      percentual: Math.min(100, ((m.pesoRestanteGramas || 0) / (m.pesoGramas || 1000)) * 100)
    }))
    .sort((a, b) => a.percentual - b.percentual)
    .slice(0, 8);

  return (
    <div className="bg-card border border-borda-sutil rounded-[2rem] p-8 h-full shadow-media flex flex-col group/widget relative overflow-hidden transition-all hover:bg-zinc-50 dark:hover:bg-white/[0.01]">
      {/* Grid Pattern Background - Subtil */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex flex-col">
          <h4 className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">Materiais Críticos</h4>
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Status de Matéria-Prima</span>
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
            <Carretel cor="#ccc" porcentagem={0} tamanho={24} id="empty-mat" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-2">Estoque em dia</span>
          </div>
        ) : (
          criticos.map((material, idx) => (
            <div key={material.id} className="flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-zinc-50 dark:bg-white/[0.02] border border-borda-sutil hover:border-sky-500/30 transition-all hover:bg-white/[0.04] dark:hover:bg-white/[0.04] group/item shadow-sm hover:shadow-md text-center">
              {/* Gráfico circular animado ao redor do ícone */}
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0 mb-3">
                <style>{`
                  @keyframes svg-gauge-fill-${idx} {
                    from { stroke-dashoffset: 131.95; }
                    to { stroke-dashoffset: ${131.95 * (1 - material.percentual / 100)}; }
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
                    stroke={material.cor || "#0ea5e9"}
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray={131.95}
                    style={{
                      animation: `svg-gauge-fill-${idx} 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                      filter: `drop-shadow(0 0 4px ${material.cor || '#0ea5e9'}40)`
                    }}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Ícone interno (totalmente circular) */}
                <div className="w-9 h-9 flex items-center justify-center bg-zinc-100 dark:bg-zinc-850 rounded-full shadow-inner z-10 overflow-hidden group-hover/item:scale-110 transition-transform duration-300">
                  {material.tipo === 'SLA' ? (
                    <GarrafaResina cor={material.cor || "#f97316"} porcentagem={material.percentual} tamanho={22} id={`widget-mat-${material.id}`} />
                  ) : (
                    <Carretel cor={material.cor || "#0ea5e9"} porcentagem={material.percentual} tamanho={24} id={`widget-mat-${material.id}`} />
                  )}
                </div>
              </div>

              {/* Informações organizadas de forma vertical e centralizada */}
              <div className="space-y-1 w-full min-w-0">
                <h5 className="text-[11px] font-black text-primary dark:text-zinc-200 uppercase tracking-wider truncate leading-tight group-hover/item:text-sky-400 transition-colors">
                  {material.nome}
                </h5>
                
                {/* Peso e Porcentagem em uma única linha organizada */}
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                  <span className="font-extrabold" style={{ color: material.cor || '#0ea5e9' }}>
                    {Math.round(material.percentual)}%
                  </span>
                  <span>•</span>
                  <span className="tabular-nums font-medium">
                    {material.pesoRestanteGramas}{material.tipo === 'SLA' ? 'ml' : 'g'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

