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
    .slice(0, 2);

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
      
      <div className="space-y-4 flex-1 flex flex-col justify-center relative z-10">
        {criticos.length === 0 ? (
          <div className="text-center py-4 flex flex-col items-center opacity-20">
            <Carretel cor="#ccc" porcentagem={0} tamanho={24} id="empty-mat" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-2">Estoque em dia</span>
          </div>
        ) : (
          criticos.map(material => (
            <div key={material.id} className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil group/item hover:border-sky-500/20 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                {material.tipo === 'SLA' ? (
                  <GarrafaResina cor={material.cor || "#f97316"} porcentagem={material.percentual} tamanho={36} id={`widget-mat-${material.id}`} />
                ) : (
                  <Carretel cor={material.cor || "#0ea5e9"} porcentagem={material.percentual} tamanho={40} id={`widget-mat-${material.id}`} />
                )}
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-black text-primary uppercase tracking-tight truncate mb-2">
                  {material.nome}
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${material.percentual}%`, 
                      backgroundColor: material.cor || '#0ea5e9',
                      opacity: material.percentual < 15 ? 1 : 0.8
                    }}
                  />
                </div>
              </div>
              <div className={`text-[11px] font-black tabular-nums ${material.percentual < 15 ? "text-rose-500 animate-pulse" : "text-zinc-500"}`}>
                {material.pesoRestanteGramas}{material.tipo === 'SLA' ? 'ml' : 'g'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

