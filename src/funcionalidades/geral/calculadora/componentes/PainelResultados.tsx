import { Box, Zap, Timer, Activity, Package, DollarSign, PieChart, ShieldCheck, FolderKanban, Download, Sparkles, MessageCircle, AlertTriangle, PenTool, TrendingDown, TrendingUp, Rocket, Crown, Ban, Link as LinkIcon, FileText, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { CalculoResultado, MaterialSelecionado, InsumoSelecionado, ItemPosProcesso } from "../tipos";
import { memo, useState, useRef, useEffect } from "react";
import { ContadorAnimado } from "@/compartilhado/componentes/ui";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";

interface PainelResultadosProps {
  calculo: CalculoResultado;
  dadosPizza: any[];
  aba: 'orcamento' | 'metricas';
  setAba: (v: 'orcamento' | 'metricas') => void;
  salvarProjeto: () => void;
  gerarPdf: () => void;
  gerarLinkMagico?: () => void;
  abrirModalEmail?: () => void;
  obterUrlLinkMagico?: () => string | null;
  carregandoPdf?: boolean;
  materiais?: MaterialSelecionado[];
  insumos?: InsumoSelecionado[];
  posProcesso?: ItemPosProcesso[];
  quantidade?: number;
  insumosFixos?: number;
  tempo?: number;
  modoEntrada?: 'unitario' | 'lote' | 'projeto';
  frete?: number;
  taxaFixa?: number;
  aoSugerirPrecoIA?: () => void;
  descontoVolume?: number;
  setDescontoVolume?: (v: number) => void;
  precoAlvoCentavos?: number;
  setPrecoAlvoCentavos?: (v: number) => void;
}

export const PainelResultados = memo(function PainelResultados({
  calculo, dadosPizza, aba, setAba, salvarProjeto, gerarPdf, gerarLinkMagico, abrirModalEmail, obterUrlLinkMagico, carregandoPdf,
  materiais = [], insumos = [], posProcesso = [], quantidade = 1, insumosFixos = 0,
  tempo = 0, modoEntrada = 'projeto', frete = 0, taxaFixa = 0, aoSugerirPrecoIA,
  descontoVolume = 0, setDescontoVolume, precoAlvoCentavos = 0, setPrecoAlvoCentavos
}: PainelResultadosProps) {
  const { usuario } = useAutenticacao();

  const [menuExportarAberto, setMenuExportarAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuExportarAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const compartilharWhatsApp = (incluirLink: boolean) => {
    setMenuExportarAberto(false);
    const nomeEstudio = "Meu Estúdio 3D";
    const valorFormatado = centavosParaReais(calculo.precoSugerido);
    
    let baseTemplate = "Olá, tudo bem? 👋\n\nAqui está o orçamento do seu projeto:\n\n*Serviço:* Impressão 3D de Alta Qualidade 🖨️\n*Estúdio:* {estudio}\n*Investimento:* {valor}\n\n_Prazo de produção e entrega sob consulta._";
    
    if (incluirLink && obterUrlLinkMagico) {
      const url = obterUrlLinkMagico();
      baseTemplate += `\n\nVocê pode conferir os detalhes e *assinar digitalmente* o orçamento acessando este link seguro:\n${url}`;
    } else {
      baseTemplate += "\n\nO *PDF* com todos os detalhes está em anexo!";
      gerarPdf();
    }

    baseTemplate += "\n\nFico à disposição para fecharmos! 🚀";
    
    const mensagem = baseTemplate
      .replace(/{estudio}/g, nomeEstudio)
      .replace(/{valor}/g, valorFormatado);

    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const corLucro = calculo.lucroLiquido <= 0 
    ? "zinc" 
    : calculo.margemReal <= 16 ? "rose"
    : calculo.margemReal <= 37 ? "amber"
    : calculo.margemReal <= 54 ? "emerald"
    : calculo.margemReal <= 71 ? "sky"
    : "violet";

  const corLucroClasses = {
    zinc: {
      bg: "bg-zinc-500/5",
      border: "border-zinc-500/15",
      shadow: "shadow-lg shadow-zinc-500/10",
      textPrimary: "text-zinc-600 dark:text-zinc-500",
      textSecondary: "text-zinc-600 dark:text-zinc-500/80",
      iconBg: "bg-zinc-500/10",
      icone: Ban
    },
    rose: {
      bg: "bg-rose-500/5",
      border: "border-rose-500/15",
      shadow: "shadow-lg shadow-rose-500/10",
      textPrimary: "text-rose-600 dark:text-rose-500",
      textSecondary: "text-rose-600 dark:text-rose-500/80",
      iconBg: "bg-rose-500/10",
      icone: TrendingDown
    },
    amber: {
      bg: "bg-amber-500/5",
      border: "border-amber-500/15",
      shadow: "shadow-lg shadow-amber-500/10",
      textPrimary: "text-amber-600 dark:text-amber-500",
      textSecondary: "text-amber-600 dark:text-amber-500/80",
      iconBg: "bg-amber-500/10",
      icone: TrendingUp
    },
    emerald: {
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/15",
      shadow: "shadow-[0_8px_30px_-10px_rgba(16,185,129,0.15)]",
      textPrimary: "text-emerald-600 dark:text-emerald-500",
      textSecondary: "text-emerald-600 dark:text-emerald-500/80",
      iconBg: "bg-emerald-500/10",
      icone: ShieldCheck
    },
    sky: {
      bg: "bg-sky-500/5",
      border: "border-sky-500/15",
      shadow: "shadow-lg shadow-sky-500/10",
      textPrimary: "text-sky-600 dark:text-sky-500",
      textSecondary: "text-sky-600 dark:text-sky-500/80",
      iconBg: "bg-sky-500/10",
      icone: Rocket
    },
    violet: {
      bg: "bg-violet-500/5",
      border: "border-violet-500/15",
      shadow: "shadow-lg shadow-violet-500/10",
      textPrimary: "text-violet-600 dark:text-violet-500",
      textSecondary: "text-violet-600 dark:text-violet-500/80",
      iconBg: "bg-violet-500/10",
      icone: Crown
    }
  };

  const cl = corLucroClasses[corLucro];



  return (
    <div className={`pt-4 pb-6 px-6 rounded-2xl bg-card border border-borda-sutil shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] flex flex-col items-center text-center overflow-hidden relative h-fit w-full mx-auto animate-in fade-in duration-1000 backdrop-blur-3xl premium-card premium-card-sky`}>
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="relative z-10 w-full">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-600 dark:text-sky-400">Preço Sugerido</span>
          {(usuario?.plano === 'PRO' || usuario?.plano === 'FUNDADOR') && (
            <button 
              onClick={aoSugerirPrecoIA}
              title="Otimizar Preço com IA"
              className="p-1.5 rounded-lg text-sky-400 bg-sky-500/5 border border-sky-500/10 hover:bg-sky-500/20 hover:border-sky-500/30 hover:scale-110 active:scale-95 transition-all animate-pulse hover:animate-none group/ia"
            >
              <Sparkles size={14} className="fill-sky-400/20 group-hover/ia:fill-sky-400" />
            </button>
          )}
        </div>

        <div className="mt-2 mb-4">
          <h2 className={`text-4xl font-black tracking-tighter leading-none mb-3 text-center ${precoAlvoCentavos && precoAlvoCentavos > 0 ? "text-violet-500" : "text-primary"}`}>
            <ContadorAnimado valor={calculo.precoSugerido / 100} />
          </h2>

          {(() => {
            const pesoAcumulado = materiais.reduce((acc, m) => acc + (modoEntrada === 'lote' ? m.quantidade : m.quantidade * Math.max(1, quantidade)), 0);
            const tempoCalculado = modoEntrada === 'lote' ? tempo : tempo * Math.max(1, quantidade);
            const h = Math.floor(tempoCalculado / 60);
            const m = Math.round(tempoCalculado % 60);
            const tempoStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
            
            return (pesoAcumulado > 0 || tempoCalculado > 0) ? (
              <div className="flex items-center justify-center gap-3 mb-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {pesoAcumulado > 0 && <span>{pesoAcumulado.toFixed(1)}g total</span>}
                {pesoAcumulado > 0 && tempoCalculado > 0 && <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />}
                {tempoCalculado > 0 && <span>{tempoStr}</span>}
              </div>
            ) : null;
          })()}

          <div className="flex flex-col gap-3 items-center">
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-borda-sutil bg-muted/30 focus-within:border-sky-500/50 transition-colors shadow-inner">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Desconto Lote:</span>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={!descontoVolume || descontoVolume === 0 ? "" : descontoVolume}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDescontoVolume?.(v === "" ? 0 : Number(v));
                  }}
                  className="w-8 bg-transparent text-[11px] font-black text-primary dark:text-white text-center outline-none border-b border-borda-sutil focus:border-sky-500 transition-colors"
                  placeholder="0"
                />
                <span className="text-[10px] font-black text-muted-foreground">%</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-borda-sutil bg-violet-500/5 focus-within:border-violet-500/50 transition-colors shadow-inner" title="Matemática Reversa: Calcule o lucro com base no preço final pago pelo cliente">
                <span className="text-[9px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-500">Preço Alvo: R$</span>
                <input 
                  type="number"
                  min="0"
                  value={!precoAlvoCentavos || precoAlvoCentavos === 0 ? "" : (precoAlvoCentavos || 0) / 100}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPrecoAlvoCentavos?.(v === "" ? 0 : Math.round(Number(v) * 100));
                  }}
                  className="w-16 bg-transparent text-[11px] font-black text-violet-600 dark:text-violet-500 text-center outline-none border-b border-borda-sutil focus:border-violet-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex bg-muted/40 dark:bg-white/5 p-1 rounded-2xl mb-4 w-full shadow-inner">
          <button onClick={() => setAba('orcamento')} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${aba === 'orcamento' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-muted-foreground hover:text-primary'}`}>Orçamento</button>
          <button onClick={() => setAba('metricas')} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 ${aba === 'metricas' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-muted-foreground hover:text-primary'}`}>Métricas 360 <PieChart size={12} /></button>
        </div>
        
        {aba === 'orcamento' && (() => {
          const itens = [
            { label: 'Materiais', valor: calculo.custoMaterial, icone: Box, cor: 'text-sky-400' },
            { label: 'Modelagem 3D', valor: calculo.custoModelagem || 0, icone: PenTool, cor: 'text-rose-400' },
            { label: 'Perdas & Falhas', valor: calculo.custoFalha || 0, icone: AlertTriangle, cor: 'text-rose-500' },
            { label: 'Insumos & Extras', valor: calculo.custoInsumos + calculo.custoPosProcesso, icone: Package, cor: 'text-indigo-400' },
            { label: 'Energia Elétrica', valor: calculo.custoEnergia, icone: Zap, cor: 'text-amber-400' },
            { label: 'Mão de Obra', valor: calculo.custoMaoDeObra, icone: Timer, cor: 'text-emerald-400' },
            { label: 'Depreciação', valor: calculo.custoDepreciacao, icone: Activity, cor: 'text-zinc-400' },
            { label: 'Taxas', valor: calculo.taxaMarketplace, icone: DollarSign, cor: 'text-violet-400' },
            { label: 'Frete e Logística', valor: (modoEntrada === 'lote' ? frete * 100 : frete * 100 * quantidade) + (taxaFixa * 100), icone: Package, cor: 'text-orange-400' },
            { label: 'Desconto Aplicado', valor: -(calculo.valorDesconto || 0), icone: DollarSign, cor: 'text-emerald-500' },
          ].filter(i => i.valor !== 0);

          const estaVazio = itens.length === 0;

          return (
            <div className={`space-y-4 w-full text-left relative animate-in fade-in slide-in-from-right-4 duration-500 min-h-[160px] flex flex-col ${estaVazio ? 'justify-center' : 'justify-start'}`}>
              {estaVazio ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground w-full py-8">
                  <Sparkles size={24} className="opacity-40 text-sky-500 dark:text-sky-400 animate-pulse mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Aguardando dados</span>
                  <span className="text-[9px] font-bold text-muted-foreground/60 text-center tracking-tight uppercase">Insira pesos e tempos nos cards ao lado</span>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-fino space-y-4">
                  <AnimatePresence>
                  {itens.map((item) => {
                    // Calcular subitens
                    let subitens: { nome: React.ReactNode; valor: number }[] = [];
                    
                    if (item.label === 'Materiais' && materiais.length > 0) {
                      const agrupadosMap = new Map<string, {
                        nome: string;
                        tipo: string;
                        pesoAcumulado: number;
                        valorAcumulado: number;
                      }>();

                      materiais.forEach(m => {
                        const chave = m.id || m.nome;
                        const qtdReal = Math.max(1, quantidade);
                        const pesoFinal = modoEntrada === 'lote' ? m.quantidade : m.quantidade * qtdReal;
                        const valorItem = Math.round((m.quantidade / 1000) * m.precoKgCentavos * (modoEntrada === 'lote' ? 1 : qtdReal));

                        const existente = agrupadosMap.get(chave);
                        if (existente) {
                          existente.pesoAcumulado += pesoFinal;
                          existente.valorAcumulado += valorItem;
                        } else {
                          agrupadosMap.set(chave, {
                            nome: m.nome,
                            tipo: m.tipo,
                            pesoAcumulado: pesoFinal,
                            valorAcumulado: valorItem
                          });
                        }
                      });

                      subitens = Array.from(agrupadosMap.values()).map(agrupado => {
                        const unid = <span className="lowercase">{agrupado.tipo === 'FDM' ? 'g' : 'ml'}</span>;
                        return {
                          nome: <>{agrupado.nome} ({agrupado.pesoAcumulado}{unid})</>,
                          valor: agrupado.valorAcumulado
                        };
                      });
                    } else if (item.label === 'Insumos & Extras') {
                      const qtdReal = Math.max(1, quantidade);
                      const subInsumos = insumos.map(i => ({
                        nome: <>{i.nome} ({modoEntrada === 'lote' || i.porLote ? i.quantidade : i.quantidade * qtdReal}<span className="lowercase">x</span>)</>,
                        valor: (modoEntrada === 'lote' || i.porLote) ? i.quantidade * i.custoCentavos : i.quantidade * i.custoCentavos * qtdReal
                      }));
                      const subPos = posProcesso.map(p => ({
                        nome: (modoEntrada === 'unitario' || modoEntrada === 'projeto') ? <>{p.nome} (<span className="lowercase">x</span>{qtdReal})</> : p.nome,
                        valor: p.valor * (modoEntrada === 'lote' ? 1 : qtdReal)
                      }));
                      subitens = [...subInsumos, ...subPos];

                      if (insumosFixos && insumosFixos > 0) {
                        subitens.push({
                          nome: 'Insumos Fixos',
                          valor: Math.round(insumosFixos * 100)
                        });
                      }
                    } else if (item.label === 'Depreciação') {
                      const qtdReal = Math.max(1, quantidade);
                      const horasTotais = modoEntrada === 'lote' ? (tempo / 60) : (tempo / 60) * qtdReal;
                      subitens = [{
                        nome: <>Uso da Máquina ({horasTotais < 1 
                          ? <>{Math.round(horasTotais * 60)}<span className="lowercase">min</span></> 
                          : <>{horasTotais.toFixed(1)}<span className="lowercase">h</span></>
                        })</>,
                        valor: calculo.custoDepreciacao
                      }];
                    }

                    return (
                      <motion.div 
                        key={item.label}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex flex-col group border-b border-borda-sutil/20 pb-2 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-muted/40 dark:bg-white/5 flex items-center justify-center text-muted-foreground group-hover:bg-muted dark:group-hover:bg-white/10 transition-colors shadow-inner">
                              <item.icone size={14} className={item.cor} />
                            </div>
                            <span className="text-xs font-black uppercase text-muted-foreground tracking-wider">{item.label}</span>
                          </div>
                          <span className="text-sm font-black text-primary">
                            <ContadorAnimado valor={item.valor / 100} />
                          </span>
                        </div>

                        {/* Detalhamento dos subitens */}
                        {subitens.length > 0 && (
                          <div className="pl-11 mt-2 space-y-1">
                            {subitens.map((sub, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[9px] text-muted-foreground font-black uppercase">
                                <span className="opacity-80">• {sub.nome}</span>
                                <span className="opacity-80 tabular-nums">
                                  <ContadorAnimado valor={sub.valor / 100} />
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                </div>
              )}
            </div>
          );
        })()}
        
        {aba === 'metricas' && (
          <div className="space-y-6 w-full text-left animate-in fade-in slide-in-from-left-4 duration-500 min-h-[160px] flex flex-col justify-center">
            {dadosPizza.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <PieChart size={24} className="opacity-40 text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Gráfico Vazio</span>
                <span className="text-[9px] font-bold text-muted-foreground text-center uppercase tracking-wider">Nenhum custo registrado para análise</span>
              </div>
            ) : (
              <>
                {/* FEATURE 5: Gráfico de Pizza */}
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <RePieChart>
                      <Pie
                        data={dadosPizza}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dadosPizza.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `R$ ${(value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-card)', 
                          border: '1px solid var(--border-subtle)', 
                          borderRadius: '12px', 
                          fontSize: '10px', 
                          fontWeight: '900', 
                          textTransform: 'uppercase',
                          boxShadow: 'var(--sombra-media)'
                        }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                <div className="max-h-[180px] overflow-y-auto pr-2 scrollbar-fino grid grid-cols-2 gap-y-3 gap-x-4 px-1">
                  {dadosPizza.map((d) => (
                    <div key={d.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }}></div>
                        <span className="text-[10px] font-black uppercase text-muted-foreground">{d.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-muted-foreground dark:text-zinc-300">
                        <ContadorAnimado valor={(d.value / calculo.precoSugerido * 100)} prefixo="" sufixo="%" casasDecimais={0} />
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="h-px bg-borda-sutil/50 my-4 w-full" />

        <div className={`flex items-center justify-between p-4 rounded-2xl border w-full transition-all duration-500 ${cl.bg} ${cl.border} ${cl.shadow}`}>
          <div className="flex flex-col items-start flex-1">
            <div className={`flex items-center gap-2 mb-2 transition-colors duration-500 ${cl.textPrimary}`}>
              <div className={`p-1.5 rounded-lg transition-colors duration-500 ${cl.iconBg}`}>
                <cl.icone size={16} className="transition-transform duration-500 animate-in zoom-in-50" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Lucro Líquido</span>
            </div>
            
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Rentabilidade:</span>
                <span className={`text-[10px] font-black transition-colors duration-500 ${cl.textSecondary}`}>
                  <ContadorAnimado valor={calculo.custoTotalOperacional > 0 ? (calculo.lucroLiquido / calculo.custoTotalOperacional) * 100 : 0} prefixo="" sufixo="%" casasDecimais={1} />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Margem Real:</span>
                <span className={`text-[10px] font-black transition-colors duration-500 ${cl.textSecondary}`}>
                  <ContadorAnimado valor={calculo.margemReal} prefixo="" sufixo="%" casasDecimais={1} />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Custo de Fabricação:</span>
                <span className="text-[10px] font-black text-muted-foreground">
                  <ContadorAnimado valor={calculo.custoTotalOperacional / 100} />
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center flex-1 border-l border-borda-sutil/50">
            <span className={`text-3xl font-black block tracking-tighter leading-none transition-colors duration-500 ${cl.textPrimary}`}>
              <ContadorAnimado valor={calculo.lucroLiquido / 100} />
            </span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 block">Saldo Livre</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 w-full">
          <button 
            onClick={salvarProjeto}
            className="flex-1 h-12 font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2 bg-sky-500 text-white hover:bg-sky-400 hover:shadow-sky-500/30 transition-all active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(14,165,233,0.4)] disabled:opacity-30 disabled:pointer-events-none"
            disabled={calculo.precoSugerido <= 0}
            title="Salvar Projeto"
          >
            <FolderKanban size={18} />
            <span>Salvar Projeto</span>
          </button>

          <div className="relative flex-1" ref={menuRef}>
            <button 
              onClick={() => setMenuExportarAberto(!menuExportarAberto)}
              className="w-full h-12 font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2 bg-muted/40 dark:bg-zinc-800 hover:bg-muted/80 dark:hover:bg-zinc-700/80 hover:text-primary dark:hover:text-white text-muted-foreground dark:text-zinc-300 border border-borda-sutil transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none" 
              disabled={calculo.precoSugerido <= 0}
              title="Opções de Exportação"
            >
              {carregandoPdf ? <Activity className="animate-spin" size={18} /> : <Download size={18} />}
              <span>Exportar</span>
            </button>
            
            <AnimatePresence>
              {menuExportarAberto && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-2 right-0 w-[220px] bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-borda-sutil overflow-hidden z-50 origin-bottom-right"
                >
                  <div className="flex flex-col">
                    <button 
                      onClick={() => {
                        setMenuExportarAberto(false);
                        gerarPdf();
                      }}
                      disabled={carregandoPdf}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                        {carregandoPdf ? <Activity className="animate-spin" size={14} /> : <FileText size={14} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200">Exportar PDF</span>
                        <span className="text-[8px] text-zinc-500">Baixar arquivo local</span>
                      </div>
                    </button>
                    
                    <div className="h-px bg-borda-sutil mx-2" />

                    <button 
                      onClick={() => compartilharWhatsApp(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <MessageCircle size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200">WhatsApp (PDF)</span>
                        <span className="text-[8px] text-zinc-500">Enviar com anexo</span>
                      </div>
                    </button>

                    {gerarLinkMagico && (
                      <>
                        <div className="h-px bg-borda-sutil mx-2" />
                        <button 
                          onClick={() => compartilharWhatsApp(true)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                            <MessageCircle size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200">WhatsApp (Link)</span>
                            <span className="text-[8px] text-zinc-500">Enviar para assinatura</span>
                          </div>
                        </button>
                        
                        <div className="h-px bg-borda-sutil mx-2" />
                        
                        <button 
                          onClick={() => {
                            setMenuExportarAberto(false);
                            gerarLinkMagico();
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                            <LinkIcon size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200">Link Mágico</span>
                            <span className="text-[8px] text-zinc-500">Copiar link de assinatura</span>
                          </div>
                        </button>

                        {abrirModalEmail && (
                          <>
                            <div className="h-px bg-borda-sutil mx-2" />
                            <button 
                              onClick={() => {
                                setMenuExportarAberto(false);
                                abrirModalEmail();
                              }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                <Mail size={14} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200">E-mail</span>
                                <span className="text-[8px] text-zinc-500">Enviar orçamento por e-mail</span>
                              </div>
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      <p className="text-[9px] text-zinc-500 dark:text-zinc-400/60 mt-4 leading-normal select-none text-center">
        Estimativa baseada em parâmetros manuais. O PrintLog não se responsabiliza por prejuízos ou variações de mercado.
      </p>
      </div>
    </div>
  );
});
