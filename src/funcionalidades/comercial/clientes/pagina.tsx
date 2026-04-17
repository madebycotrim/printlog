import { Plus, Users, Search } from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarGerenciadorClientes } from "./hooks/usarGerenciadorClientes";
import { CardCliente } from "./componentes/CardCliente";
import { FormularioCliente } from "./componentes/FormularioCliente";
import { ResumoClientes } from "./componentes/ResumoClientes";
import { FiltrosCliente } from "./componentes/FiltrosCliente";
import { ModalRemocaoCliente } from "./componentes/ModalRemocaoCliente";
import { ModalHistoricoCliente } from "./componentes/ModalHistoricoCliente";
import { motion, AnimatePresence } from "framer-motion";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";

export function PaginaClientes() {
  const { estado, acoes } = usarGerenciadorClientes();

  usarDefinirCabecalho({
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
    <div className="space-y-10">
      <motion.div
        className="relative space-y-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {estado.carregando && <Carregamento texto="Sincronizando base de clientes..." />}

        {estado.clientes.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum cliente no radar"
            descricao="Sua base de clientes está vazia. Comece cadastrando um cliente VIP para iniciar seu ecossistema."
            icone={Users}
            textoBotao="Novo Cadastro Manual"
            aoClicarBotao={() => acoes.abrirEditar()}
          />
        ) : (
          <>
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
                <Search size={36} strokeWidth={1.5} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-base font-black text-zinc-900 dark:text-white mb-1 uppercase tracking-tight">
                  Nenhum cliente para este filtro
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
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
          </>
        )}
      </motion.div>

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
