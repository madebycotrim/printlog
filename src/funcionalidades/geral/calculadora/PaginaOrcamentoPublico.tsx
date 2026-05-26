import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { decodificarLinkMagico } from "@/compartilhado/utilitarios/link-magico";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { ArrowRight, ShieldCheck, CheckCircle2, ThumbsDown, Package, PieChart, CalendarDays, Receipt } from "lucide-react";
import { useArmazemNotificacoes } from "@/compartilhado/estado/armazemNotificacoes";
import { TipoNotificacao, CategoriaNotificacao } from "@/compartilhado/tipos/notificacoes";
import { motion, AnimatePresence } from "framer-motion";
import { useArmazemPedidos } from "@/funcionalidades/producao/projetos/estado/armazemPedidos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { useEffect } from "react";

export function PaginaOrcamentoPublico() {
  const [searchParams] = useSearchParams();
  const hash = searchParams.get("q");
  const isPrintMode = searchParams.get("p") === "1";

  const [statusAprovacao, setStatusAprovacao] = useState<'pendente' | 'aprovado' | 'recusado'>('pendente');

  const dados = useMemo(() => {
    if (!hash) return null;
    return decodificarLinkMagico(hash);
  }, [hash]);

  useEffect(() => {
    if (isPrintMode && dados) {
      // Forçar carregamento da fonte inserindo no head
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      document.fonts.ready.then(() => {
        setTimeout(() => {
          window.print();
        }, 1500); // Dar um tempo real para a rede baixar o arquivo .woff2
      });
    }
  }, [isPrintMode, dados]);

  if (!dados) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center flex flex-col items-center gap-4">
          <ShieldCheck size={48} className="text-slate-400" />
          <h1 className="text-xl font-black uppercase tracking-wider text-slate-800">Orçamento Inválido</h1>
          <p className="text-sm text-slate-500">Este link mágico parece estar quebrado ou incompleto. Solicite um novo link ao seu fornecedor.</p>
        </div>
      </div>
    );
  }

  const { pr, np, t, m, e, s, l, w, id, cli, obs, cm, cmo } = dados;
  const estudioNome = e || "Estúdio de Impressão 3D";
  const nomeClienteExibicao = cli || "Consumidor Final";
  const numeroProposta = id ? id.split('-')[0].toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString();

  const hoje = new Date();
  const validade = new Date(hoje);
  validade.setDate(hoje.getDate() + 7);

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(data);
  };

  const lidarComAprovacao = () => {
    setStatusAprovacao('aprovado');
    let linkBusca = "/producao";

    if (id) {
       // Se o projeto já existe, apenas atualiza para A_FAZER e notifica
       useArmazemPedidos.getState().atualizarPedidoNoEstado(id, { status: StatusPedido.A_FAZER });
       linkBusca = `/producao?busca=${id}`;
    } else {
       // Se era só um orçamento avulso (sem salvar), cria o pedido automaticamente no Kanban!
       const novoId = crypto.randomUUID();
       useArmazemPedidos.getState().adicionarPedido({
          id: novoId,
          idUsuario: "sistema",
          idCliente: "avulso",
          nomeCliente: cli || "Cliente do Orçamento",
          descricao: np || "Projeto Aprovado via Link",
          status: StatusPedido.A_FAZER,
          valorCentavos: pr || 0,
          dataCriacao: new Date(),
          tempoMinutos: t || 0,
          observacoes: obs || "Gerado automaticamente via Link Mágico aprovado.",
       });
       linkBusca = `/producao?busca=${novoId}`;
    }

    useArmazemNotificacoes.getState().adicionarNotificacao({
      titulo: `Orçamento Aprovado: ${np}`,
      mensagem: `O cliente ${nomeClienteExibicao} aprovou o orçamento de ${centavosParaReais(pr)}. O projeto já está no Kanban!`,
      tipo: TipoNotificacao.SUCESSO,
      categoria: CategoriaNotificacao.PEDIDOS,
      link: linkBusca
    });
  };

  const lidarComRecusa = () => {
    setStatusAprovacao('recusado');
    if (id) {
       useArmazemPedidos.getState().atualizarPedidoNoEstado(id, { status: StatusPedido.ARQUIVADO });
    }
    useArmazemNotificacoes.getState().adicionarNotificacao({
      titulo: `Orçamento Recusado: ${np}`,
      mensagem: `O cliente ${nomeClienteExibicao} recusou a proposta de ${centavosParaReais(pr)}.`,
      tipo: TipoNotificacao.AVISO,
      categoria: CategoriaNotificacao.PEDIDOS
    });
  };

  const mensagemWhatsBase = statusAprovacao === 'aprovado' 
    ? `Olá! Estou verificando o orçamento mágico para *${np}* e **APROVO** o pedido no valor de R$ ${(pr / 100).toFixed(2).replace('.', ',')}. Como podemos prosseguir?`
    : `Olá! Estou verificando o orçamento mágico para *${np}* no valor de R$ ${(pr / 100).toFixed(2).replace('.', ',')}. Tenho algumas dúvidas, podemos conversar?`;

  const linkWhats = w ? `https://wa.me/55${w.replace(/\D/g, '')}?text=${encodeURIComponent(mensagemWhatsBase)}` : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-800 selection:bg-sky-500/30 sm:py-12 overflow-x-hidden relative">
      
      {/* Premium Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
        }}
      />

      <main className="flex-1 w-full flex flex-col items-center relative z-10">
        
        <AnimatePresence mode="wait">
          {statusAprovacao === 'pendente' && (
            <motion.div 
              key="pendente"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className={`bg-white w-full max-w-[794px] sm:rounded-sm text-[#1e293b] flex flex-col ${isPrintMode ? 'min-h-0 p-8 shadow-none' : 'min-h-[1123px] shadow-2xl p-8 sm:px-16 sm:py-16'}`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* HEADER IDÊNTICO AO PDF */}
              <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#e2e8f0] ${isPrintMode ? 'pb-3 mb-6' : 'pb-5 mb-8'}`}>
                <div className="flex items-center gap-4">
                  {l ? (
                    <img src={l} alt={e} className="h-14 sm:h-16 w-auto object-contain" />
                  ) : (
                    <div className="w-[2px] h-[36px] bg-[#e2e8f0] rounded-sm flex-shrink-0"></div>
                  )}
                  <div className="flex flex-col gap-1 justify-center">
                    <span className="text-[22px] font-[900] uppercase tracking-[-0.02em] text-[#0f172a] leading-none">{estudioNome}</span>
                    {s && <span className="text-[8px] font-[600] uppercase tracking-[0.1em] text-[#64748b] leading-none">{s}</span>}
                  </div>
                </div>
                
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <div className="inline-flex items-center bg-[#f8fafc] text-[#0f172a] border border-[#e2e8f0] font-[800] uppercase tracking-[0.05em] px-3 py-1.5 rounded-lg text-[9px] mb-1">
                    Orçamento Oficial PROP-{numeroProposta}
                  </div>
                  <div className="text-[10px] font-[500] text-[#64748b]">
                    Emitido em: <strong className="text-[#0f172a] font-[700]">{formatarData(hoje)}</strong>
                  </div>
                  <div className="text-[10px] font-[500] text-[#64748b]">
                    Válido até: <strong className="text-[#0f172a] font-[700]">{formatarData(validade)}</strong>
                  </div>
                </div>
              </div>

              {/* INFO GRID (ESTILO FATURA MINIMALISTA) */}
              <div className={`flex flex-col sm:flex-row justify-between items-start gap-8 border-y border-[#f1f5f9] ${isPrintMode ? 'py-4 mb-6' : 'py-6 mb-8'}`}>
                <div className="flex flex-col gap-0.5">
                  <div className="text-[9px] font-[800] text-[#94a3b8] uppercase tracking-[0.1em] mb-1.5">Orçamento preparado para</div>
                  <div className="text-[18px] font-[900] text-[#0f172a] tracking-tight">{nomeClienteExibicao}</div>
                  <div className="text-[11px] font-[500] text-[#64748b] mt-0.5">Projeto: <strong className="text-[#334155]">{np}</strong></div>
                </div>
                <div className="flex flex-col gap-0.5 sm:text-right">
                  <div className="text-[9px] font-[800] text-[#94a3b8] uppercase tracking-[0.1em] mb-1.5">Apresentado por</div>
                  <div className="text-[18px] font-[900] text-[#0f172a] tracking-tight">{estudioNome}</div>
                  </div>
              </div>

              {/* TÍTULO SEÇÃO */}
              <div className="text-[13px] font-[800] uppercase tracking-[0.05em] text-[#0f172a] mb-4 flex items-center gap-2">
                <Package size={18} className="text-blue-500" />
                O que está incluso no seu projeto
              </div>

              {/* TABELA DE SERVIÇOS E CUSTOS */}
              <div className="overflow-x-auto mb-5">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="text-[9px] font-[700] uppercase text-[#94a3b8] tracking-[0.06em] py-2 px-1.5 border-b-2 border-[#e2e8f0] text-left">Serviço Detalhado</th>
                      <th className="text-[9px] font-[700] uppercase text-[#94a3b8] tracking-[0.06em] py-2 px-1.5 border-b-2 border-[#e2e8f0] text-center w-24">Quantidade</th>
                      <th className="text-[9px] font-[700] uppercase text-[#94a3b8] tracking-[0.06em] py-2 px-1.5 border-b-2 border-[#e2e8f0] text-right w-28">Valor Unitário</th>
                      <th className="text-[9px] font-[700] uppercase text-[#94a3b8] tracking-[0.06em] py-2 px-1.5 border-b-2 border-[#e2e8f0] text-right w-28">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2.5 px-1.5 border-b border-[#f8fafc] align-top">
                        <div className="font-[800] text-[#0f172a] text-[13px] mb-1">Impressão 3D e Manufatura Especializada</div>
                        <div className="text-[10px] text-[#64748b] leading-relaxed mb-2 max-w-sm">Serviço de produção sob demanda contemplando parametrização técnica, operação de maquinário e acabamento preliminar da peça.</div>
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-block text-[9px] font-[600] text-[#475569] bg-[#f1f5f9] px-2 py-1 rounded-md border border-[#e2e8f0]">Tempo est.: {t}min</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-1.5 border-b border-[#f8fafc] align-top text-center text-[11px] text-[#334155] pt-3">1x</td>
                      <td className="py-2.5 px-1.5 border-b border-[#f8fafc] align-top text-right text-[11px] text-[#334155] pt-3">R$ {(pr / 100).toFixed(2).replace('.', ',')}</td>
                      <td className="py-2.5 px-1.5 border-b border-[#f8fafc] align-top text-right text-[11px] text-[#334155] font-bold pt-3">R$ {(pr / 100).toFixed(2).replace('.', ',')}</td>
                    </tr>

                    {/* Falsa linha de "Composição de custos" para replicar o design detalhado do PDF */}
                    <tr>
                      <td colSpan={4} className="pt-6 pb-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-[800] uppercase text-[#64748b] tracking-[0.06em]">
                          <PieChart size={14} className="text-slate-400" /> Composição de Custos e Transparência
                        </div>
                      </td>
                    </tr>

                    {(() => {
                      const custoMateriais = m.reduce((acc: number, mat: any) => acc + (typeof mat === 'object' && mat.p ? mat.p : 0), 0);
                      const custoBase = (cm || 0) + (cmo || 0) + custoMateriais || 1;
                      const fatorProporcional = pr / custoBase;
                      const proporcionar = (centavos: number) => ((centavos * fatorProporcional) / 100).toFixed(2).replace('.', ',');

                      return (
                        <>
                          <tr className="border-b border-[#f1f5f9] hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-1.5 pl-6 relative text-[10px] font-medium text-[#64748b]">
                              <span className="absolute left-2 text-[#cbd5e1]">↳</span> Engenharia de Impressão e Setup Inicial
                            </td>
                            <td className="py-2 px-1.5 text-center text-[10px] text-[#64748b]">—</td>
                            <td className="py-2 px-1.5 text-right text-[10px] text-[#64748b]">—</td>
                            <td className="py-2 px-1.5 text-right text-[10px] text-[#475569] font-[700]">{cmo ? `R$ ${proporcionar(cmo)}` : 'R$ 0,00'}</td>
                          </tr>

                          <tr className="border-b border-[#f1f5f9] hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-1.5 pl-6 relative text-[10px] font-medium text-[#64748b]">
                              <span className="absolute left-2 text-[#cbd5e1]">↳</span> Tempo de Máquina (Energia, Desgaste e Depreciação)
                            </td>
                            <td className="py-2 px-1.5 text-center text-[10px] text-[#64748b]">{t ? `${Math.floor(t/60)}h ${t%60}m` : '—'}</td>
                            <td className="py-2 px-1.5 text-right text-[10px] text-[#64748b]">—</td>
                            <td className="py-2 px-1.5 text-right text-[10px] text-[#475569] font-[700]">{cm ? `R$ ${proporcionar(cm)}` : 'R$ 0,00'}</td>
                          </tr>
                          
                          {m.length > 0 ? (
                            <>
                              <tr>
                                <td className="py-2 px-1.5 pl-6 relative text-[10px] text-[#475569] font-[700]" colSpan={4}>
                                  <span className="absolute left-2 text-[#cbd5e1]">↳</span> Filamentos, Resinas e Matéria-Prima
                                </td>
                              </tr>
                              {m.map((mat: any, idx: number) => {
                                const isObj = typeof mat === 'object' && mat !== null;
                                const nome = isObj ? mat.n : mat;
                                const pesoFormatado = isObj && typeof mat.q === 'number' ? `${mat.q}g` : '—';
                                const precoFormatado = isObj && typeof mat.p === 'number' ? `R$ ${proporcionar(mat.p)}` : 'Incluso';
                                
                                return (
                                  <tr key={idx} className="border-b border-[#f1f5f9] last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="py-2 px-1.5 pl-10 text-[10px] font-medium text-[#64748b]">
                                      • {nome}
                                    </td>
                                    <td className="py-2 px-1.5 text-center text-[10px] text-[#64748b]">{pesoFormatado}</td>
                                    <td className="py-2 px-1.5 text-right text-[10px] text-[#64748b]">—</td>
                                    <td className="py-2 px-1.5 text-right text-[10px] text-[#475569] font-[700]">{precoFormatado}</td>
                                  </tr>
                                );
                              })}
                            </>
                          ) : (
                            <tr className="border-b border-[#f1f5f9] hover:bg-slate-50 transition-colors">
                              <td className="py-2 px-1.5 pl-6 relative text-[10px] font-medium text-[#64748b]">
                                <span className="absolute left-2 text-[#cbd5e1]">↳</span> Material Padrão
                              </td>
                              <td className="py-2 px-1.5 text-center text-[10px] text-[#64748b]">—</td>
                              <td className="py-2 px-1.5 text-right text-[10px] text-[#64748b]">—</td>
                              <td className="py-2 px-1.5 text-right text-[10px] text-[#475569] font-[700]">Incluso</td>
                            </tr>
                          )}
                        </>
                      );
                    })()}
                    
                    {obs && (
                      <tr className="bg-[#f8fafc] border-b border-[#f1f5f9]">
                        <td className="py-2 px-1.5 pl-6 relative text-[10px] text-[#64748b]" colSpan={4}>
                          <span className="absolute left-2 text-[#cbd5e1]">↳</span> <strong className="text-[#475569]">Observações:</strong> {obs}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TOTAL BOX IDÊNTICO AO PDF */}
              <div className={`bg-[#0f172a] text-white rounded-[20px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl shadow-slate-900/10 ${isPrintMode ? 'p-4 mb-4' : 'p-6 mb-8'}`}>
                <div className="flex flex-col gap-1">
                  <div className="text-[11px] font-[600] text-[#94a3b8] flex items-center gap-1.5 uppercase tracking-[0.05em]">
                    <Receipt size={14} className="text-slate-400" />
                    Investimento Total
                  </div>
                  <div className="text-[36px] font-[900] tracking-[-0.02em] leading-none text-white drop-shadow-md">R$ {(pr / 100).toFixed(2).replace('.', ',')}</div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between sm:justify-end gap-6 text-[11px] text-[#cbd5e1] mb-2">
                    <span>Subtotal do Serviço:</span>
                    <strong className="text-white font-[700]">R$ {(pr / 100).toFixed(2).replace('.', ',')}</strong>
                  </div>
                  <div className="h-[1px] bg-white/10 my-2"></div>
                  <div className="flex flex-col gap-1.5">
                    <div className="text-[10px] text-[#94a3b8] font-medium flex items-center justify-between sm:justify-end gap-2">
                      <span>Formas de pagamento: Pix ou Cartão.</span>
                    </div>
                    <div className="text-[10px] text-rose-400 font-bold flex items-center justify-between sm:justify-end gap-1.5">
                      <CalendarDays size={12} />
                      Proposta válida até {formatarData(validade)}
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER DE ASSINATURA/APROVAÇÃO */}
              <div className={`border border-[#e2e8f0] bg-[#f8fafc] rounded-xl text-center relative ${isPrintMode ? 'p-3' : 'p-4 sm:p-6'}`}>
                {/* Importando a fonte cursiva para a assinatura */}
                <style>
                  {`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap');
                    @media print {
                      @page { margin: 10mm; }
                      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                  `}
                </style>

                <div className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-[0.05em] mb-1.5">Aprovação do Orçamento</div>
                <div className={`text-[10px] text-[#64748b] leading-relaxed max-w-lg mx-auto ${isPrintMode ? 'mb-4' : 'mb-12'}`}>
                  Este documento serve como proposta oficial para execução dos serviços listados acima.
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-10">
                  <div className="flex flex-col items-center">
                    <div className="w-[200px] flex justify-center items-end h-[40px] mb-[-10px] z-10 relative">
                      <span 
                        className="text-3xl text-slate-700/80 -rotate-3 select-none"
                        style={{ fontFamily: "'Caveat', cursive" }}
                      >
                        {estudioNome}
                      </span>
                    </div>
                    <div className="w-[200px] border-t border-[#cbd5e1] pt-2 mb-1 flex justify-center">
                      <span className="text-[10px] font-[700] text-[#0f172a]">{estudioNome}</span>
                    </div>
                    <div className="text-[9px] font-[500] text-[#94a3b8]">Emissor da Proposta</div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-[200px] border-t border-[#cbd5e1] pt-2 mb-1 flex justify-center gap-2 mt-[30px]">
                       {!isPrintMode ? (
                         <>
                           <button 
                             onClick={lidarComAprovacao} 
                             className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 active:scale-95"
                           >
                             Aprovar
                           </button>
                           <button 
                             onClick={lidarComRecusa} 
                             className="bg-white border border-[#cbd5e1] text-[#64748b] px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-[#f1f5f9] transition-colors active:scale-95"
                           >
                             Recusar
                           </button>
                         </>
                       ) : (
                         <span className="text-[10px] font-[700] text-[#0f172a]">{nomeClienteExibicao}</span>
                       )}
                    </div>
                    <div className="text-[9px] font-[500] text-[#94a3b8]">Aceite / Cliente</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {statusAprovacao === 'aprovado' && (
            <motion.div 
              key="aprovado"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200 flex flex-col items-center text-center gap-6 mt-10"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-2 shadow-inner border border-emerald-100">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-900">Parabéns!</h2>
              <p className="text-slate-500 text-sm max-w-[320px] leading-relaxed">
                O estúdio <strong>{estudioNome}</strong> foi notificado da sua aprovação. Para alinhar pagamento e entrega, chame o fornecedor no WhatsApp.
              </p>

              {linkWhats && (
                <a 
                  href={linkWhats}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full max-w-sm h-14 mt-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] shadow-xl shadow-[#25D366]/20"
                >
                  Falar no WhatsApp <ArrowRight size={16} />
                </a>
              )}
            </motion.div>
          )}

          {statusAprovacao === 'recusado' && (
            <motion.div 
              key="recusado"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200 flex flex-col items-center text-center gap-6 mt-10"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                <ThumbsDown size={32} className="text-slate-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Proposta Recusada</h2>
              <p className="text-slate-500 text-sm max-w-[320px] leading-relaxed">
                O estúdio foi notificado sobre sua decisão. Se preferir, você pode enviar uma mensagem informando o motivo e tentarmos uma nova negociação.
              </p>

              {linkWhats && (
                <a 
                  href={linkWhats}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full max-w-sm h-14 mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98]"
                >
                  Falar com o fornecedor
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center text-[9px] font-medium text-slate-400/80 max-w-md mx-auto mb-2 leading-relaxed select-none">
          Estimativa baseada em parâmetros manuais. O PrintLog não se responsabiliza por prejuízos ou variações de mercado.
        </div>
        <div className="text-center text-[10px] font-medium text-slate-400 mt-8 mb-4">
          ♻️ Pense antes de imprimir. Documento digital disponível em printlog.com.br.
        </div>
      </main>
    </div>
  );
}
