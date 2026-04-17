import { usarArmazemClientes } from "../estado/armazemClientes";
import { Cliente, BaseLegalLGPD, StatusComercial } from "../tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { ErroValidacao, CodigoErro } from "@/compartilhado/utilitarios/excecoes";
import { useMemo, useEffect, useCallback } from "react";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { apiClientes } from "../servicos/apiClientes";
import { toast } from "react-hot-toast";

/**
 * Hook de domínio para gerenciamento de clientes.
 * Encapsula lógica de CRUD e filtragem simples.
 */
export function usarGerenciadorClientes() {
  const estado = usarArmazemClientes();
  const { usuario } = usarAutenticacao();
  const usuarioId = usuario?.uid;

  // 📥 Carregar dados do Banco
  const carregarClientes = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const dados = await apiClientes.buscarTodos(usuarioId);
      estado.definirClientes(dados);
    } catch (erro) {
      toast.error("Erro ao carregar clientes.");
    }
  }, [usuarioId]);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

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
    if (!usuarioId) throw new Error("Não autorizado");
    const rastreioId = crypto.randomUUID();

    try {
      if (!dados.nome) {
        throw new ErroValidacao("Dados obrigatórios ausentes", CodigoErro.LANCAMENTO_VALOR_INVALIDO);
      }

      registrar.info({ rastreioId, cliente: dados.nome }, "Salvando cliente no banco");

      const id = estado.clienteSendoEditado?.id;
      const clienteParaSalvar = { ...dados, id };

      const clienteFinal = await apiClientes.salvar(clienteParaSalvar, usuarioId);
      
      // Recarregar para garantir sincronia
      await carregarClientes();
      
      toast.success(id ? "Cliente atualizado!" : "Cliente salvo com sucesso! 🚀");
      estado.fecharEditar();
      return clienteFinal;
    } catch (erro) {
      registrar.error({ rastreioId }, "Erro ao salvar cliente", erro);
      toast.error("Erro ao salvar cliente.");
      throw erro;
    }
  };

  const removerCliente = async (id: string) => {
    if (!usuarioId) return;
    const rastreioId = crypto.randomUUID();
    try {
      registrar.info({ rastreioId, idCliente: id }, "Removendo cliente do banco");
      await apiClientes.remover(id, usuarioId);
      await carregarClientes();
      toast.success("Cliente removido.");
      estado.fecharRemover();
    } catch (erro) {
      registrar.error({ rastreioId }, "Erro ao remover cliente", erro);
      toast.error("Erro ao remover cliente.");
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
