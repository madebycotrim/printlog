import { Cpu, ChevronDown, Check } from "lucide-react";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";

interface PropriedadesCardEquipamento {
  impressoras: Impressora[];
  impressoraSelecionadaId: string;
  aoSelecionar: (id: string) => void;
  abertoSeletor: boolean;
  setAbertoSeletor: (v: boolean) => void;
}

/**
 * Card de seleção de equipamento (impressora) para a calculadora.
 * Exibe detalhes técnicos que impactam diretamente nos custos.
 */
export function CardEquipamento({
  impressoras,
  impressoraSelecionadaId,
  aoSelecionar,
  abertoSeletor,
  setAbertoSeletor,
}: PropriedadesCardEquipamento) {
  const selecionada = impressoras.find(i => i.id === impressoraSelecionadaId);

  return (
    <div className={`h-full p-5 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-4 shadow-2xl backdrop-blur-3xl group transition-all duration-500 overflow-hidden ${abertoSeletor ? 'z-40' : 'z-10'}`}>
      {/* Efeito Glow Âmbar de Fundo */}
      <div className="absolute -top-24 -right-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />

      <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-amber-500 border border-amber-500/30">
            <Cpu size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-white">Equipamento</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Defina a máquina que produzirá o projeto</span>
          </div>
        </div>
      </div>

      <div className="relative z-20 flex flex-col gap-5 pt-2 h-full">
        {/* Visualização da Impressora */}
        <div className="flex-1 min-h-[100px] flex items-center justify-center relative">
          {selecionada?.imagemUrl ? (
            <div className="relative w-full h-full max-h-[130px] group/img">
               <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity duration-700" />
               <img 
                 src={selecionada.imagemUrl} 
                 alt={selecionada.nome}
                 className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover/img:scale-105"
               />
            </div>
          ) : (
            <div className="w-full h-full min-h-[160px] rounded-2xl border border-dashed border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-3 group/empty">
               <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700 group-hover/empty:text-amber-500/50 transition-colors">
                 <Cpu size={24} strokeWidth={1} />
               </div>
               <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em]">Aguardando Máquina</span>
            </div>
          )}
        </div>

        {/* Seletor de Impressora */}
        <div className="flex flex-col gap-2 relative mt-auto">
          <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 ml-1">Impressora Principal</label>
          
          <button
            type="button"
            onClick={() => setAbertoSeletor(!abertoSeletor)}
            className="flex items-center justify-between bg-zinc-950/60 border border-white/5 hover:border-amber-500/30 rounded-xl px-4 h-12 transition-all group/btn"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${selecionada ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-tight">
                  {selecionada?.nome || "Escolher impressora..."}
                </span>
                {selecionada && (
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter mt-0.5">
                    {selecionada.marca} {selecionada.modeloBase}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown size={16} className={`text-zinc-500 group-hover/btn:text-amber-500 transition-transform ${abertoSeletor ? 'rotate-180' : ''}`} />
          </button>

          {abertoSeletor && (
            <>
              <div className="fixed inset-0 z-[30]" onClick={() => setAbertoSeletor(false)} />
              <div className="absolute bottom-[calc(100%+6px)] left-0 right-0 bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl p-2 z-[100] flex flex-col gap-1 max-h-60 overflow-y-auto backdrop-blur-2xl">
                {impressoras.length === 0 ? (
                   <span className="text-[9px] font-bold text-zinc-600 uppercase py-4 text-center">Nenhuma impressora cadastrada</span>
                ) : (
                  impressoras.map((imp) => (
                    <button
                      key={imp.id}
                      type="button"
                      onClick={() => {
                        aoSelecionar(imp.id);
                        setAbertoSeletor(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-between ${impressoraSelecionadaId === imp.id
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <div className="flex flex-col">
                        <span>{imp.nome}</span>
                        <span className="text-[8px] opacity-50 uppercase tracking-tighter">{imp.marca} {imp.modeloBase}</span>
                      </div>
                      {impressoraSelecionadaId === imp.id && <Check size={14} />}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
