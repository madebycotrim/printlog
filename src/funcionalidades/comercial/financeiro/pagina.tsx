import { Plus, ReceiptText, Search, FileBarChart, Sliders, TrendingUp, Zap as ZapIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarBeta } from "@/compartilhado/contextos/ContextoBeta";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { ResumoFinanceiroComponente } from "./componentes/ResumoFinanceiro";
import { TabelaLancamentos } from "./componentes/TabelaLancamentos";
import { FormularioLancamento } from "./componentes/FormularioLancamento";
import { FiltrosFinanceiro } from "./componentes/FiltrosFinanceiro";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";
import { usarFinanceiro } from "./hooks/usarFinanceiro";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { servicoFinanceiroAvancado } from "@/compartilhado/servicos/servicoFinanceiroAvancado";

export function PaginaFinanceiro() {
  const [modalAberto, setModalAberto] = useState(false);
  const {
    lancamentos,
    lancamentosFiltrados,
    resumo,
    carregando,
    adicionarLancamento,
    filtroTipo,
    ordenacao,
    ordemInvertida,
    definirFiltroTipo,
    ordenarPor,
    inverterOrdem,
    pesquisar,
  } = usarFinanceiro();
  const { betaSimuladorMargem } = usarBeta();

  // Estados do Simulador Beta
  const [simulaAcrescimoMargem, setSimulaAcrescimoMargem] = useState(0);
  const [simulaBandeiraEnergia, setSimulaBandeiraEnergia] = useState(1);

  const materiais = usarArmazemMateriais((s) => s.materiais);
  const { pedidos } = usarPedidos();

  const dre = useMemo(
    () => servicoFinanceiroAvancado.gerarDRE(pedidos, lancamentos, materiais),
    [pedidos, lancamentos, materiais],
  );

  usarDefinirCabecalho({
    titulo: "Fluxo de Caixa",
    subtitulo: "Acompanhamento detalhado de rentabilidade e saúde financeira",
    placeholderBusca: "Buscar transações, categorias ou referências...",
    aoBuscar: pesquisar,
    acao: {
      texto: "Registrar Transação",
      icone: Plus,
      aoClicar: () => setModalAberto(true),
    },
  });

  return (
    <div className="space-y-10 min-h-[60vh] flex flex-col">
      <AnimatePresence mode="wait">
        {carregando && lancamentos.length === 0 ? (
          <motion.div
            key="carregando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-40"
          >
            <Carregamento tipo="ponto" mensagem="Calculando rentabilidade e fluxo..." />
          </motion.div>
        ) : lancamentos.length === 0 ? (
          <motion.div
            key="vazio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <EstadoVazio
              titulo="Fluxo de caixa vazio"
              descricao="Comece registrando suas contas para visualizar sua rentabilidade e margem de lucro real."
              icone={ReceiptText}
              textoBotao="Novo Lançamento"
              aoClicarBotao={() => setModalAberto(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-8"
          >
            <ResumoFinanceiroComponente resumo={resumo} lucratividadePercentual={dre.lucratividadePercentual} />

            {/* Banner de Status DRE Premium */}
            <div className={`
              relative overflow-hidden p-8 rounded-[2rem] border transition-all duration-700 shadow-lg group
              ${dre.lucroLiquidoCentavos >= 0 
                ? "bg-gradient-to-br from-zinc-900 to-emerald-900/40 border-emerald-500/20 shadow-emerald-500/5" 
                : "bg-gradient-to-br from-zinc-900 to-rose-900/40 border-rose-500/20 shadow-rose-500/5"}
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
              </div>
            </div>

            {/* SIMULADOR DE MARGEM (BETA) */}
            {betaSimuladorMargem && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 p-6 rounded-3xl bg-zinc-900 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-500">
                   <Sliders size={180} />
                </div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">Simulador de Margem DRE</h3>
                      <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">IA Lab</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Estresse seu DRE e veja o impacto financeiro no Saldo Livre.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Controle de Margem */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Aumento de Preço (Repasse)</label>
                        <span className="text-sm font-black text-indigo-400">+{simulaAcrescimoMargem}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={simulaAcrescimoMargem} 
                        onChange={(e) => setSimulaAcrescimoMargem(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Controle de Energia */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1"><ZapIcon size={12}/> Bandeira Tarifária (Energia)</label>
                        <span className="text-sm font-black text-amber-500">{simulaBandeiraEnergia === 1 ? "Verde" : simulaBandeiraEnergia === 1.2 ? "Amarela (+20%)" : "Vermelha (+50%)"}</span>
                      </div>
                      <input 
                        type="range" min="1" max="1.5" step="0.2"
                        value={simulaBandeiraEnergia} 
                        onChange={(e) => setSimulaBandeiraEnergia(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-center text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Lucro Simulado Projetado</span>
                    <span className={`text-4xl font-black ${dre.lucroLiquidoCentavos + (dre.receitaBrutaCentavos * (simulaAcrescimoMargem/100)) - (dre.receitaBrutaCentavos * 0.1 * (simulaBandeiraEnergia - 1)) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {centavosParaReais(dre.lucroLiquidoCentavos + (dre.receitaBrutaCentavos * (simulaAcrescimoMargem/100)) - (dre.receitaBrutaCentavos * 0.1 * (simulaBandeiraEnergia - 1)))}
                    </span>
                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                       <span className="text-zinc-500">Nova Rentabilidade:</span>
                       <span className="font-bold text-white">{(dre.lucratividadePercentual + simulaAcrescimoMargem - ((simulaBandeiraEnergia - 1) * 10)).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <FiltrosFinanceiro
              tipoAtivo={filtroTipo}
              aoMudarTipo={definirFiltroTipo}
              ordenacaoAtual={ordenacao}
              aoOrdenar={ordenarPor}
              ordemInvertida={ordemInvertida}
              aoInverterOrdem={inverterOrdem}
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
                  <TabelaLancamentos lancamentos={lancamentosFiltrados} />
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <FormularioLancamento
        aberto={modalAberto}
        aoCancelar={() => setModalAberto(false)}
        aoSalvar={adicionarLancamento}
      />
    </div>
  );
}
