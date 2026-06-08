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

  // Mapeamento descritivo em português dos campos minificados
  const { 
    pr: precoEmCentavos, 
    np: nomeProjeto, 
    t: tempoMinutos, 
    m: materiais = [], 
    ins: insumos = [], 
    e: estudioNome, 
    s: estudioSubtitulo, 
    l: estudioLogoUrl, 
    w: whatsappContato, 
    id: pedidoId, 
    cli: nomeCliente, 
    obs: observacoes, 
    cm: custoMaquina, 
    cmo: custoMaoDeObra 
  } = dados;

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

  return (
    <div className={`min-h-screen bg-[#f7f8fa] bg-[linear-gradient(to_right,rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:24px_24px] font-sans text-neutral-800 antialiased selection:bg-neutral-900/10 relative flex flex-col items-center ${isPrintMode ? 'bg-white p-0 m-0' : 'py-10 px-4 sm:py-16'}`}>
      
      {/* Barra de Status e Ações Rápida Superior */}
      {!isPrintMode && (
        <div className="max-w-3xl w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white border border-neutral-200/80 px-6 py-4 rounded-xl shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${
              statusAprovacao === 'aprovado' ? 'bg-emerald-500 animate-pulse' : 
              statusAprovacao === 'recusado' ? 'bg-neutral-400' : 'bg-amber-500 animate-pulse'
            }`} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Proposta: 
              <span className={`ml-1.5 font-extrabold ${
                statusAprovacao === 'aprovado' ? 'text-emerald-700' : 
                statusAprovacao === 'recusado' ? 'text-neutral-500' : 'text-amber-600'
              }`}>
                {statusAprovacao === 'aprovado' ? 'Aprovada' : 
                 statusAprovacao === 'recusado' ? 'Declinada' : 'Aguardando Aceite'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              className="px-3.5 py-2 text-[11px] font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Printer size={13} /> Imprimir Orçamento
            </button>
            {linkWhats && (
              <a 
                href={linkWhats}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 text-[11px] font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                Falar com o Maker
              </a>
            )}
          </div>
        </div>
      )}

      {/* Canva do Documento (Folha de Proposta Comercial) */}
      <div className={`bg-white max-w-3xl w-full border border-neutral-200/80 rounded-2xl overflow-hidden flex flex-col relative shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] ${isPrintMode ? 'border-none p-0 shadow-none' : 'p-8 sm:p-14'}`}>
        
        {/* Cabeçalho da Proposta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 mb-8 border-b border-neutral-100">
          
          <div className="flex items-center gap-3">
            {estudioLogoUrl ? (
              <img src={estudioLogoUrl} alt={estudioNomeExibicao} className="h-9 w-auto object-contain rounded border border-neutral-100 p-0.5 bg-white" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-wider">
                {estudioNomeExibicao.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-sm font-bold text-neutral-900 leading-none tracking-tight">{estudioNomeExibicao}</h1>
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">{estudioSubtitulo || "Manufatura Digital & Prototipagem 3D"}</span>
            </div>
          </div>

          <div className="flex flex-col text-left sm:text-right text-[11px] font-semibold text-neutral-500">
            <span className="font-extrabold tracking-wider text-neutral-400 uppercase text-[9px]">PROP-RESUMO DE SERVIÇO</span>
            <div className="flex flex-col gap-0.5 mt-1.5">
              <span>Código: <strong className="text-neutral-800 font-bold font-mono">#{numeroProposta}</strong></span>
              <span>Emissão: <strong className="text-neutral-800 font-bold">{formatarData(hoje)}</strong></span>
              <span>Vencimento: <strong className="text-neutral-800 font-bold">{formatarData(dataValidade)}</strong></span>
            </div>
          </div>

        </div>

        {/* Título do Documento */}
        <div className="text-left mb-8">
          <h2 className="text-lg font-extrabold text-neutral-950 tracking-tight">
            Orçamento de Manufatura 3D
          </h2>
          <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
            Custos referentes ao fatiamento digital, setup e processamento da peça física solicitada.
          </p>
        </div>

        {/* Partes Interessadas (Contratante e Contratada) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left text-[11px] leading-relaxed">
          
          <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50">
            <span className="text-[9px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-1.5">Fornecedor / Maker</span>
            <h3 className="font-bold text-neutral-900">{estudioNomeExibicao}</h3>
            {whatsappContato && <span className="text-neutral-500 block mt-1">Contato: {whatsappContato}</span>}
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50">
            <span className="text-[9px] font-extrabold uppercase text-neutral-400 tracking-wider block mb-1.5">Cliente Destinatário</span>
            <h3 className="font-bold text-neutral-900">{nomeClienteExibicao}</h3>
            <span className="text-neutral-500 block mt-1 truncate">Projeto: {nomeProjeto}</span>
          </div>

        </div>

        {/* Escopo Técnico */}
        <div className="text-left mb-8 text-[11px]">
          <h4 className="font-extrabold uppercase text-neutral-400 tracking-wider text-[9px] mb-1.5">Descrição Geral do Escopo</h4>
          <p className="text-neutral-600 leading-relaxed font-medium">
            Confecção de protótipos/peças físicas personalizadas sob demanda usando sistemas de deposição termoplástica com base em modelos tridimensionais digitais homologados.
          </p>
          
          <div className="flex flex-wrap gap-5 mt-4 text-neutral-500 font-bold border-t border-neutral-100 pt-3">
            <div>
              <span className="text-[9px] font-semibold uppercase text-neutral-400 block">Tecnologia</span>
              <span className="text-neutral-700">FDM (Impressão 3D)</span>
            </div>
            <div>
              <span className="text-[9px] font-semibold uppercase text-neutral-400 block">Lote Produzido</span>
              <span className="text-neutral-700">01 Lote Técnico</span>
            </div>
            {tempoMinutos ? (
              <div>
                <span className="text-[9px] font-semibold uppercase text-neutral-400 block">Tempo Total de Impressão</span>
                <span className="text-neutral-700 font-mono">{Math.floor(tempoMinutos/60)}h {Math.round(tempoMinutos%60)}m</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Planilha de Custos / Tabela Stripe Style */}
        <div className="text-left mb-8">
          <h4 className="font-extrabold uppercase text-neutral-400 tracking-wider text-[9px] mb-3">Itemização Detalhada</h4>

          <div className="border border-neutral-200/80 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-left text-[11px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200/80 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">Item</th>
                  <th className="py-3 px-3">Serviço / Processo</th>
                  <th className="py-3 px-3 text-center w-24">Especificação</th>
                  <th className="py-3 px-4 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-600">
                
                {/* Item 1 */}
                <tr>
                  <td className="py-3 px-4 text-center text-neutral-400 font-mono">01</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-neutral-800">🛠️ Preparação do Projeto e Engenharia 3D</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Análise geométrica, fatiamento, otimização de suportes e setup inicial da impressora.</div>
                  </td>
                  <td className="py-3 px-3 text-center text-neutral-400">Setup & Design</td>
                  <td className="py-3 px-4 text-right font-extrabold text-neutral-800 font-mono">
                    R$ {formatarPrecoCentavos(calcularPrecoFinalItem(maoDeObraCusto, pesosDistribuicao.maodeobra))}
                  </td>
                </tr>

                {/* Item 2 */}
                <tr>
                  <td className="py-3 px-4 text-center text-neutral-400 font-mono">02</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-neutral-800">⚡ Tempo de Máquina & Energia</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Uso efetivo da impressora 3D, consumo de eletricidade e desgaste programado.</div>
                  </td>
                  <td className="py-3 px-3 text-center text-neutral-400 font-mono">
                    {tempoMinutos ? `${Math.floor(tempoMinutos/60)}h ${Math.round(tempoMinutos%60)}m` : 'Processamento'}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-neutral-800 font-mono">
                    R$ {formatarPrecoCentavos(calcularPrecoFinalItem(maquinaCusto, pesosDistribuicao.maquina))}
                  </td>
                </tr>

                {/* Item 3 */}
                {materiais && materiais.length > 0 && (
                  <tr>
                    <td className="py-3 px-4 text-center text-neutral-400 font-mono">03</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-neutral-800">📦 Matéria-Prima (Peça Física)</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Filamento plástico termoplástico de nível industrial consumido nas peças.</div>
                      <div className="mt-1.5 flex flex-wrap gap-1 font-semibold text-neutral-500">
                        {materiais.map((mat: any, idx: number) => {
                          const isObj = typeof mat === 'object' && mat !== null;
                          const nome = isObj ? mat.n : mat;
                          const tipo = isObj && mat.t ? mat.t : '';
                          const peso = isObj && typeof mat.q === 'number' ? `${mat.q}g` : '';
                          return (
                            <span key={idx} className="bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide">
                              {tipo && `${tipo} `}{nome}{peso && ` (${peso})`}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400">Material Aplicado</td>
                    <td className="py-3 px-4 text-right font-extrabold text-neutral-800 font-mono">
                      R$ {formatarPrecoCentavos(calcularPrecoFinalItem(custoMateriaisTotal, pesosDistribuicao.material))}
                    </td>
                  </tr>
                )}

                {/* Item 4 */}
                {insumos && insumos.length > 0 && (
                  <tr>
                    <td className="py-3 px-4 text-center text-neutral-400 font-mono">04</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-neutral-800">🔩 Insumos & Acabamento Manual</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Retirada de suportes, insertos metálicos, parafusos extras e acabamento final.</div>
                      <div className="mt-1.5 flex flex-wrap gap-1 font-semibold text-neutral-500">
                        {insumos.map((i: any, idx: number) => {
                          const nome = i.n;
                          const qtd = i.q ? `${i.q}${i.u || 'un'}` : '';
                          return (
                            <span key={idx} className="bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide">
                              {nome}{qtd && ` (${qtd})`}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-neutral-400">Componentes Extras</td>
                    <td className="py-3 px-4 text-right font-extrabold text-neutral-800 font-mono">
                      R$ {formatarPrecoCentavos(calcularPrecoFinalItem(custoInsumosTotal, pesosDistribuicao.insumo))}
                    </td>
                  </tr>
                )}

              </tbody>
            </table>

            {/* Total */}
            <div className="bg-neutral-50 border-t border-neutral-200/80 p-4 flex justify-end">
              <div className="flex justify-between items-baseline w-56 text-[11px] font-bold">
                <span className="text-neutral-500 uppercase tracking-wider text-[9px] font-extrabold">Total do Projeto:</span>
                <span className="text-lg text-neutral-900 font-black font-mono">
                  R$ {formatarPrecoCentavos(precoEmCentavos)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {observacoes && (
          <div className="text-left mb-8 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-600 leading-relaxed font-medium">
            <span className="font-bold text-neutral-800 uppercase tracking-wider block mb-1 text-[9px]">Notas e Prazos</span>
            {observacoes}
          </div>
        )}

        {/* Termos e Faturamento */}
        <div className="text-left mb-8 text-[10px] text-neutral-400 leading-relaxed border-t border-neutral-100 pt-5 font-medium">
          <h5 className="font-extrabold text-neutral-500 uppercase tracking-wider text-[9px] mb-1.5">Termos e Condições Gerais</h5>
          <p>
            O início da produção física na fila Kanban do Maker dar-se-á imediatamente após o aceite digital e aprovação nesta tela.
          </p>
        </div>

        {/* Assinatura Criptográfica Discreta */}
        <div className="border-t border-neutral-100 pt-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left text-[10px] leading-relaxed text-neutral-400">
          
          <div>
            <span className="font-extrabold text-neutral-500 uppercase tracking-wider text-[9px] block mb-1.5">Assinatura do Emitente (Estúdio)</span>
            <div className="p-3 border border-neutral-200 rounded-lg bg-neutral-50 font-mono text-[9px]">
              <span>MAKER: {estudioNomeExibicao}</span>
              <span className="block mt-0.5 text-neutral-400">PROPOSTA_HASH: {numeroProposta.slice(0, 8)}...OK</span>
            </div>
          </div>

          <div>
            <span className="font-extrabold text-neutral-500 uppercase tracking-wider text-[9px] block mb-1.5">Validação e Aceite do Cliente</span>
            
            <AnimatePresence mode="wait">
              {statusAprovacao === 'pendente' ? (
                <motion.div 
                  key="pendente-aceite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <label className="flex items-start gap-2 cursor-pointer select-none group text-neutral-500">
                    <input 
                      type="checkbox" 
                      checked={termoAceite} 
                      onChange={(e) => setTermoAceite(e.target.checked)} 
                      id="termo-aceite"
                      className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 transition-all cursor-pointer"
                    />
                    <span className="text-[10px] leading-normal font-semibold">
                      Aceito a proposta comercial descrita acima e autorizo o início da produção física.
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button 
                      onClick={lidarComAprovacao}
                      disabled={!termoAceite}
                      id="btn-aprovar"
                      className="flex-1 h-9.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400 text-white rounded-lg text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 active:scale-[0.98] shadow-sm cursor-pointer"
                    >
                      Aprovar e Ir Para Fila
                    </button>
                    
                    <button 
                      onClick={lidarComRecusa}
                      id="btn-recusar"
                      className="px-3.5 h-9.5 bg-white hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600 border border-neutral-200 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center justify-center active:scale-[0.98]"
                    >
                      Recusar
                    </button>
                  </div>
                </motion.div>
              ) : statusAprovacao === 'aprovado' ? (
                <motion.div 
                  key="aprovado-aceite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 border border-emerald-200 bg-emerald-50/50 rounded-lg font-mono text-emerald-800 text-[9px]"
                >
                  <span className="font-bold flex items-center gap-1"><CheckCircle2 size={10} /> ACEITO DIGITALMENTE</span>
                  <span className="block mt-0.5 text-[8px] text-emerald-600">CLIENTE: {nomeClienteExibicao} | HORA: {hoje.toLocaleTimeString('pt-BR')}</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="recusado-aceite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 border border-neutral-300 bg-neutral-100 rounded-lg font-mono text-neutral-600 text-[9px]"
                >
                  <span className="font-bold">PROPOSTA RECUSADA</span>
                  <span className="block mt-0.5 text-[8px] text-neutral-400">O estúdio maker foi notificado sobre a recusa.</span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

    </div>
  );
}

