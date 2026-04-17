import { usarArmazemClientes } from "../estado/armazemClientes";
import { Cliente, BaseLegalLGPD, StatusComercial } from "../tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { ErroValidacao, CodigoErro } from "@/compartilhado/utilitarios/excecoes";
import { useMemo } from "react";

/**
 * Hook de domínio para gerenciamento de clientes.
 * Encapsula lógica de CRUD e filtragem simples.
 */
export function usarGerenciadorClientes() {
  const estado = usarArmazemClientes();

  // 🔍 Lógica de Filtragem e Ordenação
  const clientesFiltrados = useMemo(() => {
    let resultado = [...estado.clientes];

    // Busca (Nome, Email ou Telefone)
    if (estado.filtroBusca) {
      const termo = estado.filtroBusca.toLowerCase();
      resultado = resultado.filter(
        (c) => 
          c.nome.toLowerCase().includes(termo) || 
          c.email.toLowerCase().includes(termo) ||
          c.telefone.includes(termo)
      );
    }

    // Ordenação
    resultado.sort((a, b) => {
      let comp = 0;
      if (estado.ordenacao === "NOME") comp = a.nome.localeCompare(b.nome);
      if (estado.ordenacao === "RECENTE") comp = b.dataCriacao.getTime() - a.dataCriacao.getTime();
      if (estado.ordenacao === "LTV") comp = b.ltvCentavos - a.ltvCentavos;
      return estado.ordemInvertida ? -comp : comp;
    });

    return resultado;
  }, [estado.clientes, estado.filtroBusca, estado.ordenacao, estado.ordemInvertida]);

  // 🛠 Ações de CRUD (Simuladas - Persistência Real via D1 no futuro)
  const salvarCliente = async (dados: Partial<Cliente>): Promise<Cliente> => {
    const rastreioId = crypto.randomUUID();

    try {
      if (!dados.nome) {
        throw new ErroValidacao("Dados obrigatórios ausentes", CodigoErro.LANCAMENTO_VALOR_INVALIDO);
      }

      registrar.info({ rastreioId, cliente: dados.nome }, "Salvando cliente");

      let clienteFinal: Cliente;

      if (estado.clienteSendoEditado) {
        // Mock Update
        clienteFinal = { ...estado.clienteSendoEditado, ...dados, dataAtualizacao: new Date() } as Cliente;
        const atualizados = estado.clientes.map((c: Cliente) =>
          c.id === estado.clienteSendoEditado?.id ? clienteFinal : c,
        );
        estado.definirClientes(atualizados);
      } else {
        // Mock Create
        clienteFinal = {
          id: crypto.randomUUID(),
          nome: dados.nome!,
          email: dados.email || "",
          telefone: dados.telefone || "",
          dataCriacao: new Date(),
          dataAtualizacao: new Date(),
          ltvCentavos: 0,
          totalProdutos: 0,
          fiel: false,
          statusComercial: dados.statusComercial || StatusComercial.PROSPECT,
          observacoesCRM: dados.observacoesCRM || "",

          // LGPD (Regra 9.0)
          idConsentimento: crypto.randomUUID(),
          baseLegal: dados.baseLegal || BaseLegalLGPD.EXECUCAO_CONTRATO,
          finalidadeColeta: dados.finalidadeColeta || "Gestão de pedidos e orçamentos",
          prazoRetencaoMeses: dados.prazoRetencaoMeses || 60,
          anonimizado: false,
        };
        estado.definirClientes([...estado.clientes, clienteFinal]);
      }
      estado.fecharEditar();
      return clienteFinal;
    } catch (erro) {
      registrar.error({ rastreioId }, "Erro ao salvar cliente", erro);
      throw erro;
    }
  };

  const removerCliente = async (id: string) => {
    const rastreioId = crypto.randomUUID();
    try {
      registrar.info({ rastreioId, idCliente: id }, "Removendo cliente");
      const atualizados = estado.clientes.filter((c) => c.id !== id);
      estado.definirClientes(atualizados);
      estado.fecharRemover();
    } catch (erro) {
      registrar.error({ rastreioId }, "Erro ao remover cliente", erro);
      throw erro;
    }
  };

  return {
    estado: {
      ...estado,
      clientesFiltrados,
    },
    acoes: {
      pesquisar: estado.pesquisar,
      ordenarPor: estado.ordenarPor,
      inverterOrdem: estado.inverterOrdem,
      abrirEditar: estado.abrirEditar,
      fecharEditar: estado.fecharEditar,
      abrirRemover: estado.abrirRemover,
      fecharRemover: estado.fecharRemover,
      abrirHistorico: estado.abrirHistorico,
      fecharHistorico: estado.fecharHistorico,
      salvarCliente,
      removerCliente,
    },
  };
}
