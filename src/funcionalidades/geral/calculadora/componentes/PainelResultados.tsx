import { Box, Zap, Timer, Activity, Package, DollarSign, PieChart, ShieldCheck, FolderKanban, Download, Sparkles, BrainCircuit, Crown, MessageCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { CalculoResultado } from "../tipos";
import { servicoIA, SugestaoPrecoIA } from "../servicos/servicoIA";
import { useState } from "react";
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
  temImpressora: boolean;
}

export function PainelResultados({
  calculo, dadosPizza, aba, setAba, salvarProjeto, gerarPdf, carregandoPdf, temImpressora
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
      const resultado = await servicoIA.obterSugestaoPreco({
        nomePeca: "Impressão 3D", // Poderia vir de um campo de nome
        pesoGramas: 0, // Poderia vir do hook
        tempoMinutos: 0, // Poderia vir do hook
        custoMaterial: calculo.custoMaterial,
        custoEnergia: calculo.custoEnergia,
        custoTrabalho: calculo.custoMaoDeObra,
        custoDepreciacao: calculo.custoDepreciacao,
        lucroDesejadoPercentual: 100 // Margem desejada padrão
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
    <div className="p-8 rounded-2xl bg-zinc-900 border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden relative h-fit w-full mx-auto animate-in fade-in duration-1000">
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

        <div className="mt-4 mb-6">
          <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-2">{centavosParaReais(calculo.precoSugerido)}</h2>
          
          {/* Resultados da IA compactos - Só aparecem se houver sugestão */}
          <AnimatePresence>
            {sugestaoIA && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 text-left relative group/ia"
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
                        { label: 'Piso', valor: sugestaoIA.piso.valor, cor: 'rose' },
                        { label: 'Ideal', valor: sugestaoIA.recomendado.valor, cor: 'sky' },
                        { label: 'Premium', valor: sugestaoIA.premium.valor, cor: 'emerald' }
                    ].map(f => (
                        <div key={f.label} className="flex flex-col">
                            <span className="text-[7px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">{f.label}</span>
                            <span className="text-[10px] font-black text-zinc-300">{centavosParaReais(f.valor * 100)}</span>
                        </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex flex-col gap-2 items-center">
            <div className="flex gap-2 justify-center">
              <div className={`
                px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 flex items-center gap-2 shadow-lg
                ${calculo.margemReal >= 50 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10' 
                  : calculo.margemReal >= 20
                    ? 'bg-sky-500/10 border-sky-500/20 text-sky-400 shadow-sky-500/10'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-500/10'
                }
              `}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  calculo.margemReal >= 50 ? 'bg-emerald-400' : calculo.margemReal >= 20 ? 'bg-sky-400' : 'bg-rose-400'
                }`} />
                <span className="text-xs font-black uppercase tracking-[0.15em] leading-none">
                  Margem Real: {calculo.margemReal.toFixed(1)}%
                </span>
              </div>
            </div>

          </div>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 w-full shadow-inner">
          <button onClick={() => setAba('orcamento')} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${aba === 'orcamento' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Orçamento</button>
          <button onClick={() => setAba('metricas')} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 ${aba === 'metricas' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>Métricas 360 <PieChart size={12} /></button>
        </div>
        
        {aba === 'orcamento' && (
          <div className="space-y-4 w-full text-left relative animate-in fade-in slide-in-from-right-4 duration-500">
            <AnimatePresence>
              {[
                { label: 'Materiais', valor: calculo.custoMaterial, icone: Box, cor: 'text-sky-400' },
                { label: 'Energia Elétrica', valor: calculo.custoEnergia, icone: Zap, cor: 'text-amber-400' },
                { label: 'Mão de Obra', valor: calculo.custoMaoDeObra, icone: Timer, cor: 'text-emerald-400' },
                { label: 'Depreciação', valor: calculo.custoDepreciacao, icone: Activity, cor: 'text-rose-400' },
                { label: 'Insumos & Extras', valor: calculo.custoInsumos + calculo.custoPosProcesso, icone: Package, cor: 'text-violet-400' },
                { label: 'Perdas & Falhas', valor: calculo.custoFalha || 0, icone: AlertTriangle, cor: 'text-amber-500 animate-pulse' },
                { label: 'Taxas & Impostos', valor: calculo.taxaMarketplace + calculo.impostoVenda, icone: DollarSign, cor: 'text-orange-400' },
              ].filter(i => i.valor > 0).map((item) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-white/10 transition-colors shadow-inner">
                      <item.icone size={14} className={item.cor} />
                    </div>
                    <span className="text-xs font-black uppercase text-zinc-500 tracking-wider">{item.label}</span>
                  </div>
                  <span className="text-xs font-black text-white">{centavosParaReais(item.valor)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {aba === 'metricas' && (
          <div className="space-y-6 w-full text-left animate-in fade-in slide-in-from-left-4 duration-500">
            {/* FEATURE 5: Gráfico de Pizza */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
                  <span className="text-[11px] font-black text-zinc-300">{(d.value / calculo.precoSugerido * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-px bg-zinc-800/50 my-8 w-full" />

        <div className="flex items-center justify-between p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 w-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-emerald-500 mb-1.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <ShieldCheck size={16} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Lucro Líquido Final</span>
            </div>
            <div className="flex flex-col ml-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Rentabilidade:</span>
                <span className="text-[11px] font-black text-emerald-500/80">{calculo.margemReal.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Custo de Fabr.:</span>
                <span className="text-[11px] font-black text-zinc-400">{centavosParaReais(calculo.custoTotalOperacional)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-emerald-500 block tracking-tighter leading-none">
              {centavosParaReais(calculo.lucroLiquido)}
            </span>
            <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mt-1 block">Saldo Livre</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full">
          <button 
            onClick={salvarProjeto}
            className="h-14 font-black uppercase tracking-[0.1em] text-xs rounded-2xl flex flex-col items-center justify-center gap-1 bg-sky-500 text-white hover:bg-sky-600 transition-all active:scale-95 shadow-[0_10px_20px_-5px_rgba(14,165,233,0.3)] disabled:opacity-20 disabled:shadow-none"
            disabled={calculo.precoSugerido <= 0}
          >
            <div className="flex items-center gap-2">
              <FolderKanban size={14} />
              <span>Salvar Projeto</span>
            </div>
            <span className="text-[10px] opacity-60">Enviar para o Kanban</span>
          </button>

          {/* FEATURE 1: Gerar PDF */}
          <button 
            onClick={gerarPdf} 
            className="h-14 font-black uppercase tracking-[0.1em] text-xs rounded-2xl flex flex-col items-center justify-center gap-1 bg-white dark:bg-zinc-800 text-black dark:text-white border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all active:scale-95 shadow-sm disabled:opacity-20" 
            disabled={!temImpressora || carregandoPdf}
          >
            <div className="flex items-center gap-2">
              {carregandoPdf ? <Activity className="animate-spin" size={14} /> : <Download size={14} strokeWidth={3} />}
              <span>{carregandoPdf ? "Processando..." : "Gerar Orçamento"}</span>
            </div>
            <span className="text-[10px] opacity-50 lowercase italic">PDF Profissional</span>
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
}
