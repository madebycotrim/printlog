import { useArmazemClientes } from "../estado/armazemClientes";
import { Cliente } from "../tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { ErroValidacao, CodigoErro } from "@/compartilhado/utilitarios/excecoes";
import { useMemo, useEffect, useCallback, useState } from "react";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { apiClientes } from "../servicos/apiClientes";
import { toast } from "react-hot-toast";
import { useDebounce } from "@/compartilhado/hooks/useDebounce";

/**
 * Hook de domínio para gerenciamento de clientes.
 * Encapsula lógica de CRUD e filtragem simples.
 */
export function useGerenciadorClientes() {
  const estado = useArmazemClientes();
  const { usuario } = useAutenticacao();
  const usuarioId = usuario?.uid;
  const [erro, setErro] = useState(false);

  const [paginaAtual, definirPaginaAtual] = useState(0);
  const [carregandoMais, definirCarregandoMais] = useState(false);
  const [temMais, definirTemMais] = useState(true);

  const termoDebounced = useDebounce(estado.filtroBusca, 300);

  // 📥 Carregar dados do Banco
  const carregarClientes = useCallback(async () => {
    if (!usuarioId) return;
    try {
      setErro(false);
      estado.definirCarregando(true);
      const limit = 10;
      const dados = await apiClientes.listarPaginado({
        limit,
        offset: 0,
        search: termoDebounced || undefined
      });
      estado.definirClientes(dados.items, dados.total);
      definirTemMais(dados.items.length === limit);
      definirPaginaAtual(0);
    } catch (erro) {
      setErro(true);
      toast.error("Erro ao carregar clientes.");
    } finally {
      estado.definirCarregando(false);
    }
  }, [usuarioId, termoDebounced]);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  const carregarMais = useCallback(async () => {
    if (!usuarioId || carregandoMais || !temMais) return;
    
    definirCarregandoMais(true);
    try {
      const limit = 10;
      const novaPagina = paginaAtual + 1;
      const offset = novaPagina * limit;
      
      const dados = await apiClientes.listarPaginado({
        limit,
        offset,
        search: termoDebounced || undefined
      });
      
      estado.adicionarPagina(dados.items);
      definirTemMais(dados.items.length === limit);
      definirPaginaAtual(novaPagina);
    } catch (erro) {
      console.error("Erro ao carregar mais clientes:", erro);
      toast.error("Erro ao carregar mais clientes.");
    } finally {
      definirCarregandoMais(false);
    }
  }, [usuarioId, carregandoMais, temMais, paginaAtual, termoDebounced, estado]);

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

  // 🛠 Ações de CRUD (Persistência Real via D1)
  const salvarCliente = async (dados: Partial<Cliente>): Promise<Cliente> => {
    if (!usuarioId) throw new Error("Não autorizado");
    const rastreioId = crypto.randomUUID();

    try {
      if (!dados.nome) {
        throw new ErroValidacao("Dados obrigatórios ausentes", CodigoErro.LANCAMENTO_VALOR_INVALIDO);
      }

      registrar.info({ rastreioId }, "Salvando registro de cliente no banco");

      const id = dados.id || estado.clienteSendoEditado?.id || crypto.randomUUID();
      const clienteExistente = estado.clientes.find(c => c.id === id);
      
      const clienteParaSalvar: Cliente = {
        id,
        nome: dados.nome || "",
        email: dados.email || "",
        telefone: dados.telefone || "",
        observacoesCRM: dados.observacoesCRM || "",
        ltvCentavos: clienteExistente?.ltvCentavos || 0,
        totalProdutos: clienteExistente?.totalProdutos || 0,
        fiel: clienteExistente?.fiel || false,
        dataCriacao: clienteExistente?.dataCriacao || new Date(),
        dataAtualizacao: new Date(),
        idConsentimento: clienteExistente?.idConsentimento || "",
        baseLegal: clienteExistente?.baseLegal || ("consentimento" as any),
        finalidadeColeta: clienteExistente?.finalidadeColeta || "",
        prazoRetencaoMeses: clienteExistente?.prazoRetencaoMeses || 60,
        anonimizado: clienteExistente?.anonimizado || false,
        ...dados,
      } as Cliente;

      // ⚡️ OTIMISTA
      estado.adicionarOuAtualizarCliente(clienteParaSalvar);
      estado.fecharEditar();

      try {
        const clienteFinal = await apiClientes.salvar(clienteParaSalvar, usuarioId);
        estado.adicionarOuAtualizarCliente(clienteFinal);
        toast.success(estado.clienteSendoEditado?.id ? "Cliente atualizado!" : "Cliente salvo com sucesso! 🚀");
        return clienteFinal;
      } catch (erro) {
        // 🔙 ROLLBACK
        if (clienteExistente) {
          estado.adicionarOuAtualizarCliente(clienteExistente);
        } else {
          estado.removerCliente(id);
        }
        registrar.error({ rastreioId }, "Erro ao salvar cliente", erro);
        toast.error("Erro ao salvar cliente. Alteração revertida.");
        estado.abrirEditar(clienteParaSalvar);
        throw erro;
      }
    } catch (erro) {
      registrar.error({ rastreioId }, "Erro ao validar cliente", erro);
      toast.error("Erro ao validar dados do cliente.");
      throw erro;
    }
  };

  const removerCliente = async (id: string) => {
    if (!usuarioId) return;
    const rastreioId = crypto.randomUUID();
    const clienteAntigo = estado.clientes.find(c => c.id === id);

    // ⚡️ OTIMISTA
    estado.removerCliente(id);
    estado.fecharRemover();

    try {
      registrar.info({ rastreioId, idCliente: id }, "Removendo cliente do banco");
      await apiClientes.remover(id, usuarioId);
      toast.success("Cliente removido.");
    } catch (erro) {
      // 🔙 ROLLBACK
      if (clienteAntigo) {
        estado.adicionarOuAtualizarCliente(clienteAntigo);
      }
      registrar.error({ rastreioId }, "Erro ao remover cliente", erro);
      toast.error("Erro ao remover cliente. Alteração revertida.");
      throw erro;
    }
  };

  return {
    estado: {
      ...estado,
      clientesFiltrados,
      erro,
      carregandoMais,
      temMais,
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
      recarregar: carregarClientes,
      carregarMais,
    },
  };
}
