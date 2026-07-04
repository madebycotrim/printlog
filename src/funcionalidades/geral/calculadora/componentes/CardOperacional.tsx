import { useState, useEffect, memo } from "react";
import { DollarSign, Activity, Check, AlertTriangle, Clock, Settings, Plus, Trash2 } from "lucide-react";
import { ContadorAnimado, InputBancario } from "@/compartilhado/componentes/ui";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";

interface CardOperacionalProps {
  maoDeObra: number;
  setMaoDeObra?: (v: number) => void;
  margem: number;
  setMargem: (v: number) => void;
  depreciacao: number;
  setDepreciacao?: (v: number) => void;
  valorCompraCentavos?: number;
  cobrarDesgaste: boolean;
  setCobrarDesgaste: (v: boolean) => void;
  cobrarMaoDeObra: boolean;
  setCobrarMaoDeObra: (v: boolean) => void;
  anosVidaUtil?: 5 | 3 | 2;
  setAnosVidaUtil?: (v: 5 | 3 | 2) => void;
  tempo: number;
  quantidade: number;
  tempoSetup: number;
  setTempoSetup: (v: number) => void;
  aplicarTemplate?: (tipo: 'action-figure' | 'peca-tecnica' | 'expresso') => void;
}

export const CardOperacional = memo(function CardOperacional({
  maoDeObra, setMaoDeObra, margem, setMargem, depreciacao,
  cobrarDesgaste, setCobrarDesgaste, cobrarMaoDeObra, setCobrarMaoDeObra, 
  anosVidaUtil = 5, setAnosVidaUtil, tempo, quantidade, tempoSetup, setTempoSetup, aplicarTemplate
}: CardOperacionalProps) {
  const [margemInterna, setMargemInterna] = useState(margem);
  const [microTasks, setMicroTasks] = useState<Record<string, boolean>>({});

  // --- CONFIG MICRO TAREFAS ---
  const [modalMicroTarefasAberto, setModalMicroTarefasAberto] = useState(false);
  const [listaMicroTarefas, setListaMicroTarefas] = useState<any[]>(() => {
    try {
      const salvas = localStorage.getItem("printlog_micro_tarefas");
      if (salvas) return JSON.parse(salvas);
    } catch (e) {}
    return [
      { key: "mat", label: "Troca Material", time: 15 },
      { key: "limp", label: "Limpeza Cuba", time: 20 },
      { key: "calib", label: "Calibração", time: 10 },
      { key: "prep", label: "Prep. Mesa", time: 5 },
      { key: "sup", label: "Suportes", time: 30 },
    ];
  });
  const [novaMicroLabel, setNovaMicroLabel] = useState("");
  const [novaMicroTempo, setNovaMicroTempo] = useState("");

  const salvarMicroTarefas = (novas: any[]) => {
    setListaMicroTarefas(novas);
    localStorage.setItem("printlog_micro_tarefas", JSON.stringify(novas));
  };
  
  const adicionarMicroTarefa = () => {
    if (!novaMicroLabel.trim() || !novaMicroTempo) return;
    const nova = {
      key: `custom_${Date.now()}`,
      label: novaMicroLabel,
      time: parseInt(novaMicroTempo)
    };
    salvarMicroTarefas([...listaMicroTarefas, nova]);
    setNovaMicroLabel("");
    setNovaMicroTempo("");
  };

  const removerMicroTarefa = (key: string) => {
    salvarMicroTarefas(listaMicroTarefas.filter((t: any) => t.key !== key));
  };

  // --- CONFIG PRESETS ---
  const config = useArmazemConfiguracoes();
  const { usuario } = useAutenticacao();
  const [modalPresetsAberto, setModalPresetsAberto] = useState(false);
  const presetsPadrao = [
    { valor: 5000, rotulo: "50%" },
    { valor: 10000, rotulo: "100%" },
    { valor: 20000, rotulo: "B2B (3x)" },
    { valor: 30000, rotulo: "300%" },
    { valor: 40000, rotulo: "B2C (5x)" }
  ];

  const templatesPadrao = [
    { id: '1', nome: 'Action Figure', descricao: 'Margem + Mão de Obra', margem: 300, maoDeObra: true, desgaste: true },
    { id: '2', nome: 'Peça Técnica', descricao: 'Foco em Precisão', margem: 150, maoDeObra: false, desgaste: true },
    { id: '3', nome: 'Protótipo (Rápido)', descricao: 'Baixo Custo', margem: 50, maoDeObra: false, desgaste: false }
  ];

  const presets = config.calculadoraMeta?.presets_lucro || presetsPadrao;
  const templates = config.calculadoraMeta?.templates_rapidos || templatesPadrao;

  const [presetsEditados, setPresetsEditados] = useState<{ valor: number; rotulo: string }[]>([]);
  const [templatesEditados, setTemplatesEditados] = useState<any[]>([]);

  useEffect(() => {
    if (modalPresetsAberto) {
      setPresetsEditados(
        presets.map((p: any) => ({
          valor: p.valor / 100,
          rotulo: p.rotulo
        }))
      );
      setTemplatesEditados(JSON.parse(JSON.stringify(templates)));
    }
  }, [modalPresetsAberto, config.calculadoraMeta]);

  const salvarPresetsPersonalizados = async () => {
    try {
      const meta = config.calculadoraMeta || {};
      meta.presets_lucro = presetsEditados.map(p => ({
        valor: Math.round(Number(p.valor) * 100),
        rotulo: p.rotulo || `${p.valor}%`
      }));
      meta.templates_rapidos = templatesEditados;
      config.definirCalculadoraMeta(meta);
      
      if (usuario?.uid) {
        await config.salvarNoD1(usuario.uid);
      }
      
      setModalPresetsAberto(false);
    } catch (e) {
      console.error("Erro ao salvar configurações");
    }
  };

  const lidarMicroTask = (chave: string, tempo: number, checked: boolean) => {
    setMicroTasks(prev => ({ ...prev, [chave]: checked }));
    if (checked) setTempoSetup(tempoSetup + tempo);
    else setTempoSetup(Math.max(0, tempoSetup - tempo));
  };

  useEffect(() => {
    setMargemInterna(margem);
  }, [margem]);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      if (margemInterna !== margem) {
        setMargem(margemInterna);
      }
    }, 50);

    return () => clearTimeout(temporizador);
  }, [margemInterna, margem, setMargem]);

  const msgMargem = margemInterna === 0 
    ? { texto: "Sem margem adicionada", cor: "text-zinc-500", corBase: "zinc", corHex: "#71717a" }
    : margemInterna <= 2000 
    ? { texto: "Margem de Risco (Lucro muito baixo)", cor: "text-rose-500", corBase: "rose", corHex: "#f43f5e" }
    : margemInterna <= 6000 
    ? { texto: "Margem Competitiva (Ideal para volume)", cor: "text-amber-500", corBase: "amber", corHex: "#f59e0b" }
    : margemInterna <= 12000 
    ? { texto: "Margem Saudável (Equilíbrio ideal)", cor: "text-emerald-500", corBase: "emerald", corHex: "#10b981" }
    : margemInterna <= 25000 
    ? { texto: "Margem Premium (Alta lucratividade)", cor: "text-sky-500", corBase: "sky", corHex: "#0ea5e9" }
    : { texto: "Margem de Luxo (Valor agregado alto)", cor: "text-violet-500", corBase: "violet", corHex: "#8b5cf6" };

  return (
    <div className="flex flex-col gap-4">
      {/* Alerta de Gargalo de Tempo */}
      {tempo > 1440 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 shadow-lg shadow-amber-500/5 animate-in fade-in zoom-in slide-in-from-top-4">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
            <AlertTriangle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-500 tracking-wider">Custo de Oportunidade (Gargalo)</span>
            <span className="text-[11px] font-bold text-amber-700/70 dark:text-amber-500/70 mt-1 leading-snug">
              Esta peça vai monopolizar sua impressora por <b>mais de {(tempo / 60 / 24).toFixed(1)} dias</b>. Sugerimos subir a margem de risco para compensar a perda de outros trabalhos rápidos neste período.
            </span>
          </div>
        </div>
      )}

      {/* Grid Lado a Lado Assimétrico para Mão de Obra (Maior) e Desgaste (Menor) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        
        {/* CARD 1: MÃO DE OBRA (Largura maior: col-span-8) */}
        <div className={`p-6 rounded-3xl bg-card/60 border border-borda-sutil relative flex flex-col shadow-2xl backdrop-blur-3xl group transition-all duration-500 overflow-hidden premium-card premium-card-violet col-span-12 md:col-span-8 ${!cobrarMaoDeObra ? "opacity-40 grayscale" : ""}`}>
          {/* Glow Violeta de Fundo */}
          <div className="absolute -top-24 -left-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />
          
          <div className="relative z-10 flex items-center justify-between pb-4 border-b border-borda-sutil">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400 border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
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
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/40 dark:bg-white/5 border border-borda-sutil text-zinc-500 hover:text-primary hover:border-zinc-500/30 transition-all cursor-pointer"
                title="Configurar micro-tarefas"
              >
                <Settings size={14} />
              </button>
              <div className="w-px h-6 bg-borda-sutil mx-1" />
              <button
                type="button"
                onClick={() => setCobrarMaoDeObra(!cobrarMaoDeObra)}
                className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                  cobrarMaoDeObra ? 'bg-violet-500' : 'bg-muted dark:bg-zinc-700'
                }`}
                aria-label="Cobrar Mão de Obra"
              >
                <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-300 ${
                  cobrarMaoDeObra ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          <div className={`flex-1 flex flex-col justify-between pt-6 transition-opacity duration-300 ${!cobrarMaoDeObra ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-1.5">
                    <label className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider">Custo da Hora</label>
                  </div>
                  <div className={`relative flex items-center rounded-xl transition-all shadow-inner border bg-muted/40 dark:bg-zinc-800/40 border-borda-sutil focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/20`}>
                    <span className="absolute left-4 font-black text-xs text-muted-foreground select-none">R$</span>
                    <InputBancario 
                      placeholder="0.00"
                      value={cobrarMaoDeObra ? (maoDeObra === 0 ? "" : (maoDeObra / 100 || "")) : 0} 
                      onChange={(e) => setMaoDeObra?.(Math.round(extrairValorNumerico(e.target.value) * 100))} 
                      className="w-full h-12 pl-12 pr-4 bg-transparent outline-none font-black text-sm text-primary dark:text-white"
                      disabled={!cobrarMaoDeObra}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-1.5">
                    <label className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider">Setup p/ Projeto</label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`relative flex items-center rounded-xl transition-all shadow-inner border bg-muted/40 dark:bg-zinc-800/40 border-borda-sutil focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/20`}>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={cobrarMaoDeObra ? (Math.floor(tempoSetup / 60) === 0 ? "" : (Math.floor(tempoSetup / 60) || "")) : ""} 
                          onChange={(e) => setTempoSetup(Number(e.target.value) * 60 + (tempoSetup % 60))} 
                          className="w-full h-12 pl-4 pr-10 bg-transparent outline-none font-black text-sm text-primary dark:text-white"
                          disabled={!cobrarMaoDeObra}
                        />
                        <span className="absolute right-3 font-black text-[10px] text-muted-foreground uppercase tracking-wider select-none">h</span>
                      </div>

                      <div className={`relative flex items-center rounded-xl transition-all shadow-inner border bg-muted/40 dark:bg-zinc-800/40 border-borda-sutil focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/20`}>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={cobrarMaoDeObra ? (tempoSetup % 60 === 0 ? "" : (tempoSetup % 60 || "")) : ""} 
                          onChange={(e) => setTempoSetup(Math.floor(tempoSetup / 60) * 60 + Number(e.target.value))} 
                          className="w-full h-12 pl-4 pr-12 bg-transparent outline-none font-black text-sm text-primary dark:text-white"
                          disabled={!cobrarMaoDeObra}
                        />
                        <span className="absolute right-3 font-black text-[10px] text-muted-foreground uppercase tracking-wider select-none">min</span>
                      </div>
                    </div>
                    {/* Botões rápidos de tempo */}
                    <div className="flex gap-1 w-full flex-nowrap">
                        <button
                          type="button"
                          onClick={() => setTempoSetup(Math.max(0, tempoSetup - 60))}
                          className="flex-1 py-1 px-1 rounded-lg bg-zinc-900/40 hover:bg-violet-500/10 text-[8px] font-black text-muted-foreground hover:text-violet-500 border border-transparent hover:border-violet-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          -1h
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempoSetup(Math.max(0, tempoSetup - 30))}
                          className="flex-1 py-1 px-1 rounded-lg bg-zinc-900/40 hover:bg-violet-500/10 text-[8px] font-black text-muted-foreground hover:text-violet-500 border border-transparent hover:border-violet-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          -30m
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempoSetup(Math.max(0, tempoSetup - 15))}
                          className="flex-1 py-1 px-1 rounded-lg bg-zinc-900/40 hover:bg-violet-500/10 text-[8px] font-black text-muted-foreground hover:text-violet-500 border border-transparent hover:border-violet-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          -15m
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempoSetup(tempoSetup + 15)}
                          className="flex-1 py-1 px-1 rounded-lg bg-zinc-900/40 hover:bg-violet-500/10 text-[8px] font-black text-muted-foreground hover:text-violet-500 border border-transparent hover:border-violet-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          +15m
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempoSetup(tempoSetup + 30)}
                          className="flex-1 py-1 px-1 rounded-lg bg-zinc-900/40 hover:bg-violet-500/10 text-[8px] font-black text-muted-foreground hover:text-violet-500 border border-transparent hover:border-violet-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          +30m
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempoSetup(tempoSetup + 60)}
                          className="flex-1 py-1 px-1 rounded-lg bg-zinc-900/40 hover:bg-violet-500/10 text-[8px] font-black text-muted-foreground hover:text-violet-500 border border-transparent hover:border-violet-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          +1h
                        </button>
                        <button
                          type="button"
                          onClick={() => setTempoSetup(0)}
                          className="px-1.5 py-1 rounded-lg bg-zinc-900/40 hover:bg-rose-500/10 text-[8px] font-black text-muted-foreground hover:text-rose-500 border border-transparent hover:border-rose-500/20 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                          title="Zerar tempo"
                        >
                          Zerar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="space-y-3 mt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Micro-tarefas de Setup</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {listaMicroTarefas.map(task => {
                      const Icone = task.icon || Check;
                      const ativo = !!microTasks[task.key];
                      return (
                        <label 
                          key={task.key} 
                          className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all duration-300 cursor-pointer text-center relative select-none group min-h-[115px] focus-within:ring-2 focus-within:ring-violet-500/50 ${
                            ativo 
                              ? "bg-violet-500/10 border-violet-500/40 text-violet-400 shadow-[0_4px_20px_rgba(139,92,246,0.15)] scale-[1.03]" 
                              : "bg-zinc-900/20 dark:bg-zinc-900/40 border-borda-sutil hover:border-zinc-700/50 hover:bg-zinc-900/50 text-muted-foreground"
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            className="sr-only"
                            checked={ativo}
                            onChange={(e) => lidarMicroTask(task.key, task.time, e.target.checked)}
                          />
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            ativo 
                              ? "bg-violet-500/20 text-violet-400" 
                              : "bg-zinc-900/40 text-zinc-500 group-hover:text-zinc-400 group-hover:bg-zinc-900/60"
                          }`}>
                            <Icone size={14} />
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-wider leading-tight transition-colors ${
                            ativo ? "text-violet-300" : "text-zinc-400 group-hover:text-zinc-300"
                          }`}>
                            {task.label}
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest mt-2 px-2 py-0.5 rounded-md transition-all ${
                            ativo 
                              ? "bg-violet-500/20 text-violet-300" 
                              : "bg-zinc-900/50 text-zinc-500"
                          }`}>
                            +{task.time} min
                          </span>
                          
                          {ativo && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                              <Check size={10} className="text-white stroke-[3px]" />
                            </div>
                          )}
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
                    FÓRMULA: ({tempoSetup} min / 60) * R$ {(maoDeObra / 100).toFixed(2)} = R$ {((tempoSetup / 60) * (maoDeObra / 100)).toFixed(2).replace('.', ',')}
                  </span>
              </div>
              
              <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 flex flex-col gap-1 relative overflow-hidden mt-1">
                <div className="flex justify-between items-center z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-500/80 tracking-wider">Custo de Mão de Obra:</span>
                    <span className="text-[9px] font-bold text-muted-foreground">Tempo operacional acumulado</span>
                  </div>
                  <span className={`text-xl font-black tracking-tight ${cobrarMaoDeObra ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground'}`}>
                    <ContadorAnimado valor={cobrarMaoDeObra ? (tempoSetup / 60) * (maoDeObra / 100) : 0} />
                  </span>
                </div>
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: DESGASTE E DEPRECIAÇÃO (Largura menor: col-span-4) */}
        <div className={`p-6 rounded-3xl bg-card/60 border border-borda-sutil relative flex flex-col shadow-2xl backdrop-blur-3xl group transition-all duration-500 overflow-hidden premium-card premium-card-stone col-span-12 md:col-span-4 ${!cobrarDesgaste ? "opacity-40 grayscale" : ""}`}>
          {/* Glow Cinza de Fundo */}
          <div className="absolute -top-24 -right-20 w-80 h-80 bg-stone-500/10 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />
          
          <div className="relative z-10 flex items-center justify-between pb-4 border-b border-borda-sutil">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-400 border border-stone-500/30 bg-gradient-to-br from-stone-500/10 to-zinc-500/10">
                <Activity size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-primary">Desgaste e Depreciação</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Vida útil do equipamento</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setCobrarDesgaste(!cobrarDesgaste)}
              className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-500/50 ${
                cobrarDesgaste ? 'bg-stone-500' : 'bg-muted dark:bg-zinc-700'
              }`}
              aria-label="Cobrar Desgaste"
            >
              <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-300 ${
                cobrarDesgaste ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
          
          <div className={`flex-1 flex flex-col justify-between pt-6 transition-opacity duration-300 ${!cobrarDesgaste ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-black uppercase text-muted-foreground tracking-wider mb-2">Perfil de Vida Útil</label>
                <div className="flex bg-muted/30 dark:bg-zinc-900/60 p-0.5 rounded-xl border border-borda-sutil">
                  {([
                    { value: 5, label: "Padrão", anos: "5 anos" },
                    { value: 3, label: "Severo", anos: "3 anos" },
                    { value: 2, label: "Extremo", anos: "2 anos" }
                  ] as const).map((opcao) => (
                    <button
                      key={opcao.value}
                      type="button"
                      disabled={!cobrarDesgaste}
                      onClick={() => setAnosVidaUtil?.(opcao.value)}
                      className={`flex-1 flex flex-col items-center justify-center text-[9px] font-black uppercase py-1.5 rounded-lg transition-all cursor-pointer ${
                        anosVidaUtil === opcao.value
                          ? opcao.value === 5
                            ? 'bg-stone-500/20 text-stone-600 dark:text-stone-400 border border-stone-500/30 shadow-sm'
                            : opcao.value === 3
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm'
                            : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-sm'
                          : 'text-muted-foreground border border-transparent hover:text-primary dark:hover:text-white'
                      }`}
                    >
                      <span>{opcao.label}</span>
                      <span className="text-[8px] font-bold opacity-60 normal-case">{opcao.anos}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase text-muted-foreground tracking-wider mb-2">Taxa de Desgaste (por Hora)</label>
                {/* Visualizador de Taxa de Alta Fidelidade Vertical e Centralizado para Larguras Estreitas */}
                <div className="w-full p-4 rounded-xl flex flex-col items-center justify-center text-center border bg-muted/20 dark:bg-zinc-900/40 border-borda-sutil select-none relative overflow-hidden group gap-2.5">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Custo Horário Estimado</span>
                  
                  <div className="flex items-baseline justify-center gap-0.5 z-10">
                    <span className="font-black text-3xl text-stone-600 dark:text-stone-400 tracking-tight leading-none">
                      <ContadorAnimado valor={cobrarDesgaste ? (depreciacao / 100) || 0 : 0} />
                    </span>
                    <span className="text-xs font-black text-muted-foreground/60 select-none">/h</span>
                  </div>
                  
                  <span className="text-[9px] font-medium text-muted-foreground/50 leading-none">Depreciação operacional da impressora</span>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-stone-500/30 to-transparent" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-muted-foreground justify-center bg-zinc-900/20 py-1.5 px-3 rounded-lg border border-white/[0.02]">
                  <Clock size={10} className="text-stone-500" />
                  <span>
                    FÓRMULA: (Valor Máquina / {anosVidaUtil} Anos) / 12 Meses / 240h
                  </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-500/5 border border-stone-500/10 flex flex-col gap-1.5 relative overflow-hidden mt-1">
                <div className="flex justify-between items-center z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-stone-600 dark:text-stone-500 tracking-wider">Custo do Desgaste:</span>
                    <span className="text-[9px] font-bold text-muted-foreground">Tempo Impressão: {Math.floor(tempo / 60)}h {Math.floor(tempo % 60)}min</span>
                  </div>
                  <span className={`text-xl font-black tracking-tight ${cobrarDesgaste ? 'text-stone-600 dark:text-stone-400' : 'text-muted-foreground'}`}>
                    <ContadorAnimado valor={cobrarDesgaste ? (tempo / 60) * (depreciacao / 100) : 0} />
                  </span>
                </div>
                
                {quantidade > 1 && (
                  <div className="flex justify-between items-center pt-2 border-t border-stone-500/10 z-10">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Total do Lote ({quantidade}x):</span>
                    <span className={`text-sm font-black ${cobrarDesgaste ? 'text-stone-600 dark:text-stone-400' : 'text-muted-foreground'}`}>
                      <ContadorAnimado valor={cobrarDesgaste ? (tempo / 60) * (depreciacao / 100) * quantidade : 0} />
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-stone-500/5 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CARD 3: MARGEM DE LUCRO */}
      <div className={`p-6 rounded-3xl bg-card border border-borda-sutil relative shadow-2xl backdrop-blur-3xl group transition-all duration-500 w-full overflow-hidden premium-card premium-card-${msgMargem.corBase}`}>
        {/* Glow Dinâmico de Fundo */}
        <div 
          className="absolute -top-24 -left-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-all duration-700 opacity-10"
          style={{ backgroundColor: msgMargem.corHex }}
        />

        {aplicarTemplate && (
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-borda-sutil pb-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-primary">Templates Rápidos</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Configurações pré-definidas para tipos de projeto</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {templates.map((t: any, idx: number) => {
                const cores = ['violet', 'amber', 'sky', 'rose', 'emerald'];
                const cor = cores[idx % cores.length];
                return (
                  <button 
                    key={t.id}
                    type="button" 
                    onClick={() => {
                      setMargem(t.margem * 100);
                      setCobrarMaoDeObra(t.maoDeObra);
                      setCobrarDesgaste(t.desgaste);
                    }} 
                    className={`px-3 py-1.5 rounded-xl border border-borda-sutil hover:border-${cor}-500 hover:bg-${cor}-500/10 text-[10px] font-black text-muted-foreground hover:text-${cor}-500 transition-all uppercase tracking-widest active:scale-95 cursor-pointer`}
                  >
                    {t.nome}
                  </button>
                );
              })}
              <div className="w-px h-6 bg-borda-sutil mx-1" />
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-muted/40 dark:bg-white/5 border border-borda-sutil text-zinc-500 hover:text-primary hover:border-zinc-500/30 transition-all shrink-0 cursor-pointer"
                title="Configurações"
                onClick={() => setModalPresetsAberto(true)}
              >
                <Settings size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Coluna Esquerda: O Display do Valor e Status */}
          <div className="md:col-span-4 flex flex-col items-center md:items-center border-b md:border-b-0 md:border-r border-borda-sutil pb-4 md:pb-0 md:pr-6">
            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-[2px] text-center mb-1">Margem de Lucro</label>
            
            <div className="flex items-baseline gap-1 relative">
              <ContadorAnimado 
                valor={margemInterna / 100} 
                prefixo="" 
                sufixo="" 
                casasDecimais={0} 
                className={`text-5xl font-black transition-colors duration-500 ${msgMargem.cor}`} 
              />
              <span className={`text-base font-black transition-colors duration-500 ${msgMargem.cor} opacity-50`}>%</span>

              {/* Brilho Sutil de Cor */}
              <div 
                className="absolute inset-0 blur-2xl opacity-20 pointer-events-none transition-all duration-700"
                style={{ backgroundColor: msgMargem.corHex, transform: 'scale(1.5)' }}
              />
            </div>

            {/* Exibição Dinâmica do Fator Markup */}
            <div className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1 bg-zinc-100 dark:bg-white/5 py-1 px-2.5 rounded-lg border border-borda-sutil" title="Fator multiplicador aplicado ao custo total para chegar ao preço de venda">
              <span className="uppercase tracking-wider">Markup:</span>
              <span className="text-xs font-black text-primary dark:text-white">{(1 + margemInterna / 10000).toFixed(1)}x</span>
            </div>

            <div className="flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-muted/30 dark:bg-white/5 border border-borda-sutil">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${msgMargem.cor.replace('text-', 'bg-')}`} />
              <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${msgMargem.cor}`}>
                {msgMargem.texto}
              </p>
            </div>
          </div>

          {/* Coluna Direita: Controles */}
          <div className="md:col-span-8 flex flex-col space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Presets rápidos</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Presets Inteligentes com B2B e B2C explicitamente identificados */}
                {presets.map((preset: any) => (
                  <button 
                    key={preset.valor}
                    type="button" 
                    onClick={() => setMargemInterna(preset.valor)} 
                    className={`px-3 py-1.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest active:scale-95 cursor-pointer flex-1 sm:flex-none text-center ${
                      margemInterna === preset.valor 
                        ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(255,255,255,0.15)] dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                        : 'border-borda-sutil hover:border-primary/50 text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {preset.rotulo || `${preset.valor / 100}%`}
                  </button>
                ))}

                {/* Input Direto */}
                <div className="flex items-center bg-muted/40 dark:bg-white/5 border border-borda-sutil rounded-xl px-2 w-20 h-8">
                  <input 
                    type="number" 
                    value={margemInterna === 0 ? "" : (margemInterna / 100)} 
                    onChange={(e) => {
                      const val = Math.round(Number(e.target.value) * 100);
                      setMargemInterna(val);
                    }} 
                    className="w-full bg-transparent border-none outline-none font-black text-xs text-right text-primary dark:text-white pr-1"
                    placeholder="0"
                  />
                  <span className="text-[10px] font-black text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Slider de Arrastar */}
            <div className="relative flex items-center pt-2 w-full">
              {/* Fundo da Barra */}
              <div className="absolute w-full h-1.5 bg-muted dark:bg-white/[0.03] border border-borda-sutil/20 rounded-full" />
              
              {/* Preenchimento Colorido até a marcação */}
              <div 
                className={`absolute h-1.5 rounded-full pointer-events-none transition-all ease-out duration-75 ${
                  margemInterna === 0 ? "bg-zinc-500" :
                  margemInterna <= 2000 ? "bg-rose-500" :
                  margemInterna <= 6000 ? "bg-amber-500" :
                  margemInterna <= 12000 ? "bg-emerald-500" :
                  margemInterna <= 25000 ? "bg-sky-500" :
                  "bg-violet-500"
                }`}
                style={{ width: `${Math.min(100, margemInterna / 500)}%` }}
              />
              
              <input 
                type="range" 
                min="0" 
                max="50000" 
                step="100" 
                value={margemInterna > 50000 ? 50000 : margemInterna} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMargemInterna(val);
                }} 
                className={`w-full h-1.5 appearance-none bg-transparent cursor-pointer relative z-10 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] 
                  [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 
                  hover:[&::-webkit-slider-thumb]:scale-125 ${
                    margemInterna === 0 ? "[&::-webkit-slider-thumb]:border-zinc-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(115,115,115,0.5)]" :
                    margemInterna <= 2000 ? "[&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(244,63,94,0.5)]" :
                    margemInterna <= 6000 ? "[&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(245,158,11,0.5)]" :
                    margemInterna <= 12000 ? "[&::-webkit-slider-thumb]:border-emerald-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(16,185,129,0.5)]" :
                    margemInterna <= 25000 ? "[&::-webkit-slider-thumb]:border-sky-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(14,165,233,0.5)]" :
                    "[&::-webkit-slider-thumb]:border-violet-500 [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                  }`} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configuração de Presets */}
      {modalPresetsAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card border border-borda-sutil rounded-3xl p-6 w-full max-w-3xl shadow-2xl relative mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                <Settings size={18} className="animate-spin-slow" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-black uppercase tracking-wider text-primary">Configurações Rápidas</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Customize presets e templates</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 my-5 max-h-[60vh] md:max-h-[50vh] overflow-y-auto pr-1 scrollbar-fino">
              {/* Parte 1: PRESETS */}
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">Presets Rápidos</span>
                <div className="space-y-2.5">
                  {presetsEditados.map((preset, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-borda-sutil hover:border-zinc-500/20 hover:bg-muted/40 transition-all gap-4">
                      <div className="flex flex-col flex-1">
                        <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Predefinição {idx + 1}</span>
                        <input 
                          type="text" 
                          value={preset.rotulo}
                          onChange={(e) => {
                            const novos = [...presetsEditados];
                            novos[idx].rotulo = e.target.value;
                            setPresetsEditados(novos);
                          }}
                          className="text-xs font-black text-primary bg-transparent border-b border-dashed border-borda-sutil w-full focus:border-sky-500/50 mt-1 pb-0.5"
                        />
                      </div>
                      <div className="w-24 flex flex-col gap-1 text-right shrink-0 bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/5 dark:border-white/5">
                        <label className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400">Margem (%)</label>
                        <div className="flex items-center justify-end gap-0.5">
                          <input 
                            type="number" 
                            value={preset.valor}
                            onChange={(e) => {
                              const novos = [...presetsEditados];
                              novos[idx].valor = Number(e.target.value);
                              setPresetsEditados(novos);
                            }}
                            className="w-16 bg-transparent border-none outline-none font-black text-sm text-right text-primary dark:text-white pr-0.5"
                          />
                          <span className="text-[10px] font-black text-zinc-400">%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divisor */}
              <div className="w-full md:w-px h-px md:h-auto self-stretch bg-borda-sutil shrink-0" />

              {/* Parte 2: TEMPLATES */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Templates Rápidos</span>
                  <button 
                    type="button" 
                    onClick={() => setTemplatesEditados([...templatesEditados, { id: `custom_${Date.now()}`, nome: 'NOVO TEMPLATE', descricao: 'Descrição Curta', margem: 100, maoDeObra: false, desgaste: false }])} 
                    className="flex items-center gap-1 text-[8px] font-bold text-sky-500 hover:bg-sky-500/20 uppercase tracking-widest bg-sky-500/10 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                  >
                    <Plus size={10} /> Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {templatesEditados.map((t, idx) => (
                    <div key={t.id} className="flex flex-col p-4 rounded-2xl bg-muted/30 border border-borda-sutil opacity-100 gap-3 group relative hover:border-sky-500/20 hover:bg-muted/40 transition-all">
                      <div className="flex items-start justify-between gap-3">
                         <div className="flex flex-col flex-1 gap-1.5">
                           <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Configuração</span>
                           <input 
                              type="text" 
                              value={t.nome} 
                              onChange={(e) => { const n = [...templatesEditados]; n[idx].nome = e.target.value; setTemplatesEditados(n); }} 
                              className="text-xs font-black text-primary bg-transparent outline-none border-b border-dashed border-borda-sutil w-full focus:border-sky-500/50 pb-0.5" 
                              placeholder="Nome do Template"
                           />
                           <input 
                              type="text" 
                              value={t.descricao} 
                              onChange={(e) => { const n = [...templatesEditados]; n[idx].descricao = e.target.value; setTemplatesEditados(n); }} 
                              className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-transparent outline-none border-b border-dashed border-borda-sutil w-full focus:border-sky-500/50 pb-0.5 mt-0.5" 
                              placeholder="Descrição (ex: Foco em Precisão)"
                           />
                         </div>
                         <button 
                            type="button" 
                            onClick={() => setTemplatesEditados(templatesEditados.filter(x => x.id !== t.id))} 
                            className="text-rose-500/50 hover:text-rose-500 p-2 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors shrink-0 mt-3"
                            title="Remover template"
                         >
                            <Trash2 size={13} />
                         </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 bg-black/5 dark:bg-white/5 p-2.5 rounded-lg border border-black/5 dark:border-white/5">
                        <div className="flex flex-col">
                           <label className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400 mb-1">Margem (%)</label>
                           <input 
                              type="number" 
                              value={t.margem} 
                              onChange={(e) => { const n = [...templatesEditados]; n[idx].margem = Number(e.target.value); setTemplatesEditados(n); }} 
                              className="w-full bg-transparent border-b border-dashed border-borda-sutil outline-none font-black text-xs text-primary focus:border-amber-500/50" 
                           />
                        </div>
                        <div className="flex flex-col items-center">
                           <label className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400 mb-1">Mão de Obra</label>
                           <button
                              type="button"
                              onClick={() => {
                                const n = [...templatesEditados];
                                n[idx].maoDeObra = !n[idx].maoDeObra;
                                setTemplatesEditados(n);
                              }}
                              className={`mt-1 flex items-center justify-center w-5 h-5 rounded-md border transition-all cursor-pointer ${
                                t.maoDeObra 
                                  ? 'bg-violet-500 border-violet-600 text-white' 
                                  : 'border-borda-sutil bg-zinc-800/10 hover:border-zinc-500/30'
                              }`}
                           >
                              {t.maoDeObra && <Check size={10} strokeWidth={4} />}
                           </button>
                        </div>
                        <div className="flex flex-col items-center">
                           <label className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400 mb-1">Desgaste</label>
                           <button
                              type="button"
                              onClick={() => {
                                const n = [...templatesEditados];
                                n[idx].desgaste = !n[idx].desgaste;
                                setTemplatesEditados(n);
                              }}
                              className={`mt-1 flex items-center justify-center w-5 h-5 rounded-md border transition-all cursor-pointer ${
                                t.desgaste 
                                  ? 'bg-amber-500 border-amber-600 text-white' 
                                  : 'border-borda-sutil bg-zinc-800/10 hover:border-zinc-500/30'
                              }`}
                           >
                              {t.desgaste && <Check size={10} strokeWidth={4} />}
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {templatesEditados.length === 0 && (
                    <div className="text-center p-4 border border-dashed border-borda-sutil rounded-xl bg-muted/20">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nenhum template cadastrado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button 
                type="button"
                onClick={() => setModalPresetsAberto(false)}
                className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-muted-foreground dark:text-zinc-300 border border-borda-sutil transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={salvarPresetsPersonalizados}
                className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition-all cursor-pointer shadow-lg shadow-sky-500/20"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIG MICRO-TAREFAS */}
      {modalMicroTarefasAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-borda-sutil relative">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                <Settings size={18} className="animate-spin-slow" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-black uppercase tracking-wider text-primary">Micro-tarefas</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Tempo operacional de setup</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-fino">
              {listaMicroTarefas.map((t: any) => (
                <div key={t.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-borda-sutil">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary">{t.label}</span>
                    <span className="text-[10px] font-black text-muted-foreground">+{t.time} MIN</span>
                  </div>
                  <button type="button" onClick={() => removerMicroTarefa(t.key)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mb-6 p-3 rounded-xl bg-zinc-900/40 border border-borda-sutil">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Nova Tarefa</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={novaMicroLabel}
                  onChange={(e) => setNovaMicroLabel(e.target.value)}
                  placeholder="Nome (ex: Limpeza)"
                  className="flex-[2] h-9 px-3 rounded-lg bg-background border border-borda-sutil outline-none text-xs font-bold focus:border-violet-500/50"
                />
                <input 
                  type="number" 
                  value={novaMicroTempo}
                  onChange={(e) => setNovaMicroTempo(e.target.value)}
                  placeholder="Min"
                  className="flex-1 h-9 px-3 rounded-lg bg-background border border-borda-sutil outline-none text-xs font-bold focus:border-violet-500/50"
                />
                <button type="button" onClick={adicionarMicroTarefa} className="h-9 w-9 flex items-center justify-center rounded-lg bg-violet-500 text-white hover:bg-violet-400 transition-colors shrink-0">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setModalMicroTarefasAberto(false)}
              className="w-full h-10 text-[10px] font-black uppercase tracking-widest rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-muted-foreground dark:text-zinc-300 border border-borda-sutil transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
