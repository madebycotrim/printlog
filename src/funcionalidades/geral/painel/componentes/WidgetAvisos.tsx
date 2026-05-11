import { AlertTriangle, Plus, Wrench } from "lucide-react";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { obterStatusManutencao } from "@/funcionalidades/producao/impressoras/utilitarios/utilitariosManutencao";

interface PropriedadesWidgetAvisos {
  impressoras: Impressora[];
  aoAgendarManutencao: () => void;
}

export function WidgetAvisos({ impressoras, aoAgendarManutencao }: PropriedadesWidgetAvisos) {
  const impressorasCriticas = impressoras
    .map((i) => ({
      ...i,
      statusManutencao: obterStatusManutencao(i.horimetroTotalMinutos || 0, i.intervaloRevisaoMinutos || 0),
    }))
    .filter((i) => i.statusManutencao !== "normal");

  return (
    <div className="bg-card border border-borda-sutil rounded-[2rem] p-8 h-full shadow-media flex flex-col group/widget relative overflow-hidden transition-all hover:bg-zinc-50 dark:hover:bg-white/[0.01]">
      {/* Grid Pattern Background - Subtil */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h4 className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">Quadro de Avisos</h4>
        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-primary transition-all active:scale-90 border border-borda-sutil">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar relative z-10">
        {impressorasCriticas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 text-center py-6">
            <AlertTriangle size={32} className="mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
              Tudo sob controle.
              <br />
              Nenhum aviso crítico.
            </p>
          </div>
        ) : (
          impressorasCriticas.map((imp) => (
            <div 
              key={imp.id}
              onClick={aoAgendarManutencao}
              className="flex gap-4 p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 group/aviso hover:bg-rose-500/10 transition-all cursor-pointer shadow-lg shadow-rose-500/5"
            >
              <div className="min-w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mt-0.5 group-hover/aviso:scale-110 transition-transform">
                <Wrench className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="text-[11px] font-black text-primary mb-1 group-hover/aviso:text-rose-500 transition-colors uppercase tracking-tight">
                  Manutenção Necessária
                </div>
                <div className="text-[10px] text-secondary leading-relaxed font-black uppercase tracking-tight">
                  A impressora <span className="text-primary font-black">{imp.nome}</span> atingiu o limite de uso contínuo recomendado.
                </div>
                <button className="mt-3 text-[9px] font-black text-rose-400 uppercase tracking-[0.15em] hover:text-rose-300 transition-colors flex items-center gap-1">
                  AGENDAR AGORA
                  <div className="w-4 h-px bg-rose-400/50" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
