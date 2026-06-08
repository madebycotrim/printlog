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
    <div className={`min-h-screen bg-[#fafafa] font-sans text-neutral-800 antialiased selection:bg-neutral-900/10 relative flex flex-col items-center ${isPrintMode ? 'bg-white p-0 m-0' : 'py-10 px-4 sm:py-20'}`}>
      
      {/* Barra de Status e Ações Rápida Superior */}
      {!isPrintMode && (
        <div className="max-w-3xl w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white border border-neutral-200 px-5 py-3.5 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${
              statusAprovacao === 'aprovado' ? 'bg-emerald-500' : 
              statusAprovacao === 'recusado' ? 'bg-neutral-400' : 'bg-amber-500'
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
              className="px-3 py-1.5 text-[11px] font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded transition-all flex items-center gap-1.5"
            >
              <Printer size={12} /> Imprimir
            </button>
            {linkWhats && (
              <a 
                href={linkWhats}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-[11px] font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-all flex items-center gap-1.5"
              >
                Falar com Fornecedor
              </a>
            )}
          </div>
        </div>
      )}

      {/* Canva do Documento (Folha de Proposta Comercial) */}
      <div className={`bg-white max-w-3xl w-full border border-neutral-200 rounded-lg overflow-hidden flex flex-col relative ${isPrintMode ? 'border-none p-0' : 'p-8 sm:p-12'}`}>
        
        {/* Cabeçalho da Proposta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 mb-8 border-b border-neutral-100">
          
          <div className="flex items-center gap-3">
            {estudioLogoUrl ? (
              <img src={estudioLogoUrl} alt={estudioNomeExibicao} className="h-9 w-auto object-contain rounded border border-neutral-100 p-0.5 bg-white" />
            ) : (
              <div className="w-8 h-8 rounded bg-neutral-950 flex items-center justify-center text-white text-xs font-bold">
                {estudioNomeExibicao.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-sm font-bold text-neutral-900 leading-none tracking-tight">{estudioNomeExibicao}</h1>
              <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-widest mt-1 block">{estudioSubtitulo || "Manufatura Digital"}</span>
            </div>
          </div>

          <div className="flex flex-col text-left sm:text-right text-[11px] font-semibold text-neutral-500">
            <span>PROPOSTA COMERCIAL</span>
            <div className="flex flex-col gap-0.5 mt-1">
              <span>Código: <strong className="text-neutral-800 font-bold">PROP-{numeroProposta}</strong></span>
              <span>Emissão: <strong className="text-neutral-800 font-bold">{formatarData(hoje)}</strong></span>
              <span>Vencimento: <strong className="text-neutral-800 font-bold">{formatarData(dataValidade)}</strong></span>
            </div>
          </div>

        </div>

        {/* Título do Documento */}
        <div className="text-left mb-8">
          <h2 className="text-xl font-bold text-neutral-950 tracking-tight">
            Orçamento de Prestação de Serviços de Impressão 3D
          </h2>
          <p className="text-neutral-500 text-xs mt-1 leading-relaxed">
            Detalhamento de custos de manufatura aditiva para a confecção física de protótipos mecânicos.
          </p>
        </div>

        {/* Partes Interessadas (Contratante e Contratada) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-left text-[11px] leading-relaxed">
          
          <div className="p-4 rounded border border-neutral-200">
            <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider block mb-1.5">Fornecedor</span>
            <h3 className="font-bold text-neutral-900">{estudioNomeExibicao}</h3>
            {whatsappContato && <span className="text-neutral-500 block mt-1">Contato: {whatsappContato}</span>}
          </div>

          <div className="p-4 rounded border border-neutral-200">
            <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider block mb-1.5">Cliente</span>
            <h3 className="font-bold text-neutral-900">{nomeClienteExibicao}</h3>
            <span className="text-neutral-500 block mt-1">Projeto: {nomeProjeto}</span>
          </div>

        </div>

        {/* Escopo Técnico */}
        <div className="text-left mb-8 text-[11px]">
          <h4 className="font-bold uppercase text-neutral-400 tracking-wider text-[9px] mb-1.5">Escopo de Serviços</h4>
          <p className="text-neutral-600 leading-relaxed">
            O escopo engloba a modelagem de fatiamento tridimensional dos arquivos enviados, a calibração de eixos das extrusoras digitais, o consumo de matéria-prima polimérica e a fabricação física sob demanda, supervisionada pelo sistema de qualidade do estúdio fornecedor.
          </p>
          
          <div className="flex gap-6 mt-3 text-neutral-500 font-bold">
            <div>
              <span className="text-[9px] font-semibold uppercase text-neutral-400 block">Tecnologia</span>
              <span className="text-neutral-700">FDM 3D</span>
            </div>
            <div>
              <span className="text-[9px] font-semibold uppercase text-neutral-400 block">Lote</span>
              <span className="text-neutral-700">01 Unidade</span>
            </div>
            {tempoMinutos ? (
              <div>
                <span className="text-[9px] font-semibold uppercase text-neutral-400 block">Tempo Máquina</span>
                <span className="text-neutral-700">{Math.floor(tempoMinutos/60)}h {Math.round(tempoMinutos%60)}m</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Planilha de Custos / Tabela Stripe Style */}
        <div className="text-left mb-8">
          <h4 className="font-bold uppercase text-neutral-400 tracking-wider text-[9px] mb-3">Itemização do Investimento</h4>

          <div className="border border-neutral-200 rounded overflow-hidden">
            <table className="w-full border-collapse text-left text-[11px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-10 text-center">Item</th>
                  <th className="py-2.5 px-3">Especificação do Item</th>
                  <th className="py-2.5 px-3 text-center w-24">Referência</th>
                  <th className="py-2.5 px-4 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium text-neutral-600">
                
                {/* Item 1 */}
                <tr>
                  <td className="py-3 px-4 text-center text-neutral-400">01</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-neutral-800">Modelagem e Engenharia de Fatiamento</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Preparação, calibração mecânica e posicionamento de arquivos 3D.</div>
                  </td>
                  <td className="py-3 px-3 text-center text-neutral-400">Serviço Técnico</td>
                  <td className="py-3 px-4 text-right font-bold text-neutral-800">
                    R$ {formatarPrecoCentavos(calcularPrecoFinalItem(maoDeObraCusto, pesosDistribuicao.maodeobra))}
                  </td>
                </tr>

                {/* Item 2 */}
                <tr>
                  <td className="py-3 px-4 text-center text-neutral-400">02</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-neutral-800">Processamento de Deposição Física</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Uso do equipamento tridimensional, depreciação mecânica e consumo elétrico.</div>
                  </td>
                  <td className="py-3 px-3 text-center text-neutral-400">
                    {tempoMinutos ? `${Math.floor(tempoMinutos/60)}h ${Math.round(tempoMinutos%60)}m` : 'Execução'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-neutral-800">
                    R$ {formatarPrecoCentavos(calcularPrecoFinalItem(maquinaCusto, pesosDistribuicao.maquina))}
                  </td>
                </tr>

                {/* Item 3 */}
                {materiais && materiais.length > 0 && (
                  <tr>
                    <td className="py-3 px-4 text-center text-neutral-400">03</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-neutral-800">Massa Polimérica Extrudada</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Polímeros físicos termoplásticos aplicados no projeto.</div>
                      <div className="mt-1 flex flex-wrap gap-1 font-semibold text-neutral-500">
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
                    <td className="py-3 px-3 text-center text-neutral-400">Massa Líquida</td>
                    <td className="py-3 px-4 text-right font-bold text-neutral-800">
                      R$ {formatarPrecoCentavos(calcularPrecoFinalItem(custoMateriaisTotal, pesosDistribuicao.material))}
                    </td>
                  </tr>
                )}

                {/* Item 4 */}
                {insumos && insumos.length > 0 && (
                  <tr>
                    <td className="py-3 px-4 text-center text-neutral-400">04</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-neutral-800">Insumos Complementares e Montagem</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Parafusos, inserts mecânicos de latão e suportes descartáveis de manufatura.</div>
                      <div className="mt-1 flex flex-wrap gap-1 font-semibold text-neutral-500">
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
                    <td className="py-3 px-3 text-center text-neutral-400">Insumos</td>
                    <td className="py-3 px-4 text-right font-bold text-neutral-800">
                      R$ {formatarPrecoCentavos(calcularPrecoFinalItem(custoInsumosTotal, pesosDistribuicao.insumo))}
                    </td>
                  </tr>
                )}

              </tbody>
            </table>

            {/* Total */}
            <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex justify-end">
              <div className="flex justify-between items-baseline w-52 text-[11px] font-bold">
                <span className="text-neutral-500 uppercase tracking-wider text-[9px]">Valor Final:</span>
                <span className="text-base text-neutral-900 font-extrabold">
                  R$ {formatarPrecoCentavos(precoEmCentavos)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {observacoes && (
          <div className="text-left mb-8 p-4 rounded bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 leading-relaxed">
            <span className="font-bold text-neutral-800 uppercase tracking-wider block mb-1 text-[9px]">Notas Comerciais</span>
            {observacoes}
          </div>
        )}

        {/* Termos e Faturamento */}
        <div className="text-left mb-8 text-[10px] text-neutral-400 leading-relaxed border-t border-neutral-100 pt-5">
          <h5 className="font-bold text-neutral-500 uppercase tracking-wider text-[9px] mb-1.5">Condições Gerais</h5>
          <p>
            O início dos serviços de manufatura depende da confirmação de pagamento e do aceite formal eletrônico nesta página.
          </p>
        </div>

        {/* Assinatura Criptográfica Discreta */}
        <div className="border-t border-neutral-100 pt-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left text-[10px] leading-relaxed text-neutral-400">
          
          <div>
            <span className="font-bold text-neutral-500 uppercase tracking-wider text-[9px] block mb-1.5">Validação do Emitente</span>
            <div className="p-3 border border-neutral-200 rounded bg-neutral-50 font-mono">
              <span>FORNECEDOR: {estudioNomeExibicao}</span>
              <span className="block mt-0.5 text-neutral-400">SHA256: {numeroProposta.slice(0, 8)}...OK</span>
            </div>
          </div>

          <div>
            <span className="font-bold text-neutral-500 uppercase tracking-wider text-[9px] block mb-1.5">Validação do Destinatário</span>
            
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
                      Confirmo a exatidão das especificações acima descritas.
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button 
                      onClick={lidarComAprovacao}
                      disabled={!termoAceite}
                      id="btn-aprovar"
                      className="flex-1 h-9 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400 text-white rounded text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                    >
                      Aprovar Proposta
                    </button>
                    
                    <button 
                      onClick={lidarComRecusa}
                      id="btn-recusar"
                      className="px-3.5 h-9 bg-white hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600 border border-neutral-200 rounded text-[11px] font-bold uppercase transition-all flex items-center justify-center active:scale-[0.98]"
                    >
                      Decline
                    </button>
                  </div>
                </motion.div>
              ) : statusAprovacao === 'aprovado' ? (
                <motion.div 
                  key="aprovado-aceite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 border border-emerald-200 bg-emerald-50/50 rounded font-mono text-emerald-800"
                >
                  <span className="font-bold flex items-center gap-1"><CheckCircle2 size={10} /> ACEITO DIGITALMENTE</span>
                  <span className="block mt-0.5 text-[9px] text-emerald-600">CLIENTE: {nomeClienteExibicao} | HORA: {hoje.toLocaleTimeString('pt-BR')}</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="recusado-aceite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 border border-neutral-300 bg-neutral-100 rounded font-mono text-neutral-600"
                >
                  <span className="font-bold">PROPOSTA DECLINADA</span>
                  <span className="block mt-0.5 text-[9px] text-neutral-400">O estúdio foi notificado sobre a recusa.</span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

    </div>
  );
}
