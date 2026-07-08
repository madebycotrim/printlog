import { useState, memo } from "react";
import { createPortal } from "react-dom";
import { DollarSign, Settings, Clock, Check, Plus, Trash2, Activity, PenTool, Printer, Zap, Box, Package, Scissors, Droplets, X } from "lucide-react";
import { ContadorAnimado, InputBancario, Dialogo } from "@/compartilhado/componentes/ui";
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
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);
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
              <span className="text-xs font-black uppercase tracking-widest text-primary">Mão de Obra</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-4 items-start">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Custo da Hora</label>
                <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-zinc-800/40 border border-borda-sutil focus-within:border-violet-500/40 transition-all shadow-inner overflow-hidden">
                  <span className="absolute left-4 font-black text-xs text-muted-foreground select-none">R$</span>
                  <InputBancario 
                    placeholder="0.00"
                    value={cobrarMaoDeObra ? (maoDeObra === 0 ? "" : (maoDeObra / 100 || "")) : 0} 
                    onChange={(e) => setMaoDeObra(Math.round(extrairValorNumerico(e.target.value) * 100))} 
                    className="w-full h-11 pl-12 pr-4 bg-transparent outline-none font-bold text-xs text-primary dark:text-white text-left"
                    disabled={!cobrarMaoDeObra}
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Setup p/ Projeto</label>
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
                        className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-bold text-xs text-center text-primary dark:text-white" 
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
                        className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-bold text-xs text-center text-primary dark:text-white" 
                        disabled={!cobrarMaoDeObra}
                      />
                        <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">MIN</span>
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
                        className="w-full h-11 pl-2 pr-6 sm:pl-4 sm:pr-8 bg-transparent outline-none font-bold text-xs text-center text-primary dark:text-white" 
                        disabled={!cobrarMaoDeObra}
                      />
                        <span className="absolute right-2 sm:right-2.5 font-black text-[10px] text-zinc-400 uppercase tracking-wider select-none">SEG</span>
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
          
          <div className="mt-6 flex flex-col">
            <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex justify-between items-center z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-500/80 tracking-wider">Custo de Mão de Obra:</span>
                  <span className="text-[9px] font-bold text-muted-foreground">Tempo operacional acumulado</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 hidden sm:flex">
                  <Clock size={10} className="text-violet-500/50" />
                  <span>
                    ({Number.isInteger(tempoSetup) ? tempoSetup : tempoSetup.toFixed(2)} MIN / 60) * R$ {(maoDeObra / 100).toFixed(2)} <span className="mx-1">=</span>
                  </span>
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

      <Dialogo
        aberto={modalMicroTarefasAberto}
        aoFechar={() => {
          setModalMicroTarefasAberto(false);
          setIndiceEditando(null);
        }}
        titulo="Micro-tarefas"
        subtitulo="Tempo operacional de setup"
        icone={Settings}
        larguraMax="max-w-4xl"
        corBase="violet"
      >
        <div className="flex flex-col md:flex-row h-full min-h-[50vh]">
          {/* Painel Esquerdo: Lista de Tarefas */}
          <div className="w-full md:w-2/5 p-6 md:p-8 bg-zinc-50 dark:bg-zinc-900/50 border-b md:border-b-0 md:border-r border-borda-sutil flex flex-col h-full">
            <span className="text-xs font-black uppercase tracking-widest text-primary dark:text-white mb-6 block">Tarefas de Setup</span>
            
            <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-fino flex-1">
              {listaMicroTarefas.map((t: any, idx: number) => {
                const selecionado = indiceEditando === idx;
                const ativo = !!microTasks[t.key];
                const IconeComponente = t.icon && ICONS_MAP[t.icon] ? ICONS_MAP[t.icon] : Settings;
                
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      setIndiceEditando(idx);
                    }}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all group ${
                      selecionado
                        ? "bg-violet-500/10 border-violet-500/30 shadow-[0_4px_12px_rgba(139,92,246,0.1)]"
                        : "bg-muted/20 dark:bg-zinc-900/40 border-borda-sutil hover:bg-muted/40 dark:hover:bg-zinc-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                        selecionado 
                          ? "bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/30" 
                          : "bg-white dark:bg-zinc-900/80 text-zinc-500 border-borda-sutil group-hover:text-violet-500 shadow-sm"
                      }`}>
                        <IconeComponente size={16} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className={`text-xs font-black uppercase tracking-wider truncate ${
                          selecionado ? "text-violet-600 dark:text-violet-400" : "text-primary dark:text-white"
                        }`}>
                          {t.label}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-violet-500/80">+{t.time} MIN</span>
                          {ativo && (
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-1 rounded">Em uso</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                const nova = {
                  key: `custom_${Date.now()}`,
                  label: "Nova Tarefa",
                  time: 0,
                  icon: "Settings"
                };
                const novas = [...listaMicroTarefas, nova];
                salvarMicroTarefas(novas);
                setIndiceEditando(novas.length - 1);
              }}
              className="w-full mt-4 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-dashed border-borda-sutil hover:border-violet-500/30 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-500/5 transition-all group shrink-0 shadow-sm"
            >
              <Plus size={14} className="group-hover:scale-125 transition-transform" /> NOVA MICRO-TAREFA
            </button>
          </div>

          {/* Painel Direito: Configuração da Tarefa */}
          <div className="w-full md:w-3/5 p-6 md:p-8 bg-card relative flex flex-col">
            {indiceEditando !== null && listaMicroTarefas[indiceEditando] ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                      <Settings size={18} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary dark:text-white">Editar Tarefa</h3>
                      <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Configure as propriedades desta micro-tarefa</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      removerMicroTarefa(listaMicroTarefas[indiceEditando].key);
                      setIndiceEditando(null);
                    }}
                    className="h-8 px-3 rounded-lg border border-rose-500/30 text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>

                <div className="flex flex-col gap-6 flex-1">
                  {/* ÍCONE */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Ícone</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(ICONS_MAP).map(iconName => {
                        const Icon = ICONS_MAP[iconName];
                        const iconSelecionado = listaMicroTarefas[indiceEditando].icon === iconName;
                        return (
                          <button
                            key={iconName}
                            onClick={() => {
                              const novas = [...listaMicroTarefas];
                              novas[indiceEditando].icon = iconName;
                              salvarMicroTarefas(novas);
                            }}
                            className={`w-10 h-10 shrink-0 snap-center rounded-xl flex items-center justify-center transition-all ${
                              iconSelecionado
                                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' 
                                : 'bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil text-zinc-500 hover:text-violet-500 dark:hover:text-violet-400 hover:border-violet-500/30 shadow-inner'
                            }`}
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {/* NOME DA TAREFA */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Nome da Tarefa</label>
                      <input
                        type="text"
                        value={listaMicroTarefas[indiceEditando].label}
                        onChange={(e) => {
                          const novas = [...listaMicroTarefas];
                          novas[indiceEditando].label = e.target.value;
                          salvarMicroTarefas(novas);
                        }}
                        placeholder="Ex: Limpeza Cuba"
                        className="w-full h-12 bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl px-4 text-xs font-bold text-primary dark:text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all shadow-inner"
                      />
                    </div>

                    {/* TEMPO */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Tempo de Execução</label>
                      <div className="relative flex items-center bg-muted/30 dark:bg-zinc-800/30 border border-borda-sutil rounded-xl focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10 overflow-hidden shadow-inner transition-all h-12">
                        <input
                          type="number"
                          value={listaMicroTarefas[indiceEditando].time || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const novas = [...listaMicroTarefas];
                            novas[indiceEditando].time = val ? parseInt(val) : 0;
                            salvarMicroTarefas(novas);
                          }}
                          placeholder="0"
                          className="w-full h-full bg-transparent outline-none pl-4 pr-10 text-xs font-bold text-primary dark:text-white"
                        />
                        <span className="absolute right-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 select-none">MIN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50">
                <Settings size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Selecione uma tarefa para editar</span>
              </div>
            )}

            <div className="flex gap-2 relative z-10 shrink-0 mt-8 pt-6 border-t border-borda-sutil">
              <button 
                type="button"
                onClick={() => {
                  setModalMicroTarefasAberto(false);
                  setIndiceEditando(null);
                }}
                className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-primary dark:text-white transition-all cursor-pointer"
              >
                Fechar
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (indiceEditando !== null) {
                    const tarefa = listaMicroTarefas[indiceEditando];
                    lidarMicroTask(tarefa.key, tarefa.time, true);
                  }
                  setModalMicroTarefasAberto(false);
                  setIndiceEditando(null);
                }}
                disabled={indiceEditando === null}
                className="flex-[2] h-12 text-[10px] font-black uppercase tracking-widest rounded-xl bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                Usar Tarefa e Concluir
              </button>
            </div>
          </div>
        </div>
      </Dialogo>
    </>
  );
});
