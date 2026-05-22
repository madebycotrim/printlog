import { Plus, Users, Search } from "lucide-react";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useGerenciadorClientes } from "./hooks/useGerenciadorClientes";
import { CardCliente } from "./componentes/CardCliente";
import { FormularioCliente } from "./componentes/FormularioCliente";
import { ResumoClientes } from "./componentes/ResumoClientes";
import { FiltrosCliente } from "./componentes/FiltrosCliente";
import { ModalRemocaoCliente } from "./componentes/ModalRemocaoCliente";
import { ModalHistoricoCliente } from "./componentes/ModalHistoricoCliente";
import { motion, AnimatePresence } from "framer-motion";
import { EstadoVazio } from "@/compartilhado/componentes";
import { Carregamento } from "@/compartilhado/componentes";

export function PaginaClientes() {
  const { estado, acoes } = useGerenciadorClientes();

  useDefinirCabecalho({
    titulo: "Ecossistema de Clientes",
    subtitulo: "Gestão comercial, CRM e acompanhamento de parceiros",
    placeholderBusca: "Pesquisar por nome, e-mail ou status...",
    acao: {
      texto: "Novo Cadastro",
      icone: Plus,
      aoClicar: () => acoes.abrirEditar(),
    },
    aoBuscar: acoes.pesquisar,
  });

  return (
    <div className="flex-1 flex flex-col space-y-10">
      <AnimatePresence mode="wait">
        {estado.carregando && estado.clientes.length === 0 ? (
          <motion.div
            key="carregando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-40"
          >
            <Carregamento tipo="ponto" mensagem="Sincronizando base comercial..." />
          </motion.div>
        ) : estado.clientes.length === 0 ? (
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
              aoClicarBotao={() => acoes.abrirEditar()}
            />
          </motion.div>
        ) : (
          <motion.div
            key="conteudo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {estado.clientesFiltrados.map((cliente) => (
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
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <FormularioCliente
        aberto={estado.modalAberto}
        clienteEditando={estado.clienteSendoEditado}
        aoCancelar={acoes.fecharEditar}
        aoSalvar={acoes.salvarCliente}
      />

      <ModalRemocaoCliente
        aberto={estado.modalRemoverAberto}
        cliente={estado.clienteSendoRemovido}
        aoFechar={acoes.fecharRemover}
        aoConfirmar={() => estado.clienteSendoRemovido && acoes.removerCliente(estado.clienteSendoRemovido.id)}
      />

      <ModalHistoricoCliente
        aberto={estado.modalHistoricoAberto}
        cliente={estado.clienteSendoHistorico}
        aoFechar={acoes.fecharHistorico}
      />
    </div>
  );
}
