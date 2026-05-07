import { StatusPedido, TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { Pedido, CriarPedidoInput, AtualizarPedidoInput } from "../tipos";
import { apiPedidos } from "./apiPedidos";
import { apiMateriais } from "@/funcionalidades/producao/materiais/servicos/apiMateriais";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { apiInsumos } from "@/funcionalidades/producao/insumos/servicos/apiInsumos";
import { apiFinanceiro } from "@/funcionalidades/comercial/financeiro/servicos/apiFinanceiro";
import { servicoFinanceiro } from "@/funcionalidades/comercial/financeiro/servicos/servicoFinanceiro";
import { apiClientes } from "@/funcionalidades/comercial/clientes/servicos/apiClientes";
import { servicoManutencao } from "@/compartilhado/servicos/servicoManutencao";
import { registrar } from "@/compartilhado/utilitarios/registrador";

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
      status: (p.status || '')
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
    const id = crypto.randomUUID();
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

    // Se não temos o pedido em mãos, buscamos ele de forma isolada (evita inconsistência de buscarTodos)
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

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 1: Movendo PARA Concluído ou Arquivado → Liquidação completa
    // Só liquida se NÃO vier de um estado que já foi liquidado (Concluído/Arquivado)
    // ─────────────────────────────────────────────────────────────────────────
    if (
      (novoStatus === StatusPedido.CONCLUIDO || novoStatus === StatusPedido.ARQUIVADO) &&
      (statusAtual !== StatusPedido.CONCLUIDO && statusAtual !== StatusPedido.ARQUIVADO)
    ) {
      registrar.info({ rastreioId, servico: "Pedidos" }, "Iniciando liquidação de conclusão/arquivamento");
      await this.liquidarConclusao(pedidoNorm, usuarioId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CASO 2: Saindo de Concluído para qualquer status (exceto Arquivado)
    //         → Reverter toda a liquidação
    // ─────────────────────────────────────────────────────────────────────────
    const payload: any = { id, status: novoStatus };

    // Se estiver retrocedendo (saindo de concluído/arquivado para um estado ativo), 
    // removemos a data de conclusão para que o projeto saia de todos os históricos.
    if (
      (statusAtual === StatusPedido.CONCLUIDO || statusAtual === StatusPedido.ARQUIVADO) &&
      (novoStatus !== StatusPedido.CONCLUIDO && novoStatus !== StatusPedido.ARQUIVADO)
    ) {
      payload.dataConclusao = null;
      payload.limparDataConclusao = true; // Flag explícita para o backend limpar o campo
      registrar.info({ rastreioId, servico: "Pedidos" }, "Iniciando reversão total (removendo do histórico)");
      await this.reverterConclusao(pedidoNorm, usuarioId, rastreioId);
    }

    return this.atualizarPedido(payload, usuarioId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LIQUIDAÇÃO DE CONCLUSÃO
  // Executa todos os descontos e acréscimos quando um pedido é concluído.
  // ───────────────────────────────────────────────────────────────────────────
  private async liquidarConclusao(pedido: any, usuarioId: string): Promise<void> {
    const erros: string[] = [];

    // v9.0: Blindagem de segurança - se o peso/tempo vierem zerados (erro de mapeamento), tenta somar dos itens
    const pesoEfetivo = pedido.pesoGramas || (pedido.materiais?.reduce((acc: number, m: any) => acc + (m.quantidadeGasta || 0), 0)) || 0;
    const tempoEfetivo = pedido.tempoMinutos || (
      pedido.configuracoes 
        ? ((pedido.configuracoes.tempoHoras || 0) * 60 + (pedido.configuracoes.tempoMinutos || 0))
        : 0
    ) || 0;

    // 1. Desconto de Materiais
    if (pedido.materiais && pedido.materiais.length > 0) {
      const listaMats = await apiMateriais.listar(usuarioId);
      for (const mat of pedido.materiais) {
        try {
          const materialEstoque = listaMats.find(m => m.id === mat.idMaterial || m.id === mat.id);
          
          if (materialEstoque) {
            const novoPeso = Math.max(0, (materialEstoque.pesoRestanteGramas || 0) - (mat.quantidadeGasta || 0));
            await apiMateriais.atualizar(
              { ...materialEstoque, id: materialEstoque.id, pesoRestanteGramas: novoPeso },
              usuarioId,
              {
                data: new Date().toISOString(),
                nomePeca: pedido.descricao,
                quantidadeGastaGramas: mat.quantidadeGasta || 0,
                status: "SUCESSO"
              }
            );

            // 1.1 Sincroniza com a Tela em Tempo Real
            usarArmazemMateriais.getState().abaterPeso(
              materialEstoque.id,
              mat.quantidadeGasta || 0,
              pedido.descricao,
              "SUCESSO"
            );
          } else {
            console.warn(`[DEBUG] Material não encontrado no estoque: ${mat.nome || mat.idMaterial}`);
          }
        } catch (e) {
          const msg = `Erro ao descontar material ${mat.nome || mat.idMaterial}`;
          console.error(`[DEBUG] ${msg}`, e);
          erros.push(msg);
        }
      }
    }

    // 2. Desconto de Insumos Secundários
    if (pedido.insumosSecundarios && pedido.insumosSecundarios.length > 0) {
      const listaIns = await apiInsumos.listar(usuarioId);
      for (const ins of pedido.insumosSecundarios) {
        try {
          const insumoEstoque = listaIns.find(i => i.id === ins.idInsumo || i.id === ins.id);

          if (insumoEstoque) {
            const novaQtd = Math.max(0, (insumoEstoque.quantidadeAtual || 0) - ins.quantidade);
            await apiInsumos.atualizar(
              { ...insumoEstoque, id: insumoEstoque.id, quantidadeAtual: novaQtd },
              usuarioId,
              {
                id: crypto.randomUUID(),
                data: new Date().toISOString(),
                tipo: "Saída",
                quantidade: ins.quantidade,
                motivo: "Consumo",
                observacao: `Conclusão do pedido: ${pedido.descricao}`,
                valorTotal: ins.quantidade * (insumoEstoque.custoMedioUnidade || 0)
              }
            );

            // 2.1 Sincroniza com a Tela em Tempo Real
            usarArmazemInsumos.getState().adicionarOuAtualizarInsumo({
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
          } else {
            console.warn(`[DEBUG] Insumo não encontrado no estoque: ${ins.nome || ins.idInsumo}`);
          }
        } catch (e) {
          const msg = `Erro ao descontar insumo ${ins.nome || ins.idInsumo}`;
          console.error(`[DEBUG] ${msg}`, e);
          erros.push(msg);
        }
      }
    }

    // 3. Horímetro + Métricas da Impressora
    if (pedido.idImpressora && tempoEfetivo > 0) {
      try {
        await servicoManutencao.registrarUsoMaquina(
          pedido.idImpressora,
          tempoEfetivo,
          usuarioId,
          {
            idPedido: pedido.id,
            nomeProjeto: pedido.descricao,
            valorCentavos: pedido.valorCentavos,
            precoKwhCentavos: pedido.configuracoes?.precoKwh
              ? Math.round(pedido.configuracoes.precoKwh * 100)
              : 0,
            consumoWatts: pedido.configuracoes?.potenciaWatts || 0,
            reversao: false,
          }
        );
      } catch (e) {
        console.error(`[DEBUG] Erro ao atualizar métricas da impressora`, e);
        erros.push("Erro ao atualizar métricas da impressora");
      }
    }

    // 4. Histórico e Métricas do Cliente
    if (pedido.idCliente && pedido.idCliente !== "avulso") {
      try {
        const listaClientes = await apiClientes.buscarTodos(usuarioId);
        const cliente = listaClientes.find(c => c.id === pedido.idCliente);

        if (cliente) {
          const novoHistorico = [
            ...(cliente.historico || []),
            {
              id: crypto.randomUUID(),
              data: new Date(),
              descricao: pedido.descricao,
              valorCentavos: pedido.valorCentavos,
              status: StatusPedido.CONCLUIDO,
            }
          ];

          await apiClientes.salvar({
            ...cliente,
            id: cliente.id,
            ltvCentavos: (cliente.ltvCentavos || 0) + pedido.valorCentavos,
            totalProdutos: (cliente.totalProdutos || 0) + 1,
            historico: novoHistorico,
          }, usuarioId);
        }
      } catch (e) {
        console.error(`[DEBUG] Erro ao atualizar histórico do cliente`, e);
        erros.push("Erro ao atualizar histórico do cliente");
      }
    }

    // 5. Lançamento Financeiro
    try {
      await apiFinanceiro.registrar({
        descricao: `Receita: ${pedido.descricao}`,
        valorCentavos: pedido.valorCentavos,
        tipo: TipoLancamentoFinanceiro.ENTRADA,
        categoria: "Venda de Impressão 3D",
        data: new Date(),
        idCliente: pedido.idCliente,
        idReferencia: pedido.id,
      }, usuarioId);
    } catch (e) {
      console.error(`[DEBUG] Erro ao registrar financeiro`, e);
      erros.push("Erro ao registrar lançamento financeiro");
    }

    if (erros.length > 0) {
      registrar.warn({ rastreioId: pedido.id, servico: "Pedidos", erros }, "Liquidação concluída com avisos");
    } else {
      registrar.info({ rastreioId: pedido.id, servico: "Pedidos" }, "Liquidação concluída com sucesso");
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // REVERSÃO DE CONCLUSÃO
  // Desfaz todos os descontos e acréscimos quando o pedido sai de Concluído.
  // ───────────────────────────────────────────────────────────────────────────
  private async reverterConclusao(pedido: any, usuarioId: string, rastreioId: string): Promise<void> {
    const erros: string[] = [];

    // 1. Estornar lançamento financeiro (busca pelo id_pedido = id do pedido)
    try {
      const lancamentos = await servicoFinanceiro.buscarLancamentos(usuarioId, rastreioId);
      const lancamentoPedido = lancamentos.find(
        l => (l as any).idPedido === pedido.id || (l as any).id_pedido === pedido.id
      );

      if (lancamentoPedido) {
        await apiFinanceiro.remover(lancamentoPedido.id, usuarioId);
      }
    } catch (e) {
      const msg = "Erro ao estornar lançamento financeiro";
      registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
      erros.push(msg);
    }

    // 2. Estornar desconto de materiais (devolver gramas ao estoque)
    if (pedido.materiais && pedido.materiais.length > 0) {
      for (const mat of pedido.materiais) {
        try {
          const listaMats = await apiMateriais.listar(usuarioId);
          const materialEstoque = listaMats.find(m => m.id === mat.idMaterial || m.id === mat.id);

          if (materialEstoque) {
            const pesoDevolucao = (materialEstoque.pesoRestanteGramas || 0) + (mat.quantidadeGasta || 0);
            // Limita ao máximo do peso original do carretel
            const novoPeso = Math.min(pesoDevolucao, materialEstoque.pesoGramas || pesoDevolucao);
            await apiMateriais.atualizar(
              { ...materialEstoque, id: materialEstoque.id, pesoRestanteGramas: novoPeso },
              usuarioId
            );

            // 1.1 Sincroniza com a Tela em Tempo Real (usando valor negativo para adicionar)
            usarArmazemMateriais.getState().abaterPeso(
              materialEstoque.id,
              -(mat.quantidadeGasta || 0),
              `[REVERSÃO] ${pedido.descricao}`,
              "SUCESSO"
            );
          }
        } catch (e) {
          const msg = `Erro ao estornar material ${mat.nome || mat.idMaterial}`;
          registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
          erros.push(msg);
        }
      }
    }

    // 3. Estornar desconto de insumos (devolver ao estoque)
    if (pedido.insumosSecundarios && pedido.insumosSecundarios.length > 0) {
      for (const ins of pedido.insumosSecundarios) {
        try {
          const listaIns = await apiInsumos.listar(usuarioId);
          const insumoEstoque = listaIns.find(i => i.id === ins.idInsumo || i.id === ins.id);

          if (insumoEstoque) {
            const qtdDevolvida = (insumoEstoque.quantidadeAtual || 0) + ins.quantidade;
            await apiInsumos.atualizar(
              { ...insumoEstoque, id: insumoEstoque.id, quantidadeAtual: qtdDevolvida },
              usuarioId
            );

            // 2.1 Sincroniza com a Tela em Tempo Real
            usarArmazemInsumos.getState().adicionarOuAtualizarInsumo({
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
        } catch (e) {
          const msg = `Erro ao estornar insumo ${ins.nome || ins.idInsumo}`;
          registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
          erros.push(msg);
        }
      }
    }

    // 4. Estornar horímetro + Métricas da impressora
    const tempoEfetivo = pedido.tempoMinutos || (
      pedido.configuracoes 
        ? ((pedido.configuracoes.tempoHoras || 0) * 60 + (pedido.configuracoes.tempoMinutos || 0))
        : 0
    ) || 0;

    if (pedido.idImpressora && tempoEfetivo > 0) {
      try {
        await servicoManutencao.registrarUsoMaquina(
          pedido.idImpressora,
          -tempoEfetivo,
          usuarioId,
          {
            idPedido: pedido.id,
            nomeProjeto: pedido.descricao,
            valorCentavos: pedido.valorCentavos,
            precoKwhCentavos: pedido.configuracoes?.precoKwh
              ? Math.round(pedido.configuracoes.precoKwh * 100)
              : 0,
            reversao: true,
          }
        );
      } catch (e) {
        const msg = "Erro ao estornar métricas da impressora";
        registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
        erros.push(msg);
      }
    }

    // 5. Estornar histórico e métricas do cliente
    if (pedido.idCliente && pedido.idCliente !== "avulso") {
      try {
        const listaClientes = await apiClientes.buscarTodos(usuarioId);
        const cliente = listaClientes.find(c => c.id === pedido.idCliente);

        if (cliente) {
          // Remove o registro desse pedido do histórico
          const historicoSemPedido = (cliente.historico || []).filter(
            h => h.descricao !== pedido.descricao || h.valorCentavos !== pedido.valorCentavos
          );

          await apiClientes.salvar({
            ...cliente,
            id: cliente.id,
            ltvCentavos: Math.max(0, (cliente.ltvCentavos || 0) - pedido.valorCentavos),
            totalProdutos: Math.max(0, (cliente.totalProdutos || 0) - 1),
            historico: historicoSemPedido,
          }, usuarioId);
        }
      } catch (e) {
        const msg = "Erro ao estornar histórico do cliente";
        registrar.error({ rastreioId, servico: "Pedidos" }, msg, e);
        erros.push(msg);
      }
    }

    if (erros.length > 0) {
      registrar.warn({ rastreioId, servico: "Pedidos", erros }, "Reversão concluída com erros parciais");
    } else {
      registrar.info({ rastreioId, servico: "Pedidos" }, "Reversão de conclusão concluída com sucesso");
    }
  }

  async excluirPedido(id: string, usuarioId: string): Promise<void> {
    await apiPedidos.excluir(id, usuarioId);
  }
}

export const servicoPedidos = new ServicoPedidos();
