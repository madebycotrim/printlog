import { Box, Zap, Timer, Activity, Package, DollarSign, PieChart, ShieldCheck, FolderKanban, Download, Sparkles, MessageCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { CalculoResultado, MaterialSelecionado, InsumoSelecionado, ItemPosProcesso } from "../tipos";
import { memo } from "react";
import { ContadorAnimado } from "@/componentes/ui";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { usarBeta } from "@/compartilhado/contextos/ContextoBeta";
import { usarEstudio } from "@/funcionalidades/beta/multi_estudos/contextos/ContextoEstudio";

interface PainelResultadosProps {
  calculo: CalculoResultado;
  dadosPizza: any[];
  aba: 'orcamento' | 'metricas';
  setAba: (v: 'orcamento' | 'metricas') => void;
  salvarProjeto: () => void;
  gerarPdf: () => void;
  carregandoPdf: boolean;
  materiais?: MaterialSelecionado[];
  insumos?: InsumoSelecionado[];
  posProcesso?: ItemPosProcesso[];
  quantidade?: number;
  insumosFixos?: number;
  tempo?: number;
  modoEntrada?: 'unitario' | 'lote';
  frete?: number;
  taxaFixa?: number;
}

export const PainelResultados = memo(function PainelResultados({
  calculo, dadosPizza, aba, setAba, salvarProjeto, gerarPdf, carregandoPdf,
  materiais = [], insumos = [], posProcesso = [], quantidade = 1, insumosFixos = 0,
  tempo = 0, modoEntrada = 'unitario', frete = 0, taxaFixa = 0
}: PainelResultadosProps) {
  const { usuario } = usarAutenticacao();
  const { betaOrcamentosMagicos, templateOrcamento } = usarBeta();
  const { estudioAtivo } = usarEstudio();

  const compartilharWhatsApp = () => {
    const nomeEstudio = estudioAtivo?.nome || "Meu Estúdio 3D";
    const valorFormatado = centavosParaReais(calculo.precoSugerido);
    
    const baseTemplate = templateOrcamento || "Olá, tudo bem? 👋\n\nAqui está o orçamento do seu projeto:\n\n*Serviço:* Impressão 3D de Alta Qualidade 🖨️\n*Estúdio:* {estudio}\n*Investimento:* {valor}\n\n_Prazo de produção e entrega sob consulta._\n\nFico à disposição para fecharmos! 🚀";
    
    const mensagem = baseTemplate
      .replace(/{estudio}/g, nomeEstudio)
      .replace(/{valor}/g, valorFormatado);

    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };



  return (
    <div className="pt-4 pb-6 px-6 rounded-2xl bg-card border border-borda-sutil shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] flex flex-col items-center text-center overflow-hidden relative h-fit w-full mx-auto animate-in fade-in duration-1000 backdrop-blur-3xl">
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="relative z-10 w-full">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-600 dark:text-sky-400">Preço Sugerido</span>
          {(usuario?.plano === 'PRO' || usuario?.plano === 'FUNDADOR') && (
            <div className="p-1.5 rounded-lg text-sky-400 animate-pulse">
              <Sparkles size={14} className="fill-sky-400/20" />
            </div>
          )}
        </div>

        <div className="mt-2 mb-4">
          <h2 className="text-4xl font-black text-primary tracking-tighter leading-none mb-4 text-center">
            <ContadorAnimado valor={calculo.precoSugerido / 100} />
          </h2>
          <div className="flex flex-col gap-2 items-center">
            <div className="flex gap-2 justify-center">
              <div className={`
                px-2.5 py-1 rounded-full border backdrop-blur-md transition-all duration-500 flex items-center gap-1.5 shadow-lg
                ${calculo.margemReal >= 50 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10' 
                  : calculo.margemReal >= 20
                    ? 'bg-sky-500/10 border-sky-500/20 text-sky-400 shadow-sky-500/10'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-500/10'
                }
              `}>
                <div className={`w-1 h-1 rounded-full animate-pulse ${
                  calculo.margemReal >= 50 ? 'bg-emerald-400' : calculo.margemReal >= 20 ? 'bg-sky-400' : 'bg-rose-400'
                }`} />
                <span className="text-[9px] font-black uppercase tracking-wider leading-none">
                  Margem Real: <ContadorAnimado valor={calculo.margemReal} prefixo="" sufixo="%" casasDecimais={1} />
                </span>
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
            { label: 'Perdas & Falhas', valor: calculo.custoFalha || 0, icone: AlertTriangle, cor: 'text-rose-500' },
            { label: 'Insumos & Extras', valor: calculo.custoInsumos + calculo.custoPosProcesso, icone: Package, cor: 'text-indigo-400' },
            { label: 'Energia Elétrica', valor: calculo.custoEnergia, icone: Zap, cor: 'text-amber-400' },
            { label: 'Mão de Obra', valor: calculo.custoMaoDeObra, icone: Timer, cor: 'text-emerald-400' },
            { label: 'Depreciação', valor: calculo.custoDepreciacao, icone: Activity, cor: 'text-zinc-400' },
            { label: 'Taxas', valor: calculo.taxaMarketplace, icone: DollarSign, cor: 'text-violet-400' },
            { label: 'Frete e Logística', valor: (modoEntrada === 'lote' ? frete * 100 : frete * 100 * quantidade) + (taxaFixa * 100), icone: Package, cor: 'text-orange-400' },
          ].filter(i => i.valor > 0);

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
                      subitens = materiais.map(m => {
                        const unid = <span className="lowercase">{m.tipo === 'FDM' ? 'g' : 'ml'}</span>;
                        const pesoFinal = modoEntrada === 'lote' ? m.quantidade : m.quantidade * quantidade;
                        
                        return {
                          nome: <>{m.nome} ({modoEntrada === 'unitario' 
                            ? <>{m.quantidade}{unid} x {quantidade} = {pesoFinal}{unid}</>
                            : <>{pesoFinal}{unid}</>
                          })</>,
                          valor: Math.round((m.quantidade / 1000) * m.precoKgCentavos * (modoEntrada === 'lote' ? 1 : quantidade))
                        };
                      });
                    } else if (item.label === 'Insumos & Extras') {
                      const subInsumos = insumos.map(i => ({
                        nome: <>{i.nome} ({modoEntrada === 'lote' || i.porLote ? i.quantidade : i.quantidade * quantidade}<span className="lowercase">x</span>)</>,
                        valor: (modoEntrada === 'lote' || i.porLote) ? i.quantidade * i.custoCentavos : i.quantidade * i.custoCentavos * quantidade
                      }));
                      const subPos = posProcesso.map(p => ({
                        nome: modoEntrada === 'unitario' ? <>{p.nome} (<span className="lowercase">x</span>{quantidade})</> : p.nome,
                        valor: Math.round(p.valor * 100) * (modoEntrada === 'lote' ? 1 : quantidade)
                      }));
                      subitens = [...subInsumos, ...subPos];

                      if (insumosFixos && insumosFixos > 0) {
                        subitens.push({
                          nome: 'Insumos Fixos',
                          valor: Math.round(insumosFixos * 100)
                        });
                      }
                    } else if (item.label === 'Depreciação') {
                      const horasTotais = modoEntrada === 'lote' ? (tempo / 60) : (tempo / 60) * quantidade;
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
                  <ResponsiveContainer width="100%" height="100%">
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

        <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/15 w-full shadow-[0_8px_30px_-10px_rgba(16,185,129,0.15)]">
          <div className="flex flex-col items-start flex-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <ShieldCheck size={16} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Lucro Líquido</span>
            </div>
            
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Rentabilidade:</span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/80">
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
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-500 block tracking-tighter leading-none">
              <ContadorAnimado valor={calculo.lucroLiquido / 100} />
            </span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 block">Saldo Livre</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 w-full">
          <button 
            onClick={salvarProjeto}
            className="h-11 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 bg-sky-500 text-white hover:bg-sky-400 hover:shadow-sky-500/30 transition-all active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(14,165,233,0.4)] disabled:opacity-30 disabled:pointer-events-none"
            disabled={calculo.precoSugerido <= 0}
          >
            <FolderKanban size={14} />
            Salvar Projeto
          </button>

          <button 
            onClick={gerarPdf} 
            className="h-11 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 bg-muted/40 dark:bg-zinc-800 hover:bg-muted/80 dark:hover:bg-zinc-700/80 hover:text-primary dark:hover:text-white text-muted-foreground dark:text-zinc-300 border border-borda-sutil transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none" 
            disabled={calculo.precoSugerido <= 0 || carregandoPdf}
          >
            {carregandoPdf ? <Activity className="animate-spin" size={14} /> : <Download size={14} />}
            {carregandoPdf ? "PDF..." : "Gerar PDF"}
          </button>
        </div>

        {betaOrcamentosMagicos && (
          <div className="mt-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
             <button 
               onClick={compartilharWhatsApp}
               disabled={calculo.precoSugerido <= 0}
               className="w-full h-12 font-black uppercase tracking-[0.1em] text-[11px] rounded-2xl flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20BE5A] transition-all active:scale-95 shadow-[0_10px_20px_-5px_rgba(37,211,102,0.3)] disabled:opacity-50 disabled:shadow-none"
             >
               <MessageCircle size={16} />
               Enviar Orçamento no WhatsApp (Beta)
             </button>
          </div>
        )}
      </div>
    </div>
  );
});
