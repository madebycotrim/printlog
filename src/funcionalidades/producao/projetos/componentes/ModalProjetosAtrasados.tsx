import { Pedido } from "../tipos";
import { CartaoPedido } from "./CartaoPedido";
import { Clock, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
import { verificarSeEstaAtrasado } from "@/compartilhado/utilitarios/gestaoAtrasos";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";

interface PropriedadesModalProjetosAtrasados {
  aberto: boolean;
  aoFechar: () => void;
  pedidos: Pedido[];
  aoEditar?: (id: string) => void;
}

/**
 * 🚨 ModalProjetosAtrasados - Gestão de Urgências
 * Utiliza o padrão universal ModalListagemPremium com destaque Rose.
 */
export function ModalProjetosAtrasados({ aberto, aoFechar, pedidos, aoEditar }: PropriedadesModalProjetosAtrasados) {
  const [busca, setBusca] = useState("");

  const pedidosAtrasados = useMemo(() => {
    return pedidos.filter(verificarSeEstaAtrasado);
  }, [pedidos]);

  const filtrados = useMemo(() => {
    if (!busca) return pedidosAtrasados;
    const termo = busca.toLowerCase();
    return pedidosAtrasados.filter(
      (p) => p.descricao.toLowerCase().includes(termo) || p.nomeCliente?.toLowerCase().includes(termo),
    );
  }, [pedidosAtrasados, busca]);

  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Projetos em Atraso"
      iconeTitulo={AlertTriangle}
      corDestaque="rose"
      termoBusca={busca}
      aoMudarBusca={setBusca}
      placeholderBusca="PESQUISAR NOS ATRASADOS..."
      temResultados={filtrados.length > 0}
      totalResultados={filtrados.length}
      iconeVazio={Clock}
      mensagemVazio="Não há projetos com prazo de entrega expirado no momento."
      infoRodape="* Pedidos concluídos não aparecem nesta lista, mesmo que o prazo tenha passado."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtrados.map((p) => (
          <CartaoPedido key={p.id} pedido={p} aoEditar={aoEditar} />
        ))}
      </div>
    </ModalListagemPremium>
  );
}
