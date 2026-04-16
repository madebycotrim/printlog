import { Plus, Users, Search, Globe, Zap } from "lucide-react";
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
import { servicoIntegracaoLanding } from "./servicos/servicoIntegracaoLanding";
import toast from "react-hot-toast";

export function PaginaClientes() {
  const { estado, acoes } = usarGerenciadorClientes();

  const simularPedidoLanding = async () => {
    const nomes = ["Ricardo Oliveira", "Mariana Santos", "TechCorp Soluções", "Estúdio Criativo", "Felipe Almeida"];
    const projetos = [
      "Prototipagem de Engrenagem",
      "Case Personalizado iPhone",
      "Miniatura de RPG Dragon",
      "Peça Reposição Drone",
      "Arquitetura Maquete",
    ];

    const randomNome = nomes[Math.floor(Math.random() * nomes.length)];
    const randomProjeto = projetos[Math.floor(Math.random() * projetos.length)];

    toast.promise(
      servicoIntegracaoLanding.receberNovoPedido({
        nomeCliente: randomNome,
        emailCliente: `${randomNome.toLowerCase().replace(" ", ".")}@exemplo.com`,
        telefoneCliente: "(11) 98888-7777",
        descricaoProjeto: randomProjeto,
        arquivoNome: "modelo_3d_v1.stl",
      }),
      {
        loading: "Simulando recebimento de pedido via Landing Page...",
        success: "Novo Pedido & Cliente Prospect integrados!",
        error: "Falha na simulação.",
      },
    );
  };

  usarDefinirCabecalho({
    titulo: "Ecossistema de Clientes",
    subtitulo: "Gestão comercial, CRM e conformidade LGPD",
    placeholderBusca: "Pesquisar por nome, e-mail ou tag de status...",
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

        {/* Banner de Integração (Dica Visual) */}
        <div className="bg-sky-500/5 border border-sky-500/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Globe size={200} />
          </div>
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Globe size={16} className="text-sky-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-500">
                Conexão Landing Page
              </span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">Captação Automática Ativa</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 max-w-md">
              Seus formulários públicos estão conectados. Novos orçamentos geram prospects automaticamente aqui e ordens
              de serviço no quadro de produção.
            </p>
          </div>
          <button
            onClick={simularPedidoLanding}
            className="relative z-10 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all flex items-center gap-3"
          >
            <Zap size={16} className="fill-amber-500 text-amber-500" />
            Simular Lead Landing Page
          </button>
        </div>

        {estado.clientes.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum cliente no radar"
            descricao="Sua base de clientes está vazia. Comece cadastrando um cliente VIP ou aguarde entradas via Landing Page."
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
