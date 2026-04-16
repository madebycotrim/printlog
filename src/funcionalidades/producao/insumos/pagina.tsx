import { Box, Plus, Search } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarGerenciadorInsumos } from "./hooks/usarGerenciadorInsumos";
import { ResumoInsumos } from "./componentes/ResumoInsumos";
import { CardInsumo } from "./componentes/CardInsumo";
import { FormularioInsumo } from "./componentes/FormularioInsumo";
import { ModalBaixaInsumo } from "./componentes/ModalBaixaInsumo";
import { ModalReposicaoInsumo } from "./componentes/ModalReposicaoInsumo";
import { ModalArquivamentoInsumo } from "./componentes/ModalArquivamentoInsumo";
import { ModalHistoricoInsumo } from "./componentes/ModalHistoricoInsumo";
import { FiltrosInsumo } from "./componentes/FiltrosInsumo";

import { motion, AnimatePresence } from "framer-motion";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";

export function PaginaInsumos() {
  const { estado, acoes } = usarGerenciadorInsumos();

  usarDefinirCabecalho({
    titulo: "Meus Insumos",
    subtitulo: "Gerencie peças e outros materiais logísticos",
    placeholderBusca: "Buscar insumo (Ex: Álcool Isopropílico)...",
    acao: {
      texto: "Novo Insumo",
      icone: Plus,
      aoClicar: () => acoes.abrirEditar(),
    },
    aoBuscar: acoes.definirFiltroPesquisa,
  });

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {estado.carregando && estado.insumos.length > 0 && (
          <Carregamento tipo="global" mensagem="Carregando insumos..." />
        )}
        {estado.insumos.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum insumo encontrado"
            descricao="Adicione o seu primeiro insumo para gerenciar o seu estoque de apoio logístico."
            icone={Box}
            textoBotao="Cadastrar Insumo"
            aoClicarBotao={() => acoes.abrirEditar()}
          />
        ) : (
          <div className=" ">
            <ResumoInsumos
              totalItensUnicos={estado.kpis.totalItens}
              valorInvestido={estado.kpis.valorInvestido}
              alertasBaixoEstoque={estado.kpis.alertasBaixoEstoque}
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
                <Search size={36} strokeWidth={1.5} className="text-gray-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Nenhum resultado encontrado</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400">Tente buscar com termos diferentes.</p>
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
                          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {categoria}
                          </h3>
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#27272a] border border-gray-200 dark:border-zinc-700/50 text-[10px] font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest flex items-center h-6 leading-none shadow-sm">
                            {lista.length} INSUMO{lista.length !== 1 ? "S" : ""}
                          </span>
                        </div>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
                      </div>

                      <div className="flex flex-col bg-white dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-white/5">
                        {lista.map((ins, index) => (
                          <CardInsumo
                            key={ins.id}
                            insumo={ins}
                            ultimo={index === lista.length - 1}
                            aoEditar={acoes.abrirEditar}
                            aoBaixar={acoes.abrirBaixa}
                            aoExcluir={acoes.abrirArquivamento}
                            aoRepor={acoes.abrirReposicao}
                            aoVerHistorico={acoes.abrirHistorico}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* MODAIS DE APOIO */}
      <FormularioInsumo
        aberto={estado.modalCricaoAberto}
        insumoEditando={estado.insumoEditando}
        aoCancelar={acoes.fecharEditar}
        aoSalvar={acoes.salvarInsumo}
      />

      <ModalBaixaInsumo
        aberto={estado.modalBaixaAberto}
        insumo={estado.insumoBaixa}
        aoFechar={acoes.fecharBaixa}
        aoConfirmar={acoes.confirmarBaixaInsumo}
      />

      <ModalReposicaoInsumo
        aberto={estado.modalReposicaoAberto}
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

      <ModalHistoricoInsumo
        aberto={estado.modalHistoricoAberto}
        aoFechar={acoes.fecharHistorico}
        insumo={estado.insumoHistorico}
      />
    </div>
  );
}
