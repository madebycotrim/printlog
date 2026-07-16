import { useState, useEffect, memo } from "react";
import { Zap, Settings, Trash2, Plus, Activity } from "lucide-react";
import { ContadorAnimado, Dialogo } from "@/compartilhado/componentes/ui";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";

interface CardLucroProps {
  margem: number;
  setMargem: (v: number) => void;
  setCobrarCustosAdicionais?: (v: boolean) => void;
  setCobrarDesgaste: (v: boolean) => void;
  aplicarTemplate?: boolean;
}

export const CardLucro = memo(function CardLucro({
  margem,
  setMargem,
  setCobrarCustosAdicionais,
  setCobrarDesgaste,
  aplicarTemplate = true
}: CardLucroProps) {
  const [margemInterna, setMargemInterna] = useState(margem);

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
    { id: '1', nome: 'Action Figure', descricao: 'Margem + Custos Extras', margem: 300, custosAdicionais: true, desgaste: true },
    { id: '2', nome: 'Peça Técnica', descricao: 'Foco em Precisão', margem: 150, custosAdicionais: false, desgaste: true },
    { id: '3', nome: 'Protótipo (Rápido)', descricao: 'Baixo Custo', margem: 50, custosAdicionais: false, desgaste: false }
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

  const salvarPresets = async () => {
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
    } catch (e) {
      console.error("Erro ao salvar configurações");
    }
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
    <>
      <div className={`p-6 rounded-3xl bg-card border border-borda-sutil relative shadow-2xl backdrop-blur-3xl group transition-all duration-500 w-full overflow-hidden premium-card premium-card-${msgMargem.corBase}`}>
        <div 
          className="absolute -top-24 -left-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none transition-all duration-700 opacity-10"
          style={{ backgroundColor: msgMargem.corHex }}
        />

        {aplicarTemplate && (
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-borda-sutil pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-blue-500/10">
                <Zap size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-primary">Perfis de Projeto</span>
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
                      if (setCobrarCustosAdicionais) setCobrarCustosAdicionais(t.custosAdicionais);
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
            </div>

            <div className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1 bg-zinc-100 dark:bg-white/5 py-1 px-2.5 rounded-lg border border-borda-sutil" title="Fator multiplicador aplicado ao custo total para chegar ao preço de venda">
              <span className="uppercase tracking-wider">Markup:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300">{(margemInterna / 100 / 100 + 1).toFixed(2)}x</span>
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col w-full gap-3">
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col">
                <span className={`text-sm font-black transition-colors duration-500 ${msgMargem.cor}`}>{msgMargem.texto}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Use o controle deslizante ou os botões rápidos</span>
              </div>
            </div>

            <div className="relative h-12 w-full flex items-center mb-2 px-2">
              <input 
                type="range"
                min="0"
                max="50000"
                step="500"
                value={margemInterna}
                onChange={(e) => setMargemInterna(Number(e.target.value))}
                className="w-full absolute inset-0 opacity-0 cursor-ew-resize z-20 h-full"
              />
              <div className="w-full h-3 bg-muted/50 dark:bg-zinc-800/50 rounded-full border border-borda-sutil relative z-10 flex items-center pointer-events-none">
                <div 
                  className={`h-full transition-all duration-300 rounded-full absolute left-0`}
                  style={{ 
                    width: `${Math.min(100, (margemInterna / 50000) * 100)}%`,
                    backgroundColor: msgMargem.corHex
                  }}
                />
                <div 
                  className="w-6 h-6 bg-white rounded-full absolute shadow-lg border-4 transition-all duration-300"
                  style={{ 
                    left: `calc(${Math.min(100, (margemInterna / 50000) * 100)}% - 12px)`,
                    borderColor: msgMargem.corHex
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full justify-between">
              {presets.map((preset: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMargemInterna(preset.valor)}
                  className={`flex-1 min-w-[60px] h-10 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 group overflow-hidden relative ${
                    margemInterna === preset.valor 
                      ? `border-transparent shadow-lg text-white` 
                      : `bg-muted/40 border-borda-sutil hover:border-zinc-400/50 dark:hover:border-zinc-600`
                  }`}
                  style={margemInterna === preset.valor ? { backgroundColor: msgMargem.corHex } : {}}
                >
                  <span className={`text-[11px] font-black tracking-tight z-10 ${margemInterna === preset.valor ? 'text-white' : 'text-primary dark:text-white'}`}>
                    {preset.valor / 100}%
                  </span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest z-10 ${margemInterna === preset.valor ? 'text-white/80' : 'text-muted-foreground group-hover:text-zinc-500'}`}>
                    {preset.rotulo}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialogo
        aberto={modalPresetsAberto}
        aoFechar={() => setModalPresetsAberto(false)}
        titulo="Configurações Rápidas"
        subtitulo="Customize presets e templates"
        icone={Settings}
        larguraMax="max-w-4xl"
      >
        <div className="flex flex-col md:flex-row h-full">
          <div className="flex-1 p-8 bg-zinc-50 dark:bg-zinc-900/50 border-b md:border-b-0 md:border-r border-borda-sutil">
            <span className="text-xs font-black uppercase tracking-widest text-primary dark:text-white mb-6 block">Presets Rápidos</span>
            <div className="space-y-3">
              {presetsEditados.map((preset, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 dark:bg-zinc-900/40 border border-borda-sutil gap-2">
                  <div className="flex flex-col flex-1">
                    <input 
                      type="text" 
                      value={preset.rotulo}
                      onChange={(e) => {
                        const novos = [...presetsEditados];
                        novos[idx].rotulo = e.target.value;
                        setPresetsEditados(novos);
                      }}
                      className="text-sm font-black text-primary dark:text-white bg-transparent outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-borda-sutil shadow-inner">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Margem</span>
                    <input 
                      type="number" 
                      value={preset.valor}
                      onChange={(e) => {
                        const novos = [...presetsEditados];
                        novos[idx].valor = Number(e.target.value);
                        setPresetsEditados(novos);
                      }}
                      className="w-10 bg-transparent outline-none font-black text-sm text-right"
                    />
                    <span className="text-[10px] font-black text-sky-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-[1.5] p-8 relative bg-card flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-primary dark:text-white">Templates de Projeto</span>
              <button 
                type="button" 
                onClick={() => setTemplatesEditados([...templatesEditados, { id: `custom_${Date.now()}`, nome: 'NOVO TEMPLATE', descricao: 'Descrição Curta', margem: 100, custosAdicionais: false, desgaste: false }])} 
                className="h-8 px-3 rounded-lg border border-sky-500/30 text-[9px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-all flex items-center gap-1.5"
              >
                <Plus size={10} /> ADICIONAR
              </button>
            </div>
            <div className="space-y-3 flex-1">
              {templatesEditados.map((t, idx) => (
                <div key={t.id} className="flex flex-col gap-3 p-4 rounded-xl bg-muted/20 dark:bg-zinc-900/40 border border-borda-sutil hover:border-sky-500/20 transition-all">
                  <div className="flex items-start justify-between gap-2">
                     <div className="flex flex-col flex-1">
                       <input 
                          type="text" 
                          value={t.nome} 
                          onChange={(e) => { const n = [...templatesEditados]; n[idx].nome = e.target.value; setTemplatesEditados(n); }} 
                          className="text-sm font-black text-primary dark:text-white bg-transparent outline-none w-full" 
                       />
                       <input 
                          type="text" 
                          value={t.descricao} 
                          onChange={(e) => { const n = [...templatesEditados]; n[idx].descricao = e.target.value; setTemplatesEditados(n); }} 
                          className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-transparent outline-none w-full" 
                       />
                     </div>
                     <button 
                        type="button" 
                        onClick={() => setTemplatesEditados(templatesEditados.filter(x => x.id !== t.id))} 
                        className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-950 border border-borda-sutil text-zinc-400 hover:text-rose-500 flex items-center justify-center transition-all"
                     >
                        <Trash2 size={12} />
                     </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-borda-sutil shadow-inner">
                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Margem</span>
                       <input 
                          type="number" 
                          value={t.margem} 
                          onChange={(e) => { const n = [...templatesEditados]; n[idx].margem = Number(e.target.value); setTemplatesEditados(n); }} 
                          className="w-10 bg-transparent outline-none font-black text-xs text-right" 
                       />
                       <span className="text-[10px] font-black text-sky-500">%</span>
                    </div>
                    
                    <button
                       type="button"
                       onClick={() => { const n = [...templatesEditados]; n[idx].custosAdicionais = !n[idx].custosAdicionais; setTemplatesEditados(n); }}
                       className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${t.custosAdicionais ? 'bg-violet-500/10 border-violet-500/30 text-violet-600' : 'bg-white dark:bg-zinc-950 border-borda-sutil text-zinc-400'}`}
                    >
                       <Zap size={10} /> Custos Extras
                    </button>

                    <button
                       type="button"
                       onClick={() => { const n = [...templatesEditados]; n[idx].desgaste = !n[idx].desgaste; setTemplatesEditados(n); }}
                       className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${t.desgaste ? 'bg-orange-500/10 border-orange-500/30 text-orange-600' : 'bg-white dark:bg-zinc-950 border-borda-sutil text-zinc-400'}`}
                    >
                       <Activity size={10} /> Depreciação
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-8 pt-6 border-t border-borda-sutil">
              <button onClick={() => setModalPresetsAberto(false)} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200">Fechar</button>
              <button onClick={() => { salvarPresets(); setModalPresetsAberto(false); }} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-sky-500 text-white hover:bg-sky-600">Salvar</button>
            </div>
          </div>
        </div>
      </Dialogo>
    </>
  );
});
