import { Plus, Printer, Search } from "lucide-react";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useGerenciadorImpressoras } from "./hooks/useGerenciadorImpressoras";
import { FormularioImpressora } from "./componentes/FormularioImpressora";
import { CardImpressora } from "./componentes/CardImpressora";
import { ResumoImpressoras } from "./componentes/ResumoImpressoras";
import { FiltrosImpressora } from "./componentes/FiltrosImpressora";
import { ModalGerenciamentoImpressora } from "./componentes/ModalGerenciamentoImpressora";
import { ModalAposentarImpressora } from "./componentes/ModalAposentarImpressora";

import { motion, AnimatePresence } from "framer-motion";
import { EstadoVazio } from "@/compartilhado/componentes";
import { variantesContainerLista, variantesItemLista } from "@/compartilhado/utilitarios/animacoes";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { atingiuLimite } from "@/compartilhado/constantes/limites-plano";
import { ModalUpgradePaywall } from "@/compartilhado/componentes/ui";
import { useState } from "react";


export function PaginaImpressoras() {
  const { estado, acoes } = useGerenciadorImpressoras();
  const { usuario } = useAutenticacao();
  const [modalPaywallAberto, setModalPaywallAberto] = useState(false);



  const tentarNovaMaquina = () => {
    if (atingiuLimite("IMPRESSORAS", estado.totais.total, usuario?.plano)) {
      setModalPaywallAberto(true);
    } else {
      acoes.abrirEditar();
    }
  };

  useDefinirCabecalho({
    titulo: "Minhas Impressoras",
    subtitulo: "Gerencie seu parque de máquinas",
    placeholderBusca: "Buscar impressora (Ex: Kobra S1)...",
    acao: {
      texto: "Nova Máquina",
      icone: Plus,
      aoClicar: tentarNovaMaquina,
    },
    aoBuscar: acoes.pesquisar,
  });

  return (
    <div className="flex-1 flex flex-col space-y-10">
      <AnimatePresence mode="wait">
        {!estado.carregando && estado.totais.total === 0 ? (
          <motion.div
            key="vazio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col"
          >
            <EstadoVazio
              titulo="Nenhuma impressora ativa"
              descricao="Para calcular custos com precisão, precisamos saber qual máquina você usa."
              icone={Printer}
              textoBotao="Cadastrar Máquina"
              aoClicarBotao={tentarNovaMaquina}
            >
              <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl mt-4">
                <p className="text-xs font-medium text-sky-600 dark:text-sky-400">
                  <strong className="font-black uppercase tracking-wider text-[10px]">💡 Dica:</strong> Cadastre a sua impressora mesmo se você não souber todos os detalhes técnicos no momento.
                </p>
              </div>
            </EstadoVazio>
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full"
          >
            {estado.totais.total > 0 && (
              <>
            <AnimatePresence>
              {estado.carregando && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="fixed top-24 right-10 z-[100] flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-xl border border-borda-sutil rounded-full shadow-2xl pointer-events-none"
                >
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Sincronizando
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <ResumoImpressoras
              totalMaquinas={estado.totais.total}
              horasImpressao={estado.totais.horasImpressao}
              emManutencao={estado.totais.manutencao}
              requerAtencao={estado.totais.requerAtencao}
              valorInvestido={estado.totais.valorInvestido}
            />

            <div className="mt-8">
              <FiltrosImpressora
                filtroAtual={estado.filtroTecnologia}
                aoFiltrar={acoes.filtrarPorTecnologia}
                ordenacaoAtual={estado.ordenacao}
                aoOrdenar={acoes.ordenarPor}
                ordemInvertida={estado.ordemInvertida}
                aoInverterOrdem={acoes.inverterOrdem}
              />
            </div>

             {estado.impressorasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-2xl border border-dashed border-borda-sutil">
                <Search size={40} strokeWidth={1} className="text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-lg font-black text-primary mb-2 uppercase tracking-tight">Nenhum resultado</h3>
                <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                  Não encontramos máquinas com os critérios atuais de busca ou filtros.
                </p>
                <button
                  onClick={() => {
                    acoes.pesquisar("");
                    acoes.filtrarPorTecnologia("Todas");
                  }}
                  className="px-6 py-3 bg-card border border-borda-sutil rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted/80 transition-all shadow-sm"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                <AnimatePresence mode="popLayout">
                  {estado.agrupadasPorTecnologia.map(([tecnologia, lista]) => (
                    <motion.div
                      layout
                      key={tecnologia}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-primary uppercase tracking-tight">
                            {tecnologia}
                          </h3>
                          <span className="px-2.5 py-1 rounded-lg bg-muted/60 dark:bg-[#27272a] border border-borda-sutil text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center h-6 leading-none shadow-sm">
                            {lista.length} ITEM{lista.length !== 1 ? "S" : ""}
                          </span>
                        </div>
                        <div className="flex-1 h-px bg-borda-sutil/40" />
                      </div>

                        <motion.div 
                          variants={variantesContainerLista}
                          initial="inicial"
                          animate="animar"
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                        >
                          {lista.map((impressora) => (
                            <motion.div key={impressora.id} variants={variantesItemLista} layout>
                              <CardImpressora
                                impressora={impressora}
                                aoAposentar={acoes.abrirAposentar}
                                aoGerenciamento={acoes.abrirGerenciamento}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <FormularioImpressora
        aberto={estado.modalAberto}
        impressoraEditando={estado.impressoraSendoEditada}
        aoCancelar={acoes.fecharEditar}
        aoSalvar={acoes.salvarImpressora}
      />

      <ModalGerenciamentoImpressora
        aberto={estado.modalGerenciamentoAberto}
        impressora={estado.impressoraGerenciamento}
        abaInicial={estado.abaGerenciamentoInicial}
        aoFechar={acoes.fecharGerenciamento}
        aoSalvarCadastro={acoes.salvarImpressora}
      />

      <ModalAposentarImpressora
        aberto={estado.modalAposentarAberto}
        impressora={estado.impressoraParaAposentar}
        aoFechar={acoes.fecharAposentar}
        aoConfirmar={acoes.confirmarAposentadoria}
      />

      <ModalUpgradePaywall
        aberto={modalPaywallAberto}
        aoFechar={() => setModalPaywallAberto(false)}
        recurso="Impressoras"
        aoFazerUpgrade={() => {
          // TODO: Direcionar para checkout real. 
          // Por enquanto simulamos chamando algo ou apenas fechando,
          // o BannerPro no Dashboard também faz isso.
          window.location.href = "/dashboard";
        }}
      />
    </div>
  );
}
