import { ChevronDown, Check, RotateCcw, History, Settings } from "lucide-react";

/**
 * Interface para as propriedades do SeletorImpressora.
 */
interface PropriedadesSeletorImpressora {
  aberto: boolean;
  setAberto: (v: boolean) => void;
  impressoras: any[];
  impressoraSelecionada: any;
  aoSelecionar: (id: string) => void;
  aoLimpar: () => void;
  aoAbrirHistorico: () => void;
  aoAbrirConfiguracoes: () => void;
}

/**
 * Componente de seleção de impressora e ações rápidas para o cabeçalho da calculadora.
 */
export function SeletorImpressora({
  aberto,
  setAberto,
  impressoras,
  impressoraSelecionada,
  aoSelecionar,
  aoLimpar,
  aoAbrirHistorico,
  aoAbrirConfiguracoes
}: PropriedadesSeletorImpressora) {
  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-white/5 p-1 rounded-2xl border border-borda-sutil shadow-inner">
      <div className="relative">
        <button
          onClick={() => setAberto(!aberto)}
          className={`flex items-center gap-3 px-4 h-11 rounded-xl transition-all duration-300 group ${aberto ? "bg-white dark:bg-white/10 shadow-md" : ""}`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <div className="flex flex-col items-start leading-none py-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">
              {impressoraSelecionada?.nome || "Selecionar..."}
            </span>
            {impressoraSelecionada && (
              <div className="flex items-center gap-1.5">
                {(impressoraSelecionada.marca || impressoraSelecionada.modeloBase) && (
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
                    {impressoraSelecionada.marca} {impressoraSelecionada.modeloBase}
                  </span>
                )}
                <span className="text-[8px] font-black text-sky-500 uppercase tracking-tighter">• {impressoraSelecionada.potenciaWatts}W</span>
              </div>
            )}
          </div>
          <ChevronDown size={14} className={`text-zinc-400 group-hover:text-sky-500 transition-transform ${aberto ? "rotate-180" : ""}`} />
        </button>
        {aberto && (
          <div className="absolute top-full left-0 mt-2 p-2 rounded-2xl bg-white dark:bg-[#0c0c0e] border border-borda-sutil dark:border-white/10 shadow-2xl z-[100] w-max min-w-full">
            {impressoras.map((imp) => (
              <button
                key={imp.id}
                onClick={() => {
                  aoSelecionar(imp.id);
                  setAberto(false);
                }}
                className={`w-full flex flex-col items-start px-4 py-3 rounded-xl transition-all ${impressoraSelecionada?.id === imp.id ? "bg-sky-500/10 text-sky-600 dark:text-sky-500" : "hover:bg-zinc-100 dark:hover:bg-white/5"}`}
              >
                <div className="flex items-center gap-4 w-full">
                  <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{imp.nome}</span>
                  {impressoraSelecionada?.id === imp.id && <Check size={14} className="ml-auto" />}
                </div>
                {(imp.marca || imp.modeloBase) && (
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">
                    {imp.marca} {imp.modeloBase}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={aoLimpar} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-rose-500 transition-all" title="Limpar formulário">
        <RotateCcw size={18} />
      </button>
      <button onClick={aoAbrirHistorico} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-sky-500 transition-all" title="Histórico">
        <History size={18} />
      </button>
      <button onClick={aoAbrirConfiguracoes} className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white dark:hover:bg-white/10 text-zinc-400 hover:text-amber-500 transition-all" title="Configurações">
        <Settings size={18} />
      </button>
    </div>
  );
}
