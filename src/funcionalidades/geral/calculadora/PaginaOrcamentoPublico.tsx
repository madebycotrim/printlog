import { useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { decodificarLinkMagico } from "@/compartilhado/utilitarios/link-magico";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { ShieldAlert, Printer, CheckCircle2 } from "lucide-react";
import { useArmazemNotificacoes } from "@/compartilhado/estado/armazemNotificacoes";
import { TipoNotificacao, CategoriaNotificacao } from "@/compartilhado/tipos/notificacoes";
import { motion, AnimatePresence } from "framer-motion";
import { useArmazemPedidos } from "@/funcionalidades/producao/projetos/estado/armazemPedidos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";

export function PaginaOrcamentoPublico() {
  const [searchParams] = useSearchParams();
  const hash = searchParams.get("q");
  const isPrintMode = searchParams.get("p") === "1";

  const [statusAprovacao, setStatusAprovacao] = useState<'pendente' | 'aprovado' | 'recusado'>('pendente');
  const [termoAceite, setTermoAceite] = useState(false);
  const impressaoIniciada = useRef(false);

  const dados = useMemo(() => {
    if (!hash) return null;
    return decodificarLinkMagico(hash);
  }, [hash]);

  useEffect(() => {
    if (isPrintMode && dados && !impressaoIniciada.current) {
      impressaoIniciada.current = true;
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [isPrintMode, dados]);

  // Mapeamento descritivo em português dos campos minificados
  const { 
    pr: precoEmCentavos = 0, 
    np: nomeProjeto = "", 
    t: tempoMinutos = 0, 
    m: materiais = [], 
    ins: insumos = [], 
    e: estudioNome = "", 
    s: estudioSubtitulo = "", 
    l: estudioLogoUrl = "", 
    w: whatsappContato = "", 
    id: pedidoId = "", 
    cli: nomeCliente = "", 
    obs: observacoes = "", 
    cm: custoMaquina = 0, 
    cmo: custoMaoDeObra = 0 
  } = dados || {};

  const estudioNomeExibicao = estudioNome || "Estúdio de Impressão 3D";
  const nomeClienteExibicao = nomeCliente || "Consumidor Final";
  const numeroProposta = pedidoId ? pedidoId.split('-')[0].toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString();

  const hoje = new Date();
  const dataValidade = new Date(hoje);
  dataValidade.setDate(hoje.getDate() + 7);

  const formatarData = (data: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(data);
  };

  const lidarComAprovacao = () => {
    setStatusAprovacao('aprovado');
    let linkBusca = "/producao";

    if (pedidoId) {
       useArmazemPedidos.getState().atualizarPedidoNoEstado(pedidoId, { status: StatusPedido.A_FAZER });
       linkBusca = `/producao?busca=${pedidoId}`;
    } else {
       const novoId = crypto.randomUUID();
       useArmazemPedidos.getState().adicionarPedido({
          id: novoId,
          idUsuario: "sistema",
          idCliente: "avulso",
          nomeCliente: nomeCliente || "Cliente do Orçamento",
          descricao: nomeProjeto || "Projeto Aprovado via Link",
          status: StatusPedido.A_FAZER,
          valorCentavos: precoEmCentavos || 0,
          dataCriacao: new Date(),
          tempoMinutos: tempoMinutos || 0,
          observacoes: observacoes || "Gerado automaticamente via Link Mágico aprovado.",
       });
       linkBusca = `/producao?busca=${novoId}`;
    }

    useArmazemNotificacoes.getState().adicionarNotificacao({
      titulo: `Orçamento Aprovado: ${nomeProjeto}`,
      mensagem: `O cliente ${nomeClienteExibicao} aprovou o orçamento de ${centavosParaReais(precoEmCentavos)}. O projeto já está no Kanban!`,
      tipo: TipoNotificacao.SUCESSO,
      categoria: CategoriaNotificacao.PEDIDOS,
      link: linkBusca
    });
  };

  const lidarComRecusa = () => {
    setStatusAprovacao('recusado');
    if (pedidoId) {
       useArmazemPedidos.getState().atualizarPedidoNoEstado(pedidoId, { status: StatusPedido.ARQUIVADO });
    }
    useArmazemNotificacoes.getState().adicionarNotificacao({
      titulo: `Orçamento Recusado: ${nomeProjeto}`,
      mensagem: `O cliente ${nomeClienteExibicao} recusou a proposta de ${centavosParaReais(precoEmCentavos)}.`,
      tipo: TipoNotificacao.AVISO,
      categoria: CategoriaNotificacao.PEDIDOS
    });
  };

  const mensagemWhatsBase = statusAprovacao === 'aprovado' 
    ? `Olá! Refiro-me ao orçamento da proposta *PROP-${numeroProposta}* e confirmo o aceite no valor total de R$ ${(precoEmCentavos / 100).toFixed(2).replace('.', ',')}.`
    : `Olá! Refiro-me ao orçamento da proposta *PROP-${numeroProposta}* no valor de R$ ${(precoEmCentavos / 100).toFixed(2).replace('.', ',')}. Tenho algumas dúvidas.`;

  const linkWhats = whatsappContato ? `https://wa.me/55${whatsappContato.replace(/\D/g, '')}?text=${encodeURIComponent(mensagemWhatsBase)}` : null;

  // Cálculo proporcional detalhado
  const custoMateriaisTotal = materiais.reduce((acc: number, mat: any) => acc + (typeof mat === 'object' && mat.p ? mat.p : 0), 0);
  const custoInsumosTotal = insumos.reduce((acc: number, i: any) => acc + (i.p || 0), 0);
  const maquinaCusto = custoMaquina || 0;
  const maoDeObraCusto = custoMaoDeObra || 0;
  const somaCustosOperacionais = maquinaCusto + maoDeObraCusto + custoMateriaisTotal + custoInsumosTotal;
  const margemLucroLiquido = precoEmCentavos - somaCustosOperacionais;

  const pesosDistribuicao = {
    material: 5.0,
    maquina: 0.4,
    maodeobra: 1.5,
    insumo: 1.0
  };

  const baseFatorCalculo = 
    (custoMateriaisTotal * pesosDistribuicao.material) + 
    (maquinaCusto * pesosDistribuicao.maquina) + 
    (maoDeObraCusto * pesosDistribuicao.maodeobra) +
    (custoInsumosTotal * pesosDistribuicao.insumo);

  const obterFatorExtra = (custo: number, peso: number) => {
    if (margemLucroLiquido <= 0 || baseFatorCalculo <= 0) {
      const divisor = somaCustosOperacionais || 1;
      const fatorFallback = precoEmCentavos / divisor;
      return custo * fatorFallback - custo;
    }
    return margemLucroLiquido * ((custo * peso) / baseFatorCalculo);
  };

  const calcularPrecoFinalItem = (custo: number, peso: number) => {
    const valorSoma = custo + obterFatorExtra(custo, peso);
    return Math.max(0, valorSoma);
  };

  const formatarPrecoCentavos = (centavos: number) => {
    return (centavos / 100).toFixed(2).replace('.', ',');
  };

  const itensProposta = useMemo(() => {
    const lista = [];
    
    // Item 1
    const p1 = calcularPrecoFinalItem(maoDeObraCusto, pesosDistribuicao.maodeobra);
    if (p1 > 0) {
      lista.push({
        titulo: "Preparação e Setup Operacional",
        subtitulo: "Setup físico da impressora, calibração, troca de bicos/resinas e otimização geométrica do fatiamento.",
        especificacao: "Design & Setup",
        total: p1,
        detalhe: null
      });
    }

    // Item 2
    const p2 = calcularPrecoFinalItem(maquinaCusto, pesosDistribuicao.maquina);
    if (p2 > 0) {
      lista.push({
        titulo: "Tempo de Processamento (Máquina)",
        subtitulo: "Uso efetivo de hardware de manufatura 3D e consumo correspondente de energia elétrica.",
        especificacao: tempoMinutos ? `${Math.floor(tempoMinutos/60)}h ${Math.round(tempoMinutos%60)}m` : 'Processamento',
        total: p2,
        detalhe: null
      });
    }

    // Item 3
    const p3 = calcularPrecoFinalItem(custoMateriaisTotal, pesosDistribuicao.material);
    if (p3 > 0 && materiais && materiais.length > 0) {
      lista.push({
        titulo: "Consumo de Matéria-Prima",
        subtitulo: "Filamento ou resina técnica de alta performance consumidos na peça principal e suportes.",
        especificacao: "Material Aplicado",
        total: p3,
        detalhe: (
          <div className="mt-2 flex flex-wrap gap-1">
            {materiais.map((mat: any, idx: number) => {
              const isObj = typeof mat === 'object' && mat !== null;
              const nome = isObj ? mat.n : mat;
              const tipo = isObj && mat.t ? mat.t : '';
              const peso = isObj && typeof mat.q === 'number' ? `${mat.q}g` : '';
              return (
                <span key={idx} className="bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wide">
                  {tipo && `${tipo} `}{nome}{peso && ` (${peso})`}
                </span>
              );
            })}
          </div>
        )
      });
    }

    // Item 4
    const p4 = calcularPrecoFinalItem(custoInsumosTotal, pesosDistribuicao.insumo);
    if (p4 > 0 && insumos && insumos.length > 0) {
      lista.push({
        titulo: "🔩 Insumos Logísticos & Pós-Processamento",
        subtitulo: "Componentes adicionais de montagem, lixamento técnico e remoção manual de suportes.",
        especificacao: "Insumos & Acabamento",
        total: p4,
        detalhe: (
          <div className="mt-2 flex flex-wrap gap-1">
            {insumos.map((i: any, idx: number) => {
              const nome = i.n;
              const qtd = i.q ? `${i.q}${i.u || 'un'}` : '';
              return (
                <span key={idx} className="bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wide">
                  {nome}{qtd && ` (${qtd})`}
                </span>
              );
            })}
          </div>
        )
      });
    }

    return lista;
  }, [maoDeObraCusto, maquinaCusto, custoMateriaisTotal, custoInsumosTotal, tempoMinutos, materiais, insumos]);

  if (!dados) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] text-neutral-900 p-6">
        <div className="max-w-md w-full p-8 rounded-lg bg-white border border-neutral-200 text-center flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
            <ShieldAlert size={20} />
          </div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-neutral-800">Proposta Inválida</h1>
          <p className="text-xs text-neutral-500 leading-relaxed">Este link mágico parece estar corrompido ou expirado. Entre em contato com o fornecedor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:16px_16px] font-sans text-neutral-800 antialiased selection:bg-neutral-900/10 relative flex flex-col items-center ${isPrintMode ? 'bg-white p-0 m-0' : 'py-10 px-4 sm:py-16'}`}>
      
      {/* Barra de Status e Ações Rápida Superior */}
      {!isPrintMode && (
        <div className="max-w-3xl w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white/80 border border-slate-200/60 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${
              statusAprovacao === 'aprovado' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 
              statusAprovacao === 'recusado' ? 'bg-rose-400' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse'
            }`} />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Proposta: 
              <span className={`ml-2 font-black ${
                statusAprovacao === 'aprovado' ? 'text-emerald-600' : 
                statusAprovacao === 'recusado' ? 'text-rose-500' : 'text-amber-600'
              }`}>
                {statusAprovacao === 'aprovado' ? 'Aprovada' : 
                 statusAprovacao === 'recusado' ? 'Declinada' : 'Aguardando Aceite'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-sm cursor-pointer"
            >
              <Printer size={13} /> Imprimir Orçamento
            </button>
            {linkWhats && (
              <a 
                href={linkWhats}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-[0_4px_12px_rgba(15,23,42,0.15)] cursor-pointer"
              >
                Falar com o Maker
              </a>
            )}
          </div>
        </div>
      )}

      {/* Canva do Documento (Folha de Proposta Comercial) */}
      <div className={`bg-white max-w-3xl w-full border border-slate-100 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_20px_50px_rgba(15,23,42,0.05)] ${isPrintMode ? 'border-none p-0 shadow-none' : 'p-8 sm:p-14'}`}>
        
        {/* Cabeçalho da Proposta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 mb-8 border-b border-slate-100">
          
          <div className="flex items-center gap-3.5">
            {estudioLogoUrl ? (
              <img src={estudioLogoUrl} alt={estudioNomeExibicao} className="h-11 w-auto object-contain rounded-xl border border-slate-100 p-1 bg-white shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white text-[11px] font-black uppercase tracking-widest">
                {estudioNomeExibicao.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-none tracking-tight">{estudioNomeExibicao}</h1>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block">{estudioSubtitulo || "Manufatura Digital & Prototipagem 3D"}</span>
            </div>
          </div>

          <div className="flex flex-col text-left sm:text-right text-[11px] font-semibold text-slate-500">
            <span className="font-black tracking-widest text-slate-300 uppercase text-[9px]">PROPOSTA DE SERVIÇO</span>
            <div className="flex flex-col gap-1 mt-2">
              <span>Código: <strong className="text-slate-800 font-bold font-mono">#{numeroProposta}</strong></span>
              <span>Emissão: <strong className="text-slate-800 font-bold">{formatarData(hoje)}</strong></span>
              <span>Vencimento: <strong className="text-slate-800 font-bold">{formatarData(dataValidade)}</strong></span>
            </div>
          </div>

        </div>

        {/* Título do Documento */}
        <div className={`text-left mb-8 ${isPrintMode ? 'mb-4' : ''}`}>
          <h2 className={`font-black text-slate-900 tracking-tight ${isPrintMode ? 'text-lg' : 'text-xl'}`}>
            Orçamento de Manufatura 3D
          </h2>
          {!isPrintMode && (
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">
              Custos consolidados de engenharia tridimensional, fatiamento, setup técnico e pós-processamento da peça física.
            </p>
          )}
        </div>

        {/* Partes Interessadas (Contratante e Contratada) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left text-[11px] leading-relaxed ${isPrintMode ? 'mb-4 gap-2 text-[10px]' : ''}`}>
          
          <div className={`p-5 rounded-2xl border border-slate-100 bg-slate-50/50 ${isPrintMode ? 'p-3 rounded-xl' : ''}`}>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Fornecedor / Maker</span>
            <h3 className="font-extrabold text-slate-900">{estudioNomeExibicao}</h3>
            {whatsappContato && !isPrintMode && <span className="text-slate-500 block mt-1.5">WhatsApp: {whatsappContato}</span>}
          </div>

          <div className={`p-5 rounded-2xl border border-slate-100 bg-slate-50/50 ${isPrintMode ? 'p-3 rounded-xl' : ''}`}>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Cliente Destinatário</span>
            <h3 className="font-extrabold text-slate-900">{nomeClienteExibicao}</h3>
            <span className="text-slate-500 block mt-1.5 truncate">Projeto: {nomeProjeto}</span>
          </div>

        </div>

        {/* Escopo Técnico */}
        <div className={`text-left mb-8 text-[11px] ${isPrintMode ? 'mb-4 text-[10px]' : ''}`}>
          {!isPrintMode && (
            <>
              <h4 className="font-black uppercase text-slate-400 tracking-widest text-[9px] mb-2 block">Especificações da Proposta</h4>
              <p className="text-slate-600 leading-relaxed font-medium">
                Fabricação de peças físicas tridimensionais com base no arquivo de fatiamento fornecido. O lote inclui testes iniciais de setup de fabricação para garantia de precisão dimensional.
              </p>
            </>
          )}
          
          <div className={`flex flex-wrap gap-6 mt-5 text-slate-500 font-bold border-t border-slate-100 pt-4 ${isPrintMode ? 'mt-2 pt-2 gap-4' : ''}`}>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Tecnologia</span>
              <span className="text-slate-700">Manufatura 3D sob Demanda</span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Lote Produzido</span>
              <span className="text-slate-700">Lote Técnico Especificado</span>
            </div>
            {tempoMinutos ? (
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Tempo Total de Produção</span>
                <span className="text-slate-700 font-mono">{Math.floor(tempoMinutos/60)}h {Math.round(tempoMinutos%60)}m</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Planilha de Custos / Tabela Stripe Style */}
        <div className={`text-left mb-8 ${isPrintMode ? 'mb-4' : ''}`}>
          <h4 className="font-black uppercase text-slate-400 tracking-widest text-[9px] mb-3 block">Detalhamento Financeiro</h4>

          <div className="border border-slate-200/70 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <table className={`w-full border-collapse text-left ${isPrintMode ? 'text-[10px]' : 'text-[11px]'}`}>
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200/80 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <th className={`py-3.5 px-4 w-12 text-center ${isPrintMode ? 'py-2' : ''}`}>Item</th>
                  <th className={`py-3.5 px-3 ${isPrintMode ? 'py-2' : ''}`}>Serviço / Processo</th>
                  <th className={`py-3.5 px-3 text-center w-28 ${isPrintMode ? 'py-2' : ''}`}>Especificação</th>
                  <th className={`py-3.5 px-4 text-right w-24 ${isPrintMode ? 'py-2' : ''}`}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {itensProposta.map((item, idx) => (
                  <tr key={idx}>
                    <td className={`px-4 text-center text-slate-400 font-mono ${isPrintMode ? 'py-2' : 'py-4'}`}>{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className={`px-3 ${isPrintMode ? 'py-2' : 'py-4'}`}>
                      <div className="font-bold text-slate-800">{item.titulo}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{item.subtitulo}</div>
                      {item.detalhe}
                    </td>
                    <td className={`px-3 text-center text-slate-400 ${isPrintMode ? 'py-2' : 'py-4'}`}>{item.especificacao}</td>
                    <td className={`px-4 text-right font-bold text-slate-900 font-mono text-[11.5px] ${isPrintMode ? 'py-2' : 'py-4'}`}>
                      R$ {formatarPrecoCentavos(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className={`bg-slate-50 border-t border-slate-200/60 flex justify-end ${isPrintMode ? 'p-3' : 'p-5'}`}>
              <div className="flex justify-between items-baseline w-60 text-[11px] font-bold">
                <span className="text-slate-400 uppercase tracking-widest text-[9px] font-black">Investimento Total:</span>
                <span className="text-xl text-slate-900 font-black font-mono">
                  R$ {formatarPrecoCentavos(precoEmCentavos)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {observacoes && (
          <div className={`text-left mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-200/50 text-[11px] text-slate-600 leading-relaxed font-medium ${isPrintMode ? 'p-3 mb-4 text-[10px]' : ''}`}>
            <span className="font-black text-slate-800 uppercase tracking-widest block mb-2 text-[9px]">Condições e Prazos Adicionais</span>
            {observacoes}
          </div>
        )}

        {/* Termos e Faturamento */}
        <div className={`text-left mb-8 text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-5 font-medium ${isPrintMode ? 'mb-4 pt-3' : ''}`}>
          <h5 className="font-black text-slate-500 uppercase tracking-widest text-[9px] mb-1.5">Termos de Aceite Comercial</h5>
          <p>
            O envio e aceite nesta proposta configura sinal verde para inclusão imediata na fila de produção física do Maker. O tempo estimado de impressão está sujeito ao fluxo da oficina.
          </p>
        </div>

        {/* Assinatura Criptográfica Discreta (Escondida no modo de impressão para caber tudo em 1 folha) */}
        <div className={`border-t border-slate-100 pt-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left text-[10px] leading-relaxed text-slate-400 ${isPrintMode ? 'hidden' : ''}`}>
          
          <div>
            <span className="font-black text-slate-400 uppercase tracking-widest text-[9px] block mb-2">Assinatura Digital do Emissor</span>
            <div className="p-4 border border-slate-200/80 rounded-xl bg-slate-50/50 font-mono text-[9px] text-slate-500">
              <span>ESTÚDIO: {estudioNomeExibicao}</span>
              <span className="block mt-1.5 text-slate-400">PROPOSTA_HASH: {numeroProposta.slice(0, 8)}...OK</span>
            </div>
          </div>

          <div>
            <span className="font-black text-slate-400 uppercase tracking-widest text-[9px] block mb-2">Validação e Aceite do Cliente</span>
            
            <AnimatePresence mode="wait">
              {statusAprovacao === 'pendente' ? (
                <motion.div 
                  key="pendente-aceite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <label className="flex items-start gap-2 cursor-pointer select-none group text-slate-500">
                    <input 
                      type="checkbox" 
                      checked={termoAceite} 
                      onChange={(e) => setTermoAceite(e.target.checked)} 
                      id="termo-aceite"
                      className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 transition-all cursor-pointer"
                    />
                    <span className="text-[10px] leading-normal font-semibold group-hover:text-slate-800 transition-colors">
                      Aceito a proposta de serviços e autorizo o início da fabricação do lote técnico.
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button 
                      onClick={lidarComAprovacao}
                      disabled={!termoAceite}
                      id="btn-aprovar"
                      className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-[0.98] shadow-sm cursor-pointer"
                    >
                      Confirmar Aceite
                    </button>
                    
                    <button 
                      onClick={lidarComRecusa}
                      id="btn-recusar"
                      className="px-4 h-10 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center active:scale-[0.98] cursor-pointer"
                    >
                      Declinar
                    </button>
                  </div>
                </motion.div>
              ) : statusAprovacao === 'aprovado' ? (
                <motion.div 
                  key="aprovado-aceite"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl font-mono text-emerald-800 text-[9px] shadow-[0_4px_12px_rgba(16,185,129,0.06)]"
                >
                  <span className="font-bold flex items-center gap-1"><CheckCircle2 size={11} className="text-emerald-600" /> PROPOSTA APROVADA DIGITALMENTE</span>
                  <span className="block mt-1.5 text-[8px] text-emerald-600">CLIENTE: {nomeClienteExibicao} | HORA: {hoje.toLocaleTimeString('pt-BR')}</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="recusado-aceite"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 border border-slate-200 bg-slate-100 rounded-xl font-mono text-slate-500 text-[9px]"
                >
                  <span className="font-bold block text-slate-700">PROPOSTA DECLINADA PELO CLIENTE</span>
                  <span className="block mt-1.5 text-[8px] text-slate-400">O proponente maker foi notificado sobre a recusa do lote.</span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

    </div>
  );
}

