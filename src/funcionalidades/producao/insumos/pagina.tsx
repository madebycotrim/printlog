import { Box, Plus, Search } from "lucide-react";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useGerenciadorInsumos } from "./hooks/useGerenciadorInsumos";
import { ResumoInsumos } from "./componentes/ResumoInsumos";
import { CardInsumo } from "./componentes/CardInsumo";
import { ModalGerenciamentoInsumo } from "./componentes/ModalGerenciamentoInsumo";
import { ModalBaixaInsumo } from "./componentes/ModalBaixaInsumo";
import { ModalReposicaoInsumo } from "./componentes/ModalReposicaoInsumo";
import { ModalArquivamentoInsumo } from "./componentes/ModalArquivamentoInsumo";
import { FiltrosInsumo } from "./componentes/FiltrosInsumo";

import { motion, AnimatePresence } from "framer-motion";
import { EstadoVazio } from "@/compartilhado/componentes";
import { Carregamento } from "@/compartilhado/componentes";
import { variantesContainerLista, variantesItemLista } from "@/compartilhado/utilitarios/animacoes";
import { useEffect } from "react";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { servicoInventario } from "@/compartilhado/servicos/servicoInventario";
import { apiMateriais } from "@/funcionalidades/producao/materiais/servicos/apiMateriais";
import { atingiuLimite } from "@/compartilhado/constantes/limites-plano";
import { ModalUpgradePaywall } from "@/compartilhado/componentes/ui";
import { useState } from "react";

function SkeletonInsumos() {
  const kpis = [1, 2, 3, 4];
  const items = [1, 2, 3, 4, 5, 6];
  return (
    <div className="space-y-8 animate-pulse">
      {/* Resumo/KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((i) => (
          <div key={i} className="h-24 bg-card border border-borda-sutil rounded-2xl p-6" />
        ))}
      </div>
      {/* Filtros */}
      <div className="h-14 bg-card border border-borda-sutil rounded-2xl w-full" />
      {/* Lista de Itens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((i) => (
          <div key={i} className="h-44 bg-card border border-borda-sutil rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
            </div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PaginaInsumos() {
  const { estado, acoes } = useGerenciadorInsumos();
  const { materiais, definirMateriais } = useArmazemMateriais();
  const { usuario } = useAutenticacao();
  const [modalPaywallAberto, setModalPaywallAberto] = useState(false);

  const [primeiroCarregamento, setPrimeiroCarregamento] = useState(false);
  useEffect(() => {
    if (!estado.carregando) {
      const temporizador = setTimeout(() => setPrimeiroCarregamento(true), 50);
      return () => clearTimeout(temporizador);
    }
  }, [estado.carregando]);

  const exibindoLoading = !primeiroCarregamento || estado.carregando;

  const tentarNovoInsumo = () => {
    if (atingiuLimite("INSUMOS", estado.insumos.length, usuario?.plano)) {
      setModalPaywallAberto(true);
    } else {
      acoes.abrirEditar();
    }
  };

  // 🔄 SINCRONIZAÇÃO DE MATERIAIS PARA CÁLCULO CONSOLIDADO
  useEffect(() => {
    if (usuario?.uid) {
      apiMateriais.listar(usuario.uid).then(definirMateriais);
    }
  }, [usuario?.uid, definirMateriais]);

  useDefinirCabecalho({
    titulo: "Meus Insumos",
    subtitulo: "Gerencie peças e outros materiais logísticos",
    placeholderBusca: "Buscar insumo (Ex: Álcool Isopropílico)...",
    acao: {
      texto: "Novo Insumo",
      icone: Plus,
      aoClicar: tentarNovoInsumo,
    },
    aoBuscar: acoes.definirFiltroPesquisa,
  });

  const metricasConsolidadas = servicoInventario.gerarRelatorioConsolidado(materiais, estado.insumos);

  return (
    <div className="flex-1 flex flex-col space-y-10">
      <AnimatePresence mode="wait">
        {exibindoLoading ? (
          <motion.div
            key="carregando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            {estado.insumos.length > 0 ? (
              <SkeletonInsumos />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-40">
                <Carregamento tipo="ponto" mensagem="Carregando insumos..." />
              </div>
            )}
          </motion.div>
        ) : estado.insumos.length === 0 ? (
          <motion.div
            key="vazio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col"
          >
            <EstadoVazio
              titulo="Nenhum insumo encontrado"
              descricao="Adicione o seu primeiro insumo para gerenciar o seu estoque de apoio logístico."
              icone={Box}
              textoBotao="Cadastrar Insumo"
              aoClicarBotao={tentarNovoInsumo}
            />
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ResumoInsumos
              materiais={materiais}
              insumos={estado.insumos}
              totalItensUnicos={estado.kpis.totalItens}
              valorInvestido={metricasConsolidadas.valorTotalInsumosCentavos}
              alertasBaixoEstoque={metricasConsolidadas.itensEmAlerta}
            />

            <div className="mt-8">
              <FiltrosInsumo
                filtroAtual={estado.filtroCategoria}
                aoFiltrar={acoes.definirFiltroCategoria}
                ordenacaoAtual={estado.ordenacao}
                aoOrdenar={acoes.definirOrdenacao}
                ordemInvertida={estado.ordemInvertida}
                aoInverterOrdem={acoes.inverterOrdem}
              />
            </div>

            {estado.agrupadosPorCategoria.length === 0 && estado.insumos.length > 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search size={36} strokeWidth={1.5} className="text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-base font-bold text-primary mb-1 uppercase tracking-tight">Nenhum resultado encontrado</h3>
                <p className="text-sm text-muted-foreground">Tente buscar com termos diferentes.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                <AnimatePresence mode="popLayout">
                  {estado.agrupadosPorCategoria.map(([categoria, lista]) => (
                    <motion.div
                      layout
                      key={categoria}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-primary uppercase tracking-tight">
                            {categoria}
                          </h3>
                          <span className="px-2.5 py-1 rounded-lg bg-muted/60 dark:bg-[#27272a] border border-borda-sutil text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center h-6 leading-none shadow-sm">
                            {lista.length} INSUMO{lista.length !== 1 ? "S" : ""}
                          </span>
                        </div>
                        <div className="flex-1 h-px bg-borda-sutil/40" />
                      </div>

                      <motion.div 
                        variants={variantesContainerLista}
                        initial="inicial"
                        animate="animar"
                        className="grid grid-cols-1 xl:grid-cols-2 gap-4"
                      >
                        {lista.map((ins) => (
                          <motion.div key={ins.id} variants={variantesItemLista} layout>
                            <CardInsumo
                              insumo={ins}
                              aoEditar={acoes.abrirEditar}
                              aoBaixar={acoes.abrirBaixa}
                              aoExcluir={acoes.abrirArquivamento}
                              aoRepor={acoes.abrirReposicao}
                              aoVerHistorico={acoes.abrirHistorico}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ModalGerenciamentoInsumo 
        aberto={estado.modalCricaoAberto || estado.modalHistoricoAberto || estado.modalBaixaAberto || estado.modalReposicaoAberto}
        insumo={estado.insumoEditando || estado.insumoHistorico || estado.insumoBaixa || estado.insumoReposicao}
        abaInicial={
          estado.modalHistoricoAberto ? "historico" : 
          estado.modalCricaoAberto ? "config" : 
          "estoque"
        }
        aoFechar={() => {
          acoes.fecharEditar();
          acoes.fecharHistorico();
          acoes.fecharBaixa();
          acoes.fecharReposicao();
        }}
        aoSalvar={acoes.salvarInsumo}
        aoBaixar={(ins) => {
          // Mantemos o modal de confirmação de baixa específico por ser um processo crítico
          acoes.abrirBaixa(ins);
        }}
        aoRepor={(ins) => {
          // Mantemos o modal de confirmação de reposição específico
          acoes.abrirReposicao(ins);
        }}
      />

      <ModalBaixaInsumo
        aberto={estado.modalBaixaAberto && !estado.modalHistoricoAberto && !estado.modalCricaoAberto}
        insumo={estado.insumoBaixa}
        aoFechar={acoes.fecharBaixa}
        aoConfirmar={acoes.confirmarBaixaInsumo}
      />

      <ModalReposicaoInsumo
        aberto={estado.modalReposicaoAberto && !estado.modalHistoricoAberto && !estado.modalCricaoAberto}
        insumo={estado.insumoReposicao}
        aoFechar={acoes.fecharReposicao}
        aoConfirmar={acoes.confirmarReposicaoInsumo}
      />

      <ModalArquivamentoInsumo
        aberto={estado.modalArquivamentoAberto}
        insumo={estado.insumoArquivamento}
        aoFechar={acoes.fecharArquivamento}
        aoConfirmar={acoes.confirmarArquivamento}
      />

      <ModalUpgradePaywall
        aberto={modalPaywallAberto}
        aoFechar={() => setModalPaywallAberto(false)}
        recurso="Insumos"
        aoFazerUpgrade={() => {
          window.location.href = "/dashboard";
        }}
      />
    </div>
  );
}
