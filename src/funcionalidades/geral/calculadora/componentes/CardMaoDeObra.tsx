import { useState, memo } from "react";
import { createPortal } from "react-dom";
import { DollarSign, Settings, Clock, Check, Plus, Trash2, Activity, PenTool, Printer, Zap, Box, Package, Scissors, Droplets, X } from "lucide-react";
import { ContadorAnimado, InputBancario } from "@/compartilhado/componentes/ui";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

const ICONS_MAP: Record<string, any> = {
  Settings, Clock, Activity, PenTool, Printer, Zap, Box, Package, Scissors, Droplets
};

interface CardMaoDeObraProps {
  maoDeObra: number;
  setMaoDeObra: (v: number) => void;
  cobrarMaoDeObra: boolean;
  setCobrarMaoDeObra: (v: boolean) => void;
  tempoSetup: number;
  setTempoSetup: (v: number) => void;
}

export const CardMaoDeObra = memo(function CardMaoDeObra({
  maoDeObra,
  setMaoDeObra,
  cobrarMaoDeObra,
  setCobrarMaoDeObra,
  tempoSetup,
  setTempoSetup
}: CardMaoDeObraProps) {
  const [microTasks, setMicroTasks] = useState<Record<string, boolean>>({});
  const [modalMicroTarefasAberto, setModalMicroTarefasAberto] = useState(false);
  const [novaMicroLabel, setNovaMicroLabel] = useState("");
  const [novaMicroTempo, setNovaMicroTempo] = useState("");
  const [tempHora, setTempHora] = useState<string | undefined>();
  const [tempMinuto, setTempMinuto] = useState<string | undefined>();
  const [tempSegundo, setTempSegundo] = useState<string | undefined>();

  const [listaMicroTarefas, setListaMicroTarefas] = useState<any[]>(() => {
    try {
      const salvas = localStorage.getItem("printlog_micro_tarefas");
      if (salvas) return JSON.parse(salvas);
    } catch (e) {}
    return [
      { key: "mat", label: "Troca Material", time: 15, icon: "Package" },
      { key: "limp", label: "Limpeza Cuba", time: 20, icon: "Droplets" },
      { key: "calib", label: "Calibração", time: 10, icon: "Settings" },
      { key: "prep", label: "Prep. Mesa", time: 5, icon: "Printer" },
      { key: "sup", label: "Suportes", time: 30, icon: "Scissors" },
    ];
  });

  const [novaMicroIcone, setNovaMicroIcone] = useState<string>("Settings");

  const salvarMicroTarefas = (novas: any[]) => {
    setListaMicroTarefas(novas);
    localStorage.setItem("printlog_micro_tarefas", JSON.stringify(novas));
  };
  
  const adicionarMicroTarefa = () => {
    if (!novaMicroLabel.trim() || !novaMicroTempo) return;
    const nova = {
      key: `custom_${Date.now()}`,
      label: novaMicroLabel,
      time: parseInt(novaMicroTempo),
      icon: novaMicroIcone
    };
    salvarMicroTarefas([...listaMicroTarefas, nova]);
    setNovaMicroLabel("");
    setNovaMicroTempo("");
  };

  const removerMicroTarefa = (key: string) => {
    salvarMicroTarefas(listaMicroTarefas.filter((t: any) => t.key !== key));
  };

  const lidarMicroTask = (chave: string, tempo: number, checked: boolean) => {
    setMicroTasks(prev => ({ ...prev, [chave]: checked }));
    if (checked) setTempoSetup(tempoSetup + tempo);
    else setTempoSetup(Math.max(0, tempoSetup - tempo));
  };

  return (
    <>
      <div className={`p-6 rounded-3xl bg-card/60 border border-borda-sutil relative flex flex-col shadow-2xl backdrop-blur-3xl group transition-all duration-500 overflow-hidden premium-card premium-card-violet w-full h-fit`}>
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />
        
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-borda-sutil">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400 border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 shadow-inner">
              <DollarSign size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-primary">Mão de Obra</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Tempo operacional de setup</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalMicroTarefasAberto(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/40 dark:bg-white/5 border border-borda-sutil text-zinc-500 hover:text-primary hover:border-zinc-500/30 transition-all cursor-pointer shadow-sm"
              title="Configurar micro-tarefas"
            >
              <Settings size={14} />
            </button>
            <div className="w-px h-6 bg-borda-sutil mx-1" />
            <button
              type="button"
              onClick={() => setCobrarMaoDeObra(!cobrarMaoDeObra)}
              className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50 shrink-0 ${
                cobrarMaoDeObra ? 'bg-violet-500' : 'bg-muted dark:bg-zinc-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-300 ${
                cobrarMaoDeObra ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        <div className={`flex-1 flex flex-col pt-6 transition-all duration-300 ${!cobrarMaoDeObra ? "opacity-60" : ""}`}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Custo da Hora</label>
                <div className="relative flex items-center rounded-xl transition-all shadow-inner border bg-muted/40 dark:bg-zinc-800/40 border-borda-sutil focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/20">
                  <span className="absolute left-4 font-black text-xs text-muted-foreground select-none">R$</span>
                  <InputBancario 
                    placeholder="0.00"
                    value={cobrarMaoDeObra ? (maoDeObra === 0 ? "" : (maoDeObra / 100 || "")) : 0} 
                    onChange={(e) => setMaoDeObra(Math.round(extrairValorNumerico(e.target.value) * 100))} 
                    className="w-full h-11 pl-12 pr-4 bg-transparent outline-none font-black text-sm text-primary dark:text-white"
                    disabled={!cobrarMaoDeObra}
                  />
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1.5">Setup p/ Projeto</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-violet-500/40 transition-all shadow-inner">
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={tempHora !== undefined ? tempHora : (Math.floor(tempoSetup / 60) === 0 ? "" : (Math.floor(tempoSetup / 60) || ""))} 
                        onFocus={() => {}}
                        onBlur={() => setTempHora(undefined)}
                        onChange={(e) => {
                          const v = e.target.value;
                          setTempHora(v);
                          setTempoSetup((v === "" ? 0 : Number(v)) * 60 + Math.floor(tempoSetup % 60) + (tempoSetup % 1));
                        }} 
                        className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                        disabled={!cobrarMaoDeObra}
                      />
                      <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">h</span>
                    </div>

                    <span className="text-zinc-400 font-bold">:</span>

                    <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-violet-500/40 transition-all shadow-inner">
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={tempMinuto !== undefined ? tempMinuto : (Math.floor(tempoSetup % 60) === 0 ? "" : (Math.floor(tempoSetup % 60) || ""))} 
                        onFocus={() => {}}
                        onBlur={() => setTempMinuto(undefined)}
                        onChange={(e) => {
                          const v = e.target.value;
                          setTempMinuto(v);
                          setTempoSetup(Math.floor(tempoSetup / 60) * 60 + (v === "" ? 0 : Number(v)) + (tempoSetup % 1));
                        }} 
                        className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                        disabled={!cobrarMaoDeObra}
                      />
                      <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">m</span>
                    </div>

                    <span className="text-zinc-400 font-bold">:</span>

                    <div className="relative flex-1 flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-violet-500/40 transition-all shadow-inner">
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={tempSegundo !== undefined ? tempSegundo : (Math.round((tempoSetup % 1) * 60) === 0 ? "" : (Math.round((tempoSetup % 1) * 60) || ""))} 
                        onFocus={() => {}}
                        onBlur={() => setTempSegundo(undefined)}
                        onChange={(e) => {
                          const v = e.target.value;
                          setTempSegundo(v);
                          setTempoSetup(Math.floor(tempoSetup / 60) * 60 + Math.floor(tempoSetup % 60) + ((v === "" ? 0 : Number(v)) / 60));
                        }} 
                        className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                        disabled={!cobrarMaoDeObra}
                      />
                      <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">s</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full flex-nowrap mt-2">
                      {[-60, -30, -15, 15, 30, 60].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setTempoSetup(Math.max(0, tempoSetup + val))}
                          className="flex-1 py-1.5 px-1 rounded-lg bg-zinc-900/40 hover:bg-violet-500/10 text-[9px] font-black text-muted-foreground hover:text-violet-500 border border-transparent hover:border-violet-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          {val > 0 ? "+" : ""}{val === 60 || val === -60 ? `${val/60}h` : `${val}m`}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setTempoSetup(0)}
                        className="px-2 py-1.5 rounded-lg bg-zinc-900/40 hover:bg-rose-500/10 text-[9px] font-black text-muted-foreground hover:text-rose-500 border border-transparent hover:border-rose-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                      >
                        Zerar
                      </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Micro-tarefas de Setup</span>
              <div className="flex flex-wrap gap-2">
                {listaMicroTarefas.map((t: any) => {
                  const ativo = !!microTasks[t.key];
                  const IconeComponente = t.icon && ICONS_MAP[t.icon] ? ICONS_MAP[t.icon] : Settings;
                  return (
                    <label 
                      key={t.key} 
                      className={`flex items-center gap-2 py-2 px-3 rounded-xl border transition-all duration-200 cursor-pointer relative select-none group focus-within:ring-2 focus-within:ring-violet-500/50 ${
                        ativo 
                          ? "bg-violet-500/10 border-violet-500/40 shadow-[0_4px_12px_rgba(139,92,246,0.1)] scale-[1.02]" 
                          : "bg-zinc-900/20 dark:bg-zinc-900/40 border-borda-sutil hover:border-zinc-700/50 hover:bg-zinc-900/50"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={ativo}
                        onChange={(e) => lidarMicroTask(t.key, t.time, e.target.checked)}
                      />
                      <IconeComponente size={14} className={ativo ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-400"} />
                      <span className={`text-[10px] font-bold tracking-wide transition-colors ${
                        ativo ? "text-violet-300" : "text-zinc-400 group-hover:text-zinc-300"
                      }`}>
                        {t.label}
                      </span>
                      <span className={`text-[9px] font-black uppercase ml-1 px-1.5 py-0.5 rounded-md transition-all ${
                        ativo 
                          ? "bg-violet-500/20 text-violet-300" 
                          : "bg-zinc-900/50 text-zinc-500"
                      }`}>
                        +{t.time}m
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground justify-center bg-zinc-900/20 py-1.5 px-3 rounded-lg border border-white/[0.02]">
                <Clock size={10} className="text-violet-500" />
                <span>
                  FÓRMULA: ({Number.isInteger(tempoSetup) ? tempoSetup : tempoSetup.toFixed(2)} min / 60) * R$ {(maoDeObra / 100).toFixed(2)} = R$ {((tempoSetup / 60) * (maoDeObra / 100)).toFixed(2).replace('.', ',')}
                </span>
            </div>
            
            <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 flex flex-col gap-1 relative overflow-hidden mt-1">
              <div className="flex justify-between items-center z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-500/80 tracking-wider">Custo de Mão de Obra:</span>
                  <span className="text-[9px] font-bold text-muted-foreground">Tempo operacional acumulado</span>
                </div>
                <span className={`text-xl font-black tracking-tight ${cobrarMaoDeObra && tempoSetup > 0 ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground'}`}>
                  <ContadorAnimado valor={cobrarMaoDeObra ? (tempoSetup / 60) * (maoDeObra / 100) : 0} />
                </span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {modalMicroTarefasAberto && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="bg-card w-full max-w-md rounded-[2rem] p-6 shadow-2xl border border-white/5 relative overflow-hidden"
            style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15) 0%, transparent 60%)' }}
          >
            <button 
              onClick={() => setModalMicroTarefasAberto(false)}
              className="absolute top-6 right-6 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900/40 hover:bg-zinc-800/80 text-zinc-400 hover:text-white transition-all border border-white/5"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-inner">
                <Settings size={22} className="animate-spin-slow" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-base font-black uppercase tracking-widest text-primary">Micro-tarefas</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Tempo operacional de setup</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-fino relative z-10">
              {listaMicroTarefas.map((t: any) => {
                const IconeComponente = t.icon && ICONS_MAP[t.icon] ? ICONS_MAP[t.icon] : Settings;
                return (
                  <div key={t.key} className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                        <IconeComponente size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-primary tracking-wide">{t.label}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-violet-500/80">+{t.time} MIN</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => removerMicroTarefa(t.key)} className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 mb-6 p-4 rounded-2xl bg-zinc-950 border border-white/5 relative z-10">
              <span className="text-[10px] font-black uppercase text-violet-500 tracking-widest">Adicionar Nova Tarefa</span>
              
              <div className="flex flex-wrap gap-2 pb-2">
                {Object.keys(ICONS_MAP).map(iconName => {
                  const Icon = ICONS_MAP[iconName];
                  return (
                    <button
                      key={iconName}
                      onClick={() => setNovaMicroIcone(iconName)}
                      className={`w-10 h-10 shrink-0 snap-center rounded-xl flex items-center justify-center transition-all ${
                        novaMicroIcone === iconName 
                          ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' 
                          : 'bg-zinc-900 border border-white/5 text-zinc-500 hover:text-violet-400 hover:border-violet-500/30'
                      }`}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={novaMicroLabel}
                  onChange={(e) => setNovaMicroLabel(e.target.value)}
                  placeholder="Nome (ex: Limpeza)"
                  className="flex-[2] h-11 px-4 rounded-xl bg-zinc-900 border border-white/5 outline-none text-xs font-bold text-white placeholder:text-zinc-600 focus:border-violet-500/50 transition-colors"
                />
                <div className="relative w-24 h-11 shrink-0">
                  <input 
                    type="number" 
                    value={novaMicroTempo}
                    onChange={(e) => setNovaMicroTempo(e.target.value)}
                    placeholder="0"
                    className="w-full h-full pl-3 pr-7 text-center rounded-xl bg-zinc-900 border border-white/5 outline-none text-sm font-black text-white placeholder:text-zinc-600 focus:border-violet-500/50 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-zinc-500 pointer-events-none select-none">
                    M
                  </span>
                </div>
                <button type="button" onClick={adicionarMicroTarefa} disabled={!novaMicroLabel.trim() || !novaMicroTempo} className="h-11 w-11 flex items-center justify-center rounded-xl bg-violet-500 text-white hover:bg-violet-400 disabled:opacity-50 disabled:hover:bg-violet-500 transition-all shrink-0 shadow-lg shadow-violet-500/20">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 relative z-10">
              <button 
                type="button"
                onClick={() => setModalMicroTarefasAberto(false)}
                className="w-24 shrink-0 h-12 text-[10px] font-black uppercase tracking-widest rounded-xl bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Fechar
              </button>
              <button 
                type="button"
                onClick={() => setModalMicroTarefasAberto(false)}
                className="flex-1 h-12 text-xs font-black uppercase tracking-widest rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all cursor-pointer shadow-lg"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
});
