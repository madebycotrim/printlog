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
              {/* Gráfico circular ao redor do ícone */}
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                  {/* Círculo de fundo */}
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    className="stroke-zinc-200 dark:stroke-zinc-800"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  {/* Círculo de progresso */}
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke={material.cor || "#0ea5e9"}
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={150.8}
                    strokeDashoffset={150.8 * (1 - material.percentual / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                
                {/* Ícone interno */}
                <div className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-xl shadow-inner z-10 overflow-hidden">
                  {material.tipo === 'SLA' ? (
                    <GarrafaResina cor={material.cor || "#f97316"} porcentagem={material.percentual} tamanho={28} id={`widget-mat-${material.id}`} />
                  ) : (
                    <Carretel cor={material.cor || "#0ea5e9"} porcentagem={material.percentual} tamanho={32} id={`widget-mat-${material.id}`} />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="text-[11px] font-black text-primary dark:text-white uppercase tracking-tight truncate mb-1">
                  {material.nome}
                </div>
                <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="font-extrabold" style={{ color: material.cor || '#0ea5e9' }}>
                    {Math.round(material.percentual)}%
                  </span>
                  <span>restante</span>
                </div>
              </div>

              <div className={`text-[11px] font-black tabular-nums ${material.percentual < 15 ? "text-rose-500 animate-pulse" : "text-zinc-400"}`}>
                {material.pesoRestanteGramas}{material.tipo === 'SLA' ? 'ml' : 'g'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

