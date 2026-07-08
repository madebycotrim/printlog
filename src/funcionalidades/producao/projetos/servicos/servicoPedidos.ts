import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { Pedido, CriarPedidoInput, AtualizarPedidoInput } from "../tipos";
import { apiPedidos } from "./apiPedidos";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { apiImpressoras } from "@/funcionalidades/producao/impressoras/servicos/apiImpressoras";
import { useArmazemClientes } from "@/funcionalidades/comercial/clientes/estado/armazemClientes";
import { apiClientes } from "@/funcionalidades/comercial/clientes/servicos/apiClientes";
import { servicoEmail } from "@/compartilhado/servicos/servicoEmail";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";


/**
 * Serviço de Negócio para Pedidos e Fluxo de Produção.
 * Faz a ponte entre a UI e a API real, aplicando regras de negócio.
 */
class ServicoPedidos {
  /**
   * Busca e processa pedidos, aplicando regras de arquivamento automático.
   */
  async buscarPedidos(usuarioId: string): Promise<Pedido[]> {
    const pedidos = await apiPedidos.buscarTodos(usuarioId);
    
    const processados = pedidos.map((p: any) => ({
      ...p,
      status: String(p.status || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace('pendente', StatusPedido.A_FAZER) || StatusPedido.A_FAZER,
      dataCriacao: new Date(p.data_criacao || p.dataCriacao),
      dataConclusao: p.data_conclusao ? new Date(p.data_conclusao) : p.dataConclusao ? new Date(p.dataConclusao) : undefined,
      prazoEntrega: (p.prazo_entrega || p.prazoEntrega) ? new Date(p.prazo_entrega || p.prazoEntrega) : undefined,
    }));

    const agora = new Date();
    const SETE_DIAS_EM_MS = 7 * 24 * 60 * 60 * 1000;

    // Regra de Arquivamento Automático: +7 dias no Concluído
    const finalizados = await Promise.all(processados.map(async (p) => {
      let status = p.status;
      if (status === StatusPedido.CONCLUIDO && p.dataConclusao) {
        if (agora.getTime() - p.dataConclusao.getTime() > SETE_DIAS_EM_MS) {
          status = StatusPedido.ARQUIVADO;
          // Sincroniza o novo status no banco em Background (sem travar a UI)
          apiPedidos.atualizar({ id: p.id, status: StatusPedido.ARQUIVADO }, usuarioId);
        }
      }
      return { ...p, status };
    }));

    // Retorna todos os pedidos (o Kanban filtra o que deve exibir)
    return finalizados;
  }

  async criarPedido(dados: CriarPedidoInput, usuarioId: string): Promise<Pedido> {
    const id = (dados as any).id || crypto.randomUUID();
    const dataCriacao = new Date();
    
    const novoPedido: Pedido = {
      ...dados,
      id,
      idUsuario: usuarioId,
      status: StatusPedido.A_FAZER,
      dataCriacao
    };

    await apiPedidos.criar(novoPedido, usuarioId);
    return novoPedido;
  }

  async atualizarPedido(dados: AtualizarPedidoInput, usuarioId: string): Promise<Pedido> {
    const novoStatus = dados.status;
    let dataConclusao = (dados as any).dataConclusao;

    if (novoStatus === StatusPedido.CONCLUIDO && !dataConclusao) {
      dataConclusao = new Date().toISOString();
    }

    const payload = { ...dados, dataConclusao, idUsuario: usuarioId, limparDataConclusao: false };
    await apiPedidos.atualizar(payload, usuarioId);
    
    return {
      ...dados,
      dataConclusao: dataConclusao ? new Date(dataConclusao) : undefined
    } as any;
  }

  /**
   * Atualiza o status de um pedido, orquestrando todas as operações de
   * liquidação (ao concluir) e reversão (ao sair de concluído).
   */
  async atualizarStatus(id: string, novoStatus: StatusPedido, usuarioId: string, pedidoInicial?: Pedido): Promise<Pedido> {
    let pedido = pedidoInicial;

    if (!pedido) {
      pedido = await apiPedidos.buscarPorId(id, usuarioId) || undefined;
    }
    
    if (!pedido) {
      registrar.error({ rastreioId: `status-${id}`, servico: "Pedidos" }, "Pedido não encontrado para atualização", { id });
      throw new Error("Pedido não encontrado.");
    }

    const statusAtual = (pedido.status as StatusPedido) || StatusPedido.A_FAZER;
    const rastreioId = `pedido-${id}`;
    const pedidoNorm = pedido;

    const deConcluido = statusAtual === StatusPedido.CONCLUIDO || statusAtual === StatusPedido.ARQUIVADO;
    const paraConcluido = novoStatus === StatusPedido.CONCLUIDO || novoStatus === StatusPedido.ARQUIVADO;

    if (deConcluido !== paraConcluido) {
      // 1. Chamar o backend transacional unificado para realizar a persistência atômica no banco D1
      await servicoBaseApi.post("/api/pedidos/concluir", {
        idPedido: id,
        novoStatus: novoStatus
      });

      // 2. Realizar atualizações locais em memória (Zustand) para sincronia instantânea de UI sem travar o cliente
      if (paraConcluido) {
        registrar.info({ rastreioId, servico: "Pedidos" }, "Sincronizando liquidação de conclusão localmente");
        await this.liquidarConclusaoLocal(pedidoNorm);
      } else {
        registrar.info({ rastreioId, servico: "Pedidos" }, "Sincronizando reversão localmente");
        await this.reverterConclusaoLocal(pedidoNorm);
      }
      
      return {
        ...pedidoNorm,
        status: novoStatus,
        dataConclusao: novoStatus === StatusPedido.CONCLUIDO ? new Date() : undefined
      };
    }

    const payload: any = { id, status: novoStatus };
    return this.atualizarPedido(payload, usuarioId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIQUIDAÇÃO DE CONCLUSÃO LOCAL (ZUSTAND APENAS)
  // ───────────────────────────────────────────────────────────────────────────
  private async liquidarConclusaoLocal(pedido: any): Promise<void> {
    const tempoEfetivo = pedido.tempoMinutos || (
      pedido.configuracoes 
        ? ((pedido.configuracoes.tempoHoras || 0) * 60 + (pedido.configuracoes.tempoMinutos || 0))
        : 0
    ) || 0;

    // 1. Desconto de Materiais
    if (pedido.materiais && pedido.materiais.length > 0) {
      for (const mat of pedido.materiais) {
        const matId = mat.idMaterial || mat.id;
        useArmazemMateriais.getState().abaterPeso(
          matId,
          mat.quantidadeGasta || 0,
          pedido.descricao,
          "SUCESSO"
        );
      }
    }

    // 2. Desconto de Insumos Secundários
    if (pedido.insumosSecundarios && pedido.insumosSecundarios.length > 0) {
      for (const ins of pedido.insumosSecundarios) {
        const insId = ins.idInsumo || ins.id;
        const insumoEstoque = useArmazemInsumos.getState().insumos.find(i => i.id === insId);
        if (insumoEstoque) {
          const novaQtd = Math.max(0, (insumoEstoque.quantidadeAtual || 0) - ins.quantidade);
          useArmazemInsumos.getState().adicionarOuAtualizarInsumo({
            ...insumoEstoque,
            quantidadeAtual: novaQtd,
            historico: [
              {
                id: crypto.randomUUID(),
                data: new Date().toISOString(),
                tipo: "Saída",
                quantidade: ins.quantidade,
                motivo: "Consumo",
                observacao: `Conclusão do pedido: ${pedido.descricao}`,
              },
              ...(insumoEstoque.historico || [])
            ]
          });
        }
      }
    }

    // 3. Horímetro + Métricas da Impressora
    if (pedido.idImpressora && tempoEfetivo > 0) {
      const { impressoras, definirImpressoras } = useArmazemImpressoras.getState();
      const imp = impressoras.find(i => i.id === pedido.idImpressora);
      if (imp) {
        const novoHorimetro = Math.max(0, (imp.horimetroTotalMinutos || 0) + tempoEfetivo);
        
        let custoPedidoCentavos = 0;
        const potencia = pedido.configuracoes?.potenciaWatts || imp.potenciaWatts || 0;
        if (potencia > 0) {
          const consumoKw = potencia / 1000;
          const horas = tempoEfetivo / 60;
          const precoKwh = pedido.configuracoes?.precoKwh || 0;
          custoPedidoCentavos = Math.round(consumoKw * horas * precoKwh);
        }

        const novoCustoEnergia = (imp.custoEnergiaCentavos || 0) + custoPedidoCentavos;
        const novoTotalProjetos = (imp.totalProjetosConcluidos || 0) + 1;
        const novaReceita = (imp.receitaAcumuladaCentavos || 0) + (pedido.valorCentavos || 0);
        
        const custoCompra = imp.valorCompraCentavos || 0;
        const novoRoi = custoCompra > 0 ? Math.round(((novaReceita - custoCompra) / custoCompra) * 100) : 0;

        const novoRegistro = {
          idProtocolo: pedido.id,
          nomeProjeto: pedido.descricao,
          minutosImpressao: tempoEfetivo,
          valorGeradoCentavos: pedido.valorCentavos || 0,
          dataConclusao: new Date().toISOString(),
          sucesso: true
        };
        const novoHistorico = [novoRegistro, ...(imp.historicoProducao || [])].slice(0, 50);

        const impressoraAtualizada = {
          ...imp,
          horimetroTotalMinutos: novoHorimetro,
          totalProjetosConcluidos: novoTotalProjetos,
          receitaAcumuladaCentavos: novaReceita,
          custoEnergiaCentavos: novoCustoEnergia,
          roiPercentual: novoRoi,
          historicoProducao: novoHistorico,
          dataAtualizacao: new Date()
        };

        const atualizadas = impressoras.map(i => i.id === pedido.idImpressora ? impressoraAtualizada : i);

        definirImpressoras(atualizadas);
        
        try {
          await apiImpressoras.salvar(impressoraAtualizada, pedido.idUsuario);
        } catch (e) {
          console.error("Erro ao salvar métricas da impressora:", e);
        }
      }
    }

    // 4. Histórico e Métricas do Cliente
    if (pedido.idCliente && pedido.idCliente !== "avulso") {
      const { clientes, definirClientes } = useArmazemClientes.getState();
      const cliente = clientes.find(c => c.id === pedido.idCliente);
      if (cliente) {
        const novoHistorico = [
          ...(cliente.historico || []),
          {
            id: crypto.randomUUID(),
            data: new Date(),
            descricao: pedido.descricao,
            valorCentavos: pedido.valorCentavos || 0,
            status: StatusPedido.CONCLUIDO,
          }
        ];

        const clienteAtualizado = {
          ...cliente,
          ltvCentavos: (cliente.ltvCentavos || 0) + (pedido.valorCentavos || 0),
          totalProdutos: (cliente.totalProdutos || 0) + 1,
          historico: novoHistorico,
        };

        const atualizados = clientes.map(c => c.id === pedido.idCliente ? clienteAtualizado : c);

        definirClientes(atualizados);

        try {
          await apiClientes.salvar(clienteAtualizado, pedido.idUsuario);
          
          // ✉️ Envio Automático de E-mail de Conclusão (CRM)
          if (clienteAtualizado.email) {
            servicoEmail.enviarEmailPedidoPronto({
              nomeCliente: clienteAtualizado.nome,
              emailCliente: clienteAtualizado.email,
              nomeProjeto: pedido.descricao,
            });
          }
        } catch (e) {
          console.error("Erro ao salvar métricas do cliente:", e);
        }
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // REVERSÃO DE CONCLUSÃO LOCAL (ZUSTAND APENAS)
  // ───────────────────────────────────────────────────────────────────────────
  private async reverterConclusaoLocal(pedido: any): Promise<void> {
    const tempoEfetivo = pedido.tempoMinutos || (
      pedido.configuracoes 
        ? ((pedido.configuracoes.tempoHoras || 0) * 60 + (pedido.configuracoes.tempoMinutos || 0))
        : 0
    ) || 0;

    // 1. Estornar desconto de materiais (devolver gramas ao estoque)
    if (pedido.materiais && pedido.materiais.length > 0) {
      for (const mat of pedido.materiais) {
        const matId = mat.idMaterial || mat.id;
        useArmazemMateriais.getState().abaterPeso(
          matId,
          -(mat.quantidadeGasta || 0),
          `[REVERSÃO] ${pedido.descricao}`,
          "SUCESSO"
        );
      }
    }

    // 2. Estornar desconto de insumos (devolver ao estoque)
    if (pedido.insumosSecundarios && pedido.insumosSecundarios.length > 0) {
      for (const ins of pedido.insumosSecundarios) {
        const insId = ins.idInsumo || ins.id;
        const insumoEstoque = useArmazemInsumos.getState().insumos.find(i => i.id === insId);
        if (insumoEstoque) {
          const qtdDevolvida = (insumoEstoque.quantidadeAtual || 0) + ins.quantidade;
          useArmazemInsumos.getState().adicionarOuAtualizarInsumo({
            ...insumoEstoque,
            quantidadeAtual: qtdDevolvida,
            historico: [
              {
                id: crypto.randomUUID(),
                data: new Date().toISOString(),
                tipo: "Entrada",
                quantidade: ins.quantidade,
                motivo: "Ajuste",
                observacao: `[REVERSÃO] Pedido reaberto: ${pedido.descricao}`,
              },
              ...(insumoEstoque.historico || [])
            ]
          });
        }
      }
    }

    // 3. Estornar horímetro + Métricas da impressora
    if (pedido.idImpressora && tempoEfetivo > 0) {
      const { impressoras, definirImpressoras } = useArmazemImpressoras.getState();
      const imp = impressoras.find(i => i.id === pedido.idImpressora);
      if (imp) {
        const novoHorimetro = Math.max(0, (imp.horimetroTotalMinutos || 0) - tempoEfetivo);
        
        let custoPedidoCentavos = 0;
        const potencia = pedido.configuracoes?.potenciaWatts || imp.potenciaWatts || 0;
        if (potencia > 0) {
          const consumoKw = potencia / 1000;
          const horas = tempoEfetivo / 60;
          const precoKwh = pedido.configuracoes?.precoKwh || 0;
          custoPedidoCentavos = Math.round(consumoKw * horas * precoKwh);
        }

        const novoCustoEnergia = Math.max(0, (imp.custoEnergiaCentavos || 0) - custoPedidoCentavos);
        const novoTotalProjetos = Math.max(0, (imp.totalProjetosConcluidos || 0) - 1);
        const novaReceita = Math.max(0, (imp.receitaAcumuladaCentavos || 0) - (pedido.valorCentavos || 0));
        
        const custoCompra = imp.valorCompraCentavos || 0;
        const novoRoi = custoCompra > 0 ? Math.round(((novaReceita - custoCompra) / custoCompra) * 100) : 0;

        let historico = imp.historicoProducao || [];
        historico = historico.filter((r: any) => r.idProtocolo !== pedido.id);

        const atualizadas = impressoras.map(i => i.id === pedido.idImpressora ? {
          ...i,
          horimetroTotalMinutos: novoHorimetro,
          totalProjetosConcluidos: novoTotalProjetos,
          receitaAcumuladaCentavos: novaReceita,
          custoEnergiaCentavos: novoCustoEnergia,
          roiPercentual: novoRoi,
          historicoProducao: historico,
          dataAtualizacao: new Date()
        } : i);

        definirImpressoras(atualizadas);
      }
    }

    // 4. Estornar histórico e métricas do cliente
    if (pedido.idCliente && pedido.idCliente !== "avulso") {
      const { clientes, definirClientes } = useArmazemClientes.getState();
      const cliente = clientes.find(c => c.id === pedido.idCliente);
      if (cliente) {
        const historicoSemPedido = (cliente.historico || []).filter(
          h => h.descricao !== pedido.descricao || h.valorCentavos !== (pedido.valorCentavos || 0)
        );

        const atualizados = clientes.map(c => c.id === pedido.idCliente ? {
          ...c,
          ltvCentavos: Math.max(0, (c.ltvCentavos || 0) - (pedido.valorCentavos || 0)),
          totalProdutos: Math.max(0, (c.totalProdutos || 0) - 1),
          historico: historicoSemPedido,
        } : c);

        definirClientes(atualizados);
      }
    }
  }

  async excluirPedido(id: string, usuarioId: string): Promise<void> {
    await apiPedidos.excluir(id, usuarioId);
  }
}

export const servicoPedidos = new ServicoPedidos();
