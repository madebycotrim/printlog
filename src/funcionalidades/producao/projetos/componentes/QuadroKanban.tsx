import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { usarPedidos } from "../hooks/usarPedidos";
import { ColunaKanban } from "./ColunaKanban";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";
import { Pedido } from "../tipos";
import { verificarSeEstaAtrasado } from "@/compartilhado/utilitarios/gestaoAtrasos";

interface PropriedadesQuadroKanban {
  pedidosInjetados?: Pedido[];
  aoEditar?: (id: string) => void;
  aoMover?: (id: string, novoStatus: StatusPedido) => void;
}

export function QuadroKanban({ pedidosInjetados, aoEditar, aoMover }: PropriedadesQuadroKanban) {
  const { pedidos: pedidosHook, carregando, moverPedido: moverPedidoHook } = usarPedidos();

  // Se pedidosInjetados for fornecido, usa ele (para busca/filtros da página),
  // caso contrário usa o estado interno do hook.
  const pedidos = pedidosInjetados ?? pedidosHook;
  const lidarComMover = aoMover ?? moverPedidoHook;

  const colunas = [
    {
      titulo: "A Fazer",
      status: StatusPedido.A_FAZER,
      cor: "bg-amber-500",
    },
    {
      titulo: "Em Produção",
      status: StatusPedido.EM_PRODUCAO,
      cor: "bg-sky-500",
    },
    {
      titulo: "Acabamento",
      status: StatusPedido.ACABAMENTO,
      cor: "bg-violet-500",
    },
    {
      titulo: "Concluído",
      status: StatusPedido.CONCLUIDO,
      cor: "bg-emerald-500",
    },
  ];

  if (carregando) {
    return <Carregamento tipo="pulse" mensagem="Carregando Quadro de Produção..." />;
  }

  return (
    <div className="flex gap-8 overflow-x-auto pb-4 px-1 h-full scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/5">
      {colunas.map((coluna) => {
        const pedidosDaColuna = pedidos
          .filter((p) => p.status === coluna.status)
          .sort((a, b) => {
            const aAtrasado = verificarSeEstaAtrasado(a);
            const bAtrasado = verificarSeEstaAtrasado(b);
            if (aAtrasado && !bAtrasado) return -1;
            if (!aAtrasado && bAtrasado) return 1;
            return 0;
          });

        return (
          <ColunaKanban
            key={coluna.status}
            titulo={coluna.titulo}
            status={coluna.status}
            cor={coluna.cor}
            pedidos={pedidosDaColuna}
            aoMover={lidarComMover}
            aoEditar={aoEditar}
          />
        );
      })}
    </div>
  );
}
