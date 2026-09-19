import { Pedido } from "../tipos";
import { Impressora, TecnologiaImpressora } from "@/funcionalidades/producao/impressoras/tipos";
import { StatusImpressora, StatusPedido } from "@/compartilhado/tipos/modelos";

export interface AlocacaoItem {
  pedido: Pedido;
  posicaoFila: number;
  motivo: string;
}

export interface AlocacaoImpressora {
  impressora: Impressora;
  pedidos: AlocacaoItem[];
  tempoTotalMinutos: number;
  materiaisDistintos: string[];
}

export interface ResultadoSmartDispatcher {
  alocacoesPorImpressora: AlocacaoImpressora[];
  pedidosNaoAlocados: Pedido[];
  trocasEconomizadas: number;
  tempoEconomizadoMinutos: number;
  totalPedidosAlocados: number;
}

/**
 * Normaliza o tipo de tecnologia (FDM vs Resina/SLA) com base no material e tecnologia
 */
function inferirTecnologiaPedido(pedido: Pedido): TecnologiaImpressora {
  const texto = `${pedido.material || ""} ${pedido.descricao || ""}`.toLowerCase();
  if (texto.includes("resina") || texto.includes("sla") || texto.includes("lcd") || texto.includes("dlp")) {
    return "SLA";
  }
  return "FDM";
}

/**
 * Obtém identificador unificado de material/cor para agrupar pedidos semelhantes
 */
function obterChaveMaterial(pedido: Pedido): string {
  if (pedido.materiais && pedido.materiais.length > 0) {
    return pedido.materiais.map(m => m.idMaterial).sort().join("+");
  }
  return (pedido.material || "Padrão").trim().toLowerCase();
}

export const servicoSmartDispatcher = {
  /**
   * Executa a simulação de despacho inteligente de pedidos entre as impressoras disponíveis.
   */
  otimizarFila: (pedidos: Pedido[], impressoras: Impressora[]): ResultadoSmartDispatcher => {
    // 1. Filtra impressoras operacionais
    const impressorasValidas = impressoras.filter(imp => 
      !imp.dataAposentadoria && 
      imp.status !== StatusImpressora.MANUTENCAO
    );

    // 2. Filtra pedidos pendentes (não concluídos, não cancelados/arquivados)
    const pedidosPendentes = pedidos.filter(p => 
      p.status === StatusPedido.A_FAZER || 
      p.status === StatusPedido.EM_PRODUCAO || 
      p.status === StatusPedido.ATRASADO
    );

    // Estrutura de resultado
    const mapaAlocacoes = new Map<string, AlocacaoImpressora>();
    impressorasValidas.forEach(imp => {
      mapaAlocacoes.set(imp.id, {
        impressora: imp,
        pedidos: [],
        tempoTotalMinutos: 0,
        materiaisDistintos: []
      });
    });

    const pedidosNaoAlocados: Pedido[] = [];
    let trocasEconomizadas = 0;

    // 3. Ordenação inicial de pedidos por urgência (prazo de entrega) e tamanho
    const pedidosOrdenados = [...pedidosPendentes].sort((a, b) => {
      // Prioridade 1: Prazo de entrega
      if (a.prazoEntrega && b.prazoEntrega) {
        return new Date(a.prazoEntrega).getTime() - new Date(b.prazoEntrega).getTime();
      }
      if (a.prazoEntrega) return -1;
      if (b.prazoEntrega) return 1;
      // Prioridade 2: Ordem de criação
      return new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime();
    });

    // 4. Algoritmo de Casamento Inteligente (Greedy com afinidade de material e carga)
    for (const pedido of pedidosOrdenados) {
      const tecPedido = inferirTecnologiaPedido(pedido);
      const chaveMat = obterChaveMaterial(pedido);
      const tempoPedido = Math.max(15, pedido.tempoMinutos || 60);

      // Candidatas compatíveis por tecnologia
      const candidatas = impressorasValidas.filter(imp => {
        if (tecPedido === "SLA") {
          return imp.tecnologia === "SLA" || imp.tecnologia === "DLP" || imp.tecnologia === "LCD";
        }
        return imp.tecnologia === "FDM";
      });

      if (candidatas.length === 0) {
        pedidosNaoAlocados.push(pedido);
        continue;
      }

      // Pontua cada impressora candidata
      let melhorImpressora: Impressora | null = null;
      let melhorPontuacao = -Infinity;
      let melhorMotivo = "Distribuição equilibrada de carga horária";

      for (const imp of candidatas) {
        const dadosAloc = mapaAlocacoes.get(imp.id)!;
        let pontuacao = 1000;

        // Fator 1: Afinidade de Material/Cor (Evita troca de filamento)
        const ultimoPedido = dadosAloc.pedidos[dadosAloc.pedidos.length - 1];
        if (ultimoPedido && obterChaveMaterial(ultimoPedido.pedido) === chaveMat) {
          pontuacao += 500; // Forte preferência por manter o mesmo filamento carregado
          melhorMotivo = `Afinidade de material (${pedido.material || 'mesmo filamento'}): economia de troca e purga`;
        } else if (dadosAloc.materiaisDistintos.includes(chaveMat)) {
          pontuacao += 200;
        }

        // Fator 2: Penalidade por carga horária acumulada (Balanceamento de fila)
        // Cada hora acumulada reduz 15 pontos para evitar sobrecarregar uma única máquina
        const horasAcumuladas = dadosAloc.tempoTotalMinutos / 60;
        pontuacao -= horasAcumuladas * 15;

        // Fator 3: Bônus para impressora livre no momento
        if (imp.status === StatusImpressora.LIVRE && dadosAloc.pedidos.length === 0) {
          pontuacao += 150;
        }

        if (pontuacao > melhorPontuacao) {
          melhorPontuacao = pontuacao;
          melhorImpressora = imp;
        }
      }

      if (melhorImpressora) {
        const aloc = mapaAlocacoes.get(melhorImpressora.id)!;
        
        // Contabiliza economia de troca se for o mesmo material do pedido anterior
        const ultimo = aloc.pedidos[aloc.pedidos.length - 1];
        if (ultimo && obterChaveMaterial(ultimo.pedido) === chaveMat) {
          trocasEconomizadas++;
        }

        aloc.pedidos.push({
          pedido,
          posicaoFila: aloc.pedidos.length + 1,
          motivo: melhorMotivo
        });
        aloc.tempoTotalMinutos += tempoPedido;
        if (!aloc.materiaisDistintos.includes(chaveMat)) {
          aloc.materiaisDistintos.push(chaveMat);
        }
      } else {
        pedidosNaoAlocados.push(pedido);
      }
    }

    // Economia estimada: 20 minutos por troca de filamento evitada
    const tempoEconomizadoMinutos = trocasEconomizadas * 20;

    return {
      alocacoesPorImpressora: Array.from(mapaAlocacoes.values()),
      pedidosNaoAlocados,
      trocasEconomizadas,
      tempoEconomizadoMinutos,
      totalPedidosAlocados: pedidosPendentes.length - pedidosNaoAlocados.length
    };
  }
};
