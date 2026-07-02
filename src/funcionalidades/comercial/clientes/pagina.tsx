import { Plus, Users, Search } from "lucide-react";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useGerenciadorClientes } from "./hooks/useGerenciadorClientes";
import { CardCliente } from "./componentes/CardCliente";
import { ModalGerenciamentoCliente } from "./componentes/ModalGerenciamentoCliente";
import { ResumoClientes } from "./componentes/ResumoClientes";
import { FiltrosCliente } from "./componentes/FiltrosCliente";
import { ModalRemocaoCliente } from "./componentes/ModalRemocaoCliente";
import { motion, AnimatePresence } from "framer-motion";
import { EstadoVazio } from "@/compartilhado/componentes";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { atingiuLimite } from "@/compartilhado/constantes/limites-plano";
import { ModalUpgradePaywall, BannerErro } from "@/compartilhado/componentes/ui";
import { useState, useEffect } from "react";
import { useVirtualizacao } from "@/compartilhado/hooks/useVirtualizacao";



export function PaginaClientes() {
  const { estado, acoes } = useGerenciadorClientes();
  const { usuario } = useAutenticacao();
  const [modalPaywallAberto, setModalPaywallAberto] = useState(false);



  const [colunas, setColunas] = useState(4);
  useEffect(() => {
    const calcularColunas = () => {
      const w = window.innerWidth;
      if (w < 768) return setColunas(1);
      if (w < 1024) return setColunas(2);
      if (w < 1280) return setColunas(3);
      return setColunas(4);
    };
    calcularColunas();
    window.addEventListener("resize", calcularColunas);
    return () => window.removeEventListener("resize", calcularColunas);
  }, []);

  const { containerRef, itensVisiveis, paddingTop, paddingBottom } = useVirtualizacao(
    estado.clientesFiltrados,
    280, // altura aproximada do card de cliente em pixels
    colunas
  );



  const tentarNovoCliente = () => {
    if (atingiuLimite("CLIENTES", estado.clientes.length, usuario?.plano)) {
      setModalPaywallAberto(true);
    } else {
      acoes.abrirEditar();
    }
  };

  useDefinirCabecalho({
    titulo: "Ecossistema de Clientes",
    subtitulo: "Gestão comercial, CRM e acompanhamento de parceiros",
    placeholderBusca: "Pesquisar por nome, e-mail ou status...",
    acao: {
      texto: "Novo Cadastro",
      icone: Plus,
      aoClicar: tentarNovoCliente,
    },
    aoBuscar: acoes.pesquisar,
  });

  if (estado.erro) {
    return (
      <BannerErro 
        titulo="Falha ao carregar clientes" 
        aoTentarNovamente={acoes.recarregar} 
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-10">
      <AnimatePresence mode="wait">
        {estado.carregando ? null : estado.clientes.length === 0 ? (
          <motion.div
            key="vazio"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col"
          >
            <EstadoVazio
              titulo="Nenhum cliente no radar"
              descricao="Sua base de clientes está vazia. Comece cadastrando um cliente VIP para iniciar seu ecossistema."
              icone={Users}
              textoBotao="Novo Cadastro Manual"
              aoClicarBotao={tentarNovoCliente}
            />
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative space-y-8"
          >
            <ResumoClientes clientes={estado.clientes} />

            <div className="mt-8">
              <FiltrosCliente
                ordenacaoAtual={estado.ordenacao}
                aoOrdenar={acoes.ordenarPor}
                ordemInvertida={estado.ordemInvertida}
                aoInverterOrdem={acoes.inverterOrdem}
              />
            </div>

            {estado.clientesFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search size={36} strokeWidth={1.5} className="text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-base font-black text-primary mb-1 uppercase tracking-tight">
                  Nenhum cliente para este filtro
                </h3>
                <p className="text-sm text-muted-foreground italic">
                  Tente buscar com termos diferentes ou ajuste a ordem.
                </p>
              </div>
            ) : (
              <div 
                ref={containerRef}
                className="max-h-[68vh] overflow-y-auto pr-2 scrollbar-premium"
                style={{ contentVisibility: 'auto' }}
              >
                <div 
                  style={{
                    paddingTop: `${paddingTop}px`,
                    paddingBottom: `${paddingBottom}px`,
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {itensVisiveis.map((cliente) => (
                      <CardCliente
                        key={cliente.id}
                        cliente={cliente}
                        aoEditar={acoes.abrirEditar}
                        aoRemover={acoes.abrirRemover}
                        aoVerHistorico={acoes.abrirHistorico}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                
                {/* Gatilho para Scroll Infinito */}
                {estado.temMais && !estado.carregando && (
                  <div 
                    className="w-full flex justify-center py-8"
                    ref={(node) => {
                      if (!node) return;
                      const observer = new IntersectionObserver((entries) => {
                        if (entries[0].isIntersecting && estado.temMais && acoes.carregarMais) {
                          acoes.carregarMais();
                        }
                      }, { threshold: 0.1, rootMargin: "200px" });
                      observer.observe(node);
                      return () => observer.disconnect();
                    }}
                  >
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Unificado e Modularizado com Abas */}
      <ModalGerenciamentoCliente
        aberto={estado.modalAberto || estado.modalHistoricoAberto}
        cliente={estado.clienteSendoEditado || estado.clienteSendoHistorico}
        aoFechar={() => {
          acoes.fecharEditar();
          acoes.fecharHistorico();
        }}
        aoSalvar={acoes.salvarCliente}
        abaInicial={estado.modalHistoricoAberto ? "historico" : "config"}
      />

      <ModalRemocaoCliente
        aberto={estado.modalRemoverAberto}
        cliente={estado.clienteSendoRemovido}
        aoFechar={acoes.fecharRemover}
        aoConfirmar={() => estado.clienteSendoRemovido && acoes.removerCliente(estado.clienteSendoRemovido.id)}
      />

      <ModalUpgradePaywall
        aberto={modalPaywallAberto}
        aoFechar={() => setModalPaywallAberto(false)}
        recurso="Clientes (CRM)"
        aoFazerUpgrade={() => {
          window.location.href = "/dashboard";
        }}
      />
    </div>
  );
}
