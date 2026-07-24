import { Box, Zap, Timer, Activity, DollarSign, ShieldCheck, FolderKanban, Download, Sparkles, MessageCircle, AlertTriangle, PenTool, TrendingDown, TrendingUp, Rocket, Crown, Ban, Link as LinkIcon, FileText, Package, Mail } from "lucide-react";
import { gerarMensagemWhatsApp, abrirWhatsAppComMensagem } from "../utilitarios/formatadorWhatsApp";
import { motion, AnimatePresence } from "framer-motion";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { CalculoResultado, MaterialSelecionado, InsumoSelecionado, ItemPosProcesso } from "../tipos";
import { memo, useState, useRef, useEffect } from "react";
import { ContadorAnimado } from "@/compartilhado/componentes/ui";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";


interface PainelResultadosProps {
  calculo: CalculoResultado;
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
  explicacaoIA?: string;
}

export const PainelResultados = memo(function PainelResultados({
  calculo, salvarProjeto, gerarPdf, gerarLinkMagico, abrirModalEmail, obterUrlLinkMagico, carregandoPdf,
  materiais = [], insumos = [], posProcesso = [], quantidade = 1, insumosFixos = 0,
  tempo = 0, modoEntrada = 'projeto', frete = 0, aoSugerirPrecoIA,
  explicacaoIA = ""
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
    
    const urlMagica = obterUrlLinkMagico ? obterUrlLinkMagico() : undefined;
    const mensagem = gerarMensagemWhatsApp({
      precoSugeridoCentavos: calculo.precoSugerido,
      incluirLink,
      urlLinkMagico: urlMagica || undefined,
      nomeEstudio: "Meu Estúdio 3D"
    });

    if (!incluirLink) {
      gerarPdf();
    }

    abrirWhatsAppComMensagem(mensagem);
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
    <div className="pt-4 pb-5 px-5 rounded-2xl bg-card border border-borda-sutil shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] flex flex-col items-center text-center overflow-y-auto xl:overflow-y-auto relative h-fit max-h-[740px] xl:max-h-[740px] w-full mx-auto animate-in fade-in duration-1000 backdrop-blur-3xl">
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-sky-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full flex flex-col flex-1 min-h-0">
        
        {/* CONSOLE UNIFICADO DE PREÇO E DESEMPENHO (FLAT & INTEGRADO) */}
        <div className="w-full flex flex-col gap-4.5 mb-5 text-center relative select-none">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Preço Sugerido
            </span>
            {(usuario?.plano === 'PRO' || usuario?.plano === 'FUNDADOR') && (
              <button 
                onClick={aoSugerirPrecoIA}
                title="Otimizar Preço com IA"
                className="flex items-center gap-1.5 text-[9px] font-black text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors uppercase tracking-wider group/ia"
              >
                <span>Otimizar IA</span>
                <Sparkles size={11} className="fill-sky-500/5 group-hover/ia:fill-sky-500/20" />
              </button>
            )}
          </div>

          <div className="my-0.5 flex flex-col items-center">
            <h2 className="text-5xl font-black tracking-tight leading-none text-center relative">
              <ContadorAnimado 
                valor={calculo.precoSugerido / 100} 
                className="inline-block bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300 from-sky-500 via-blue-500 to-indigo-500 dark:from-sky-400 dark:to-indigo-400"
              />
            </h2>

            {(() => {
              const pesoAcumulado = materiais.reduce((acc, m) => acc + (modoEntrada === 'lote' ? m.quantidade : m.quantidade * Math.max(1, quantidade)), 0);
              const tempoCalculado = modoEntrada === 'lote' ? tempo : tempo * Math.max(1, quantidade);
              const h = Math.floor(tempoCalculado / 60);
              const m = Math.round(tempoCalculado % 60);
              const tempoStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
              
              const precoPorGrama = pesoAcumulado > 0 ? (calculo.precoSugerido / pesoAcumulado) : 0;
              const tempoHoras = tempoCalculado / 60;
              const precoPorHora = tempoHoras > 0 ? (calculo.precoSugerido / tempoHoras) : 0;
              
              return (pesoAcumulado > 0 || tempoCalculado > 0) ? (
                <div className="flex flex-col items-center gap-2 mt-2 w-full">
                  <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    {pesoAcumulado > 0 && <span>{pesoAcumulado.toFixed(1)}g total</span>}
                    {pesoAcumulado > 0 && tempoCalculado > 0 && <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />}
                    {tempoCalculado > 0 && <span>{tempoStr}</span>}
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 text-[8.5px] font-black text-sky-500 dark:text-sky-400/90 uppercase tracking-widest bg-sky-500/10 dark:bg-sky-500/10 px-3 py-1.5 rounded-full border border-sky-500/20">
                    {pesoAcumulado > 0 && <span>R$ {(precoPorGrama / 100).toFixed(2)}/g</span>}
                    {pesoAcumulado > 0 && tempoCalculado > 0 && <span className="w-1 h-1 rounded-full bg-sky-500/30" />}
                    {tempoCalculado > 0 && <span>R$ {(precoPorHora / 100).toFixed(2)}/h</span>}
                  </div>

                  {calculo.lucroLiquido <= 100 ? (
                    <div className="mt-1 flex items-center justify-center gap-1.5 text-[8.5px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 animate-pulse w-full">
                      <AlertTriangle size={11} className="shrink-0" />
                      <span>Prejuízo ou Margem Nula!</span>
                    </div>
                  ) : calculo.margemReal < 15 ? (
                    <div className="mt-1 flex items-center justify-center gap-1.5 text-[8.5px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20 w-full">
                      <AlertTriangle size={11} className="shrink-0" />
                      <span>Margem de Risco Detectada!</span>
                    </div>
                  ) : null}
                </div>
              ) : null;
            })()}
          </div>

          <div className="h-px bg-zinc-200/50 dark:bg-zinc-800/40 w-full" />

          {/* Grid de Métricas e Configurações Sem Card (Flat) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4.5 w-full text-left px-1 relative">
            <div className="absolute top-2 bottom-2 left-1/2 w-px bg-zinc-200/40 dark:bg-zinc-800/20 -translate-x-1/2" />
            
            {/* Lucro Líquido */}
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Lucro Líquido</span>
              <span className={`text-2xl font-black tracking-tight leading-none mt-1 block ${cl.textPrimary}`}>
                <ContadorAnimado valor={calculo.lucroLiquido / 100} />
              </span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500/80 uppercase font-black tracking-wider mt-1 block">
                Rentab.: {calculo.custoTotalOperacional > 0 ? ((calculo.lucroLiquido / calculo.custoTotalOperacional) * 100).toFixed(0) : 0}%
              </span>
            </div>

            {/* Margem Real */}
            <div className="flex flex-col items-start pl-2">
              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Margem Real</span>
              <span className={`text-2xl font-black tracking-tight leading-none mt-1 block ${cl.textSecondary}`}>
                <ContadorAnimado valor={calculo.margemReal} prefixo="" sufixo="%" casasDecimais={1} />
              </span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500/80 uppercase font-black tracking-wider mt-1 block">
                Fabricação: <ContadorAnimado valor={calculo.custoTotalOperacional / 100} />
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-200/50 dark:bg-zinc-800/40 w-full mb-4" />

        {(() => {
          const itens = [
            { label: 'Materiais', valor: calculo.custoMaterial, icone: Box, cor: 'text-sky-400' },
            { label: 'Modelagem 3D', valor: calculo.custoModelagem || 0, icone: PenTool, cor: 'text-rose-400' },
            { label: 'Perdas & Falhas', valor: calculo.custoFalha || 0, icone: AlertTriangle, cor: 'text-rose-500' },
            { label: 'Insumos & Extras', valor: calculo.custoInsumos + calculo.custoPosProcesso, icone: Package, cor: 'text-indigo-400' },
            { label: 'Energia Elétrica', valor: calculo.custoEnergia, icone: Zap, cor: 'text-amber-400' },
            { label: 'Custos Adicionais', valor: calculo.custoAdicionalTotal, icone: Timer, cor: 'text-emerald-400' },
            { label: 'Depreciação', valor: calculo.custoDepreciacao, icone: Activity, cor: 'text-zinc-400' },
            { label: 'Comissão Marketplace', valor: calculo.taxaComissao ?? 0, icone: DollarSign, cor: 'text-violet-400' },
            { label: 'Taxa Fixa Plataforma', valor: calculo.taxaFixaVenda ?? 0, icone: DollarSign, cor: 'text-purple-400' },
            { label: 'Frete e Envio', valor: calculo.custoFrete ?? (modoEntrada === 'lote' ? frete : frete * quantidade), icone: Package, cor: 'text-orange-400' },
          ].filter(i => i.valor !== 0);

          const estaVazio = itens.length === 0;

          return (
            <div className={`space-y-4 w-full text-left relative animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col flex-1 min-h-0 overflow-hidden ${estaVazio ? 'justify-center' : 'justify-start'}`}>
              {estaVazio ? (
                <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 w-full py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-2.5">
                    <Sparkles size={14} className="text-sky-500 dark:text-sky-400 animate-pulse" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 text-center">Aguardando dados</span>
                  <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 text-center tracking-wider uppercase mt-1">Insira pesos e tempos nos cards ao lado</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-fino space-y-4 min-h-0">
                  <AnimatePresence>
                  {itens.map((item) => {
                    // Calcular subitens
                    let subitens: { nome: React.ReactNode; valor: number }[] = [];
                    
                    if (item.label === 'Materiais' && materiais.length > 0) {
                      const agrupadosMap = new Map<string, {
                        corHex: string;
                        peso: number;
                        custo: number;
                      }>();
                      
                      materiais.forEach(m => {
                        const chave = `${m.tipo} - ${m.nomePeca || m.nome}`;
                        const atual = agrupadosMap.get(chave) || { corHex: '#fff', peso: 0, custo: 0 };
                        agrupadosMap.set(chave, {
                          corHex: '#fff',
                          peso: atual.peso + m.quantidade,
                          custo: atual.custo + (m.quantidade * m.precoKgCentavos) / 1000
                        });
                      });
                      
                      agrupadosMap.forEach((dados, chave) => {
                        subitens.push({
                          nome: (
                            <span className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-stone-400 text-[9px] uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dados.corHex }} />
                              {chave} <span className="font-medium text-stone-400">({dados.peso}g)</span>
                            </span>
                          ),
                          valor: dados.custo
                        });
                      });
                    }
                    
                    if (item.label === 'Insumos & Extras' && insumos.length > 0) {
                      insumos.forEach(i => {
                        subitens.push({
                          nome: <span className="text-[9px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">{i.nome} <span className="font-medium text-stone-400">({i.quantidade}x)</span></span>,
                          valor: i.custoCentavos
                        });
                      });
                    }
                    
                    if (item.label === 'Insumos & Extras' && posProcesso.length > 0) {
                      posProcesso.forEach(p => {
                        subitens.push({
                          nome: <span className="text-[9px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">{p.nome}</span>,
                          valor: p.custoMaterialCentavos
                        });
                      });
                    }
                    
                    if (item.label === 'Insumos & Extras' && insumosFixos > 0) {
                      subitens.push({
                        nome: <span className="text-[9px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Custos Fixos / Adicionais</span>,
                        valor: insumosFixos
                      });
                    }

                    return (
                      <motion.div 
                        key={item.label}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-borda-sutil relative overflow-hidden flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-center z-10">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/40 ${item.cor} shrink-0`}>
                              <item.icone size={12} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-wider">{item.label}</span>
                          </div>
                          <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 tracking-tight">
                            R$ {centavosParaReais(item.valor)}
                          </span>
                        </div>
                        
                        {subitens.length > 0 && (
                          <div className="pl-9 pr-1 py-1.5 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col gap-1.5 z-10">
                            {subitens.map((sub, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                {sub.nome}
                                <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                                  R$ {centavosParaReais(sub.valor)}
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



        {explicacaoIA && (
          <div className="w-full text-left p-3.5 rounded-2xl bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/20 shadow-sm mt-4 mb-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-1.5">
              <Sparkles size={14} className="fill-violet-500/10" />
              <span className="text-[10px] font-black uppercase tracking-widest">Justificativa da IA</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground dark:text-zinc-300 font-medium">
              {explicacaoIA}
            </p>
          </div>
        )}

        {/* Botões de Ação Principais */}
        <div className="flex items-center gap-3 mt-auto pt-4 w-full">
          <button 
            onClick={salvarProjeto}
            className="flex-1 h-11 font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white hover:shadow-md hover:shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none"
            disabled={calculo.precoSugerido <= 0}
            title="Salvar Projeto"
          >
            <FolderKanban size={15} />
            <span>Salvar Projeto</span>
          </button>

          <div className="relative flex-1" ref={menuRef}>
            <button 
              onClick={() => setMenuExportarAberto(!menuExportarAberto)}
              className="w-full h-11 font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 hover:text-primary dark:hover:text-white text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm" 
              disabled={calculo.precoSugerido <= 0}
              title="Opções de Exportação"
            >
              {carregandoPdf ? <Activity className="animate-spin" size={15} /> : <Download size={15} />}
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
        Estimativa baseada em parâmetros manuais.
      </p>
      </div>
    </div>
  );
});
