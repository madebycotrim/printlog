import { Plus, ReceiptText, Search, FileBarChart } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { ResumoFinanceiroComponente } from "./componentes/ResumoFinanceiro";
import { GraficoFluxoCaixa } from "./componentes/GraficoFluxoCaixa";
import { TabelaLancamentos } from "./componentes/TabelaLancamentos";
import { FormularioLancamento } from "./componentes/FormularioLancamento";
import { FiltrosFinanceiro } from "./componentes/FiltrosFinanceiro";
import { exportarLancamentosCSV } from "./utilitarios/exportadorCSV";
import { EstadoVazio } from "@/compartilhado/componentes";
import { BannerErro } from "@/compartilhado/componentes/ui";
import { useFinanceiro } from "./hooks/useFinanceiro";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usePedidos } from "@/funcionalidades/producao/projetos/hooks/usePedidos";
import { servicoFinanceiroAvancado } from "@/compartilhado/servicos/servicoFinanceiroAvancado";
import { ModalDREDetalhado } from "./componentes/ModalDREDetalhado";
import { LancamentoFinanceiro } from "./tipos";


export function PaginaFinanceiro() {
  const [modalAberto, setModalAberto] = useState(false);
  const [lancamentoSendoEditado, setLancamentoSendoEditado] = useState<LancamentoFinanceiro | null>(null);

  const {
    lancamentos,
    lancamentosFiltrados,
    resumo,
    carregando,
    adicionarLancamento,
    atualizarLancamento,
    removerLancamento,
    filtroTipo,
    ordenacao,
    ordemInvertida,
    definirFiltroTipo,
    ordenarPor,
    inverterOrdem,
    pesquisar,
    erro,
    recarregar,
  } = useFinanceiro();



  const [dreAberto, setDreAberto] = useState(false);

  const materiais = useArmazemMateriais((s) => s.materiais);
  const { pedidos } = usePedidos();
  const { impressoras } = useArmazemImpressoras();
  const config = useArmazemConfiguracoes();

  const dre = useMemo(
    () => servicoFinanceiroAvancado.gerarDRE(pedidos, lancamentos, materiais, impressoras, config.custoEnergia),
    [pedidos, lancamentos, materiais, impressoras, config.custoEnergia],
  );

  const abrirNovoLancamento = () => {
    setLancamentoSendoEditado(null);
    setModalAberto(true);
  };

  const abrirEdicaoLancamento = (lancamento: LancamentoFinanceiro) => {
    setLancamentoSendoEditado(lancamento);
    setModalAberto(true);
  };

  useDefinirCabecalho({
    titulo: "Fluxo de Caixa",
    subtitulo: "Acompanhamento detalhado de rentabilidade e saúde financeira",
    placeholderBusca: "Buscar transações, categorias ou referências...",
    aoBuscar: pesquisar,
    acao: {
      texto: "Registrar Transação",
      icone: Plus,
      aoClicar: abrirNovoLancamento,
    },
  });

  if (erro) {
    return (
      <BannerErro 
        titulo="Falha ao carregar dados financeiros" 
        aoTentarNovamente={recarregar} 
      />
    );
  }

  return (
    <div className="flex-1 w-full h-full space-y-10 flex flex-col">
      <AnimatePresence mode="wait">
        {carregando ? null : lancamentos.length === 0 ? (
          <motion.div
            key="vazio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col w-full items-center justify-center min-h-[50vh]"
          >
            <EstadoVazio
              titulo="Fluxo de caixa vazio"
              descricao="Comece registrando suas contas para visualizar sua rentabilidade e margem de lucro real."
              icone={ReceiptText}
              textoBotao="Novo Lançamento"
              aoClicarBotao={abrirNovoLancamento}
            />
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="space-y-8"
          >
            <ResumoFinanceiroComponente resumo={resumo} lucratividadePercentual={dre.lucratividadePercentual} />
            <GraficoFluxoCaixa lancamentos={lancamentosFiltrados} />

            {/* Banner de Status DRE Premium */}
            <div className={`
              relative overflow-hidden p-8 rounded-[2rem] border transition-all duration-700 shadow-lg group
              ${dre.lucroLiquidoCentavos >= 0 
                ? "bg-gradient-to-br from-zinc-900 dark:from-zinc-900 to-emerald-800/80 dark:to-emerald-900/40 border-emerald-500/20 shadow-emerald-500/5" 
                : "bg-gradient-to-br from-zinc-900 dark:from-zinc-900 to-rose-800/80 dark:to-rose-900/40 border-rose-500/20 shadow-rose-500/5"}
            `}>
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                <FileBarChart size={200} className={dre.lucroLiquidoCentavos >= 0 ? "text-emerald-500" : "text-rose-500"} />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${dre.lucroLiquidoCentavos >= 0 ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-rose-500 shadow-lg shadow-rose-500/50"}`} />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    Performance de Lucratividade
                  </h4>
                </div>
                
                <div className="max-w-2xl">
                  <p className="text-sm font-medium text-zinc-300 leading-relaxed">
                    Com base no Mix de Produção atual, seu estúdio está operando com uma margem de segurança de{" "}
                    <strong className={`text-xl font-black tabular-nums mx-1 ${dre.lucroLiquidoCentavos >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {dre.lucratividadePercentual}%
                    </strong>. 
                    <span className="block mt-2 opacity-60 text-xs italic font-normal">
                      Este cálculo considera o preço médio de venda versus o consumo granular de filamento e custos operacionais ativos em configurações.
                    </span>
                  </p>
                </div>
                <div className="mt-4 pt-2 flex justify-start">
                  <button
                    onClick={() => setDreAberto(true)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-white/10 cursor-pointer"
                  >
                    Ver DRE Completo
                  </button>
                </div>
              </div>
            </div>

            <FiltrosFinanceiro
              tipoAtivo={filtroTipo}
              aoMudarTipo={definirFiltroTipo}
              ordenacaoAtual={ordenacao}
              aoOrdenar={ordenarPor}
              ordemInvertida={ordemInvertida}
              aoInverterOrdem={inverterOrdem}
              aoExportarCSV={() => exportarLancamentosCSV(lancamentosFiltrados)}
            />

            {lancamentosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Search size={36} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-base font-black text-zinc-900 dark:text-white">Nenhum lançamento filtrado</h3>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filtroTipo}-${ordenacao}-${ordemInvertida}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabelaLancamentos 
                    lancamentos={lancamentosFiltrados} 
                    aoExcluir={removerLancamento}
                    aoEditar={abrirEdicaoLancamento}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <FormularioLancamento
        aberto={modalAberto}
        lancamentoEditando={lancamentoSendoEditado}
        aoCancelar={() => {
          setModalAberto(false);
          setLancamentoSendoEditado(null);
        }}
        aoSalvar={async (dados) => {
          if (lancamentoSendoEditado) {
            await atualizarLancamento({ ...dados, id: lancamentoSendoEditado.id } as any);
          } else {
            await adicionarLancamento(dados);
          }
          setModalAberto(false);
          setLancamentoSendoEditado(null);
        }}
      />

      <ModalDREDetalhado
        aberto={dreAberto}
        aoFechar={() => setDreAberto(false)}
        dre={dre}
      />
    </div>
  );
}
