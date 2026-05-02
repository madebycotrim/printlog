import { Box, Zap, Timer, Activity, Package, DollarSign, PieChart, ShieldCheck, FolderKanban, Download, Sparkles, BrainCircuit, Crown, MessageCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { CalculoResultado, MaterialSelecionado, InsumoSelecionado, ItemPosProcesso } from "../tipos";
import { servicoIA, SugestaoPrecoIA } from "../servicos/servicoIA";
import { useState, memo } from "react";
import { ContadorAnimado } from "@/componentes/ui";
import { toast } from "react-hot-toast";
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
}

export const PainelResultados = memo(function PainelResultados({
  calculo, dadosPizza, aba, setAba, salvarProjeto, gerarPdf, carregandoPdf,
  materiais = [], insumos = [], posProcesso = [], quantidade = 1, insumosFixos = 0,
  tempo = 0, modoEntrada = 'unitario'
}: PainelResultadosProps) {
  const { usuario } = usarAutenticacao();
  const { betaOrcamentosMagicos, templateOrcamento } = usarBeta();
  const { estudioAtivo } = usarEstudio();
  const [sugestaoIA, setSugestaoIA] = useState<SugestaoPrecoIA | null>(null);
  const [carregandoIA, setCarregandoIA] = useState(false);

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

  const obterSugestaoIA = async () => {
    // Bloqueio de Plano PRO / FUNDADOR
    const temPermissaoIA = usuario?.plano === 'PRO' || usuario?.plano === 'FUNDADOR';
    
    if (!temPermissaoIA) {
      toast.error("Recurso exclusivo do Plano PRO ou Fundador 👑", {
        icon: '🔒',
        duration: 4000
      });
      return;
    }

    try {
      setCarregandoIA(true);
      const pesoTotalGramas = materiais.reduce((acc, m) => acc + (m.quantidade || 0), 0) * quantidade;

      const resultado = await servicoIA.obterSugestaoPreco({
        nomePeca: "Impressão 3D", 
        pesoGramas: pesoTotalGramas, 
        tempoMinutos: 0, 
        custoMaterial: calculo.custoMaterial / 100,
        custoEnergia: calculo.custoEnergia / 100,
        custoTrabalho: calculo.custoMaoDeObra / 100,
        custoDepreciacao: calculo.custoDepreciacao / 100,
        lucroDesejadoPercentual: 100 
      });
      setSugestaoIA(resultado);
      toast.success("Sugestão gerada pela IA!");
    } catch (erro) {
      toast.error("Erro ao consultar a IA.");
    } finally {
      setCarregandoIA(false);
    }
  };

  const temPermissaoIA = usuario?.plano === 'PRO' || usuario?.plano === 'FUNDADOR';

  return (
    <div className="pt-4 pb-6 px-6 rounded-2xl bg-zinc-900/70 border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden relative h-fit w-full mx-auto animate-in fade-in duration-1000 backdrop-blur-3xl">
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      <div className="relative z-10 w-full">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-400 opacity-60">Preço Sugerido</span>
          <button 
            onClick={obterSugestaoIA}
            disabled={carregandoIA || calculo.precoSugerido <= 0}
            title={temPermissaoIA ? "Sugerir com IA" : "Exclusivo PRO / Fundador"}
            className={`p-1.5 rounded-lg transition-all relative ${
              carregandoIA ? "text-violet-400 animate-pulse" : "text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10"
            }`}
          >
            <Sparkles size={14} />
            {!temPermissaoIA && (
                <div className="absolute -top-1 -right-1">
                    <Crown size={8} className="text-sky-400 fill-sky-400" />
                </div>
            )}
          </button>
        </div>

        <div className="mt-2 mb-4">
          <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-4 text-center">
            <ContadorAnimado valor={calculo.precoSugerido / 100} />
          </h2>
          
          {/* Resultados da IA compactos - Só aparecem se houver sugestão */}
          <AnimatePresence>
            {sugestaoIA && (() => {
              const precoBase = calculo.precoSugerido / 100;

              let piso = sugestaoIA.piso.valor;
              let recomendado = sugestaoIA.recomendado.valor;
              let premium = sugestaoIA.premium.valor;

              // Protocolo de Segurança: Se a IA delirar (valores acima de 3x o preço calculado do app)
              if (piso > precoBase * 3 || piso <= 0) {
                piso = precoBase * 1.35;
                recomendado = precoBase * 1.70;
                premium = precoBase * 2.20;
              }

              return (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="my-4 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 text-left relative group/ia"
                >
                  <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-violet-400/60">
                          <BrainCircuit size={12} />
                          <span className="text-[9px] font-black uppercase tracking-widest">IA Insight</span>
                      </div>
                      <button onClick={() => setSugestaoIA(null)} className="text-[8px] font-black text-zinc-700 hover:text-zinc-500 uppercase">Ocultar</button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                      {[
                          { label: 'Piso', valor: piso, cor: 'rose' },
                          { label: 'Ideal', valor: recomendado, cor: 'sky' },
                          { label: 'Premium', valor: premium, cor: 'emerald' }
                      ].map(f => (
                          <div key={f.label} className="flex flex-col">
                              <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">{f.label}</span>
                              <span className="text-[10px] font-black text-zinc-300">
                                <ContadorAnimado valor={f.valor} />
                              </span>
                          </div>
                      ))}
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
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
        
        <div className="flex bg-white/5 p-1 rounded-2xl mb-4 w-full shadow-inner">
          <button onClick={() => setAba('orcamento')} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${aba === 'orcamento' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Orçamento</button>
          <button onClick={() => setAba('metricas')} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 ${aba === 'metricas' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Métricas 360 <PieChart size={12} /></button>
        </div>
        
        {aba === 'orcamento' && (() => {
          const itens = [
            { label: 'Materiais', valor: calculo.custoMaterial, icone: Box, cor: 'text-sky-400' },
            { label: 'Perdas & Falhas', valor: calculo.custoFalha || 0, icone: AlertTriangle, cor: 'text-rose-500' },
            { label: 'Insumos & Extras', valor: calculo.custoInsumos + calculo.custoPosProcesso, icone: Package, cor: 'text-indigo-400' },
            { label: 'Energia Elétrica', valor: calculo.custoEnergia, icone: Zap, cor: 'text-amber-400' },
            { label: 'Mão de Obra', valor: calculo.custoMaoDeObra, icone: Timer, cor: 'text-emerald-400' },
            { label: 'Depreciação', valor: calculo.custoDepreciacao, icone: Activity, cor: 'text-zinc-400' },
            { label: 'Taxas & Impostos', valor: calculo.taxaMarketplace + calculo.impostoVenda, icone: DollarSign, cor: 'text-violet-400' },
          ].filter(i => i.valor > 0);

          const estaVazio = itens.length === 0;

          return (
            <div className={`space-y-4 w-full text-left relative animate-in fade-in slide-in-from-right-4 duration-500 min-h-[160px] flex flex-col ${estaVazio ? 'justify-center' : 'justify-start'}`}>
              {estaVazio ? (
                <div className="flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-500 w-full py-8">
                  <Sparkles size={24} className="opacity-40 text-sky-400 animate-pulse mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500/60 dark:text-zinc-500/40 text-center">Aguardando dados</span>
                  <span className="text-[9px] font-bold text-zinc-500/40 text-center tracking-tight uppercase">Insira pesos e tempos nos cards ao lado</span>
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto pr-1 scrollbar-fino space-y-4">
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
                        className="flex flex-col group border-b border-white/[0.02] pb-2 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-white/10 transition-colors shadow-inner">
                              <item.icone size={14} className={item.cor} />
                            </div>
                            <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">{item.label}</span>
                          </div>
                          <span className="text-sm font-black text-white">
                            <ContadorAnimado valor={item.valor / 100} />
                          </span>
                        </div>

                        {/* Detalhamento dos subitens */}
                        {subitens.length > 0 && (
                          <div className="pl-11 mt-2 space-y-1">
                            {subitens.map((sub, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[9px] text-zinc-500 font-black uppercase">
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
              <div className="flex flex-col items-center justify-center text-zinc-600 dark:text-zinc-500">
                <PieChart size={24} className="opacity-40 text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Gráfico Vazio</span>
                <span className="text-[9px] font-bold text-zinc-600 text-center uppercase tracking-wider">Nenhum custo registrado para análise</span>
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
                        contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 px-1">
                  {dadosPizza.map((d) => (
                    <div key={d.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }}></div>
                        <span className="text-[10px] font-black uppercase text-zinc-400">{d.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-zinc-300">
                        <ContadorAnimado valor={(d.value / calculo.precoSugerido * 100)} prefixo="" sufixo="%" casasDecimais={0} />
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="h-px bg-zinc-800/50 my-4 w-full" />

        <div className="flex items-center justify-between p-4 bg-emerald-950/20 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/15 w-full shadow-[0_8px_30px_-10px_rgba(16,185,129,0.15)]">
          <div className="flex flex-col items-start flex-1">
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <ShieldCheck size={16} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Lucro Líquido</span>
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Rentabilidade:</span>
                <span className="text-[10px] font-black text-emerald-500/80">
                  <ContadorAnimado valor={calculo.margemReal} prefixo="" sufixo="%" casasDecimais={1} />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Custo de Fabricação:</span>
                <span className="text-[10px] font-black text-zinc-400">
                  <ContadorAnimado valor={calculo.custoTotalOperacional / 100} />
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center flex-1 border-l border-white/5">
            <span className="text-3xl font-black text-emerald-500 block tracking-tighter leading-none">
              <ContadorAnimado valor={calculo.lucroLiquido / 100} />
            </span>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1 block">Saldo Livre</span>
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
            className="h-11 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700/80 hover:text-white text-zinc-300 border border-white/5 transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none" 
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
