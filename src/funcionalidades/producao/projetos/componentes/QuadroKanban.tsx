import { useState } from "react";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { usePedidos } from "../hooks/usePedidos";
import { ColunaKanban } from "./ColunaKanban";
import { Carregamento } from "@/compartilhado/componentes";
import { Pedido } from "../tipos";
import { verificarSeEstaAtrasado } from "@/compartilhado/utilitarios/gestaoAtrasos";

interface PropriedadesQuadroKanban {
  pedidosInjetados?: Pedido[];
  abrirFormularioEdicao?: (id: string) => void;
  aoMover?: (id: string, novoStatus: StatusPedido) => void;
}

export function QuadroKanban({ pedidosInjetados, abrirFormularioEdicao, aoMover }: PropriedadesQuadroKanban) {
  const { pedidos: pedidosHook, carregando, moverPedido: moverPedidoHook } = usePedidos();

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
      titulo: "Produzindo",
      status: StatusPedido.EM_PRODUCAO,
      cor: "bg-indigo-500",
    },
    {
      titulo: "Acabamento",
      status: StatusPedido.ACABAMENTO,
      cor: "bg-sky-500",
    },
    {
      titulo: "Concluído",
      status: StatusPedido.CONCLUIDO,
      cor: "bg-emerald-500",
    },
  ];

  const [abaAtivaMobile, setAbaAtivaMobile] = useState<StatusPedido>(StatusPedido.A_FAZER);

  if (carregando) {
    return <Carregamento tipo="pulse" mensagem="Carregando Quadro de Produção..." />;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* 📱 Seletor Tátil de Abas Móbile (< md) */}
      <div className="md:hidden flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-white/5 overflow-x-auto scrollbar-none shrink-0">
        {colunas.map((coluna, index) => {
          const count = pedidos.filter((p) => {
            if (index === 0) {
              return p.status === coluna.status || 
                     (![StatusPedido.EM_PRODUCAO, StatusPedido.ACABAMENTO, StatusPedido.CONCLUIDO, StatusPedido.ARQUIVADO].includes(p.status as StatusPedido));
            }
            return p.status === coluna.status;
          }).length;

          const ativa = abaAtivaMobile === coluna.status || (index === 0 && ![StatusPedido.EM_PRODUCAO, StatusPedido.ACABAMENTO, StatusPedido.CONCLUIDO].includes(abaAtivaMobile));

          return (
            <button
              key={coluna.status}
              type="button"
              onClick={() => setAbaAtivaMobile(coluna.status)}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 touch-target ${
                ativa
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md border border-zinc-200 dark:border-white/10"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${coluna.cor}`} />
              <span>{coluna.titulo}</span>
              <span className={`ml-1 px-1.5 py-0.2 text-[10px] rounded-md ${ativa ? "bg-sky-500/10 text-sky-500 dark:text-sky-400" : "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 📱 Visão Móbile: Coluna Ativa */}
      <div className="md:hidden flex-1 min-h-0">
        {colunas.map((coluna, index) => {
          const estaAtiva = abaAtivaMobile === coluna.status || (index === 0 && ![StatusPedido.EM_PRODUCAO, StatusPedido.ACABAMENTO, StatusPedido.CONCLUIDO].includes(abaAtivaMobile));
          if (!estaAtiva) return null;

          const pedidosDaColuna = pedidos
            .filter((p) => {
              if (index === 0) {
                return p.status === coluna.status || 
                       (![StatusPedido.EM_PRODUCAO, StatusPedido.ACABAMENTO, StatusPedido.CONCLUIDO, StatusPedido.ARQUIVADO].includes(p.status as StatusPedido));
              }
              return p.status === coluna.status;
            })
            .sort((a, b) => {
              const aAtrasado = verificarSeEstaAtrasado(a);
              const bAtrasado = verificarSeEstaAtrasado(b);
              if (aAtrasado && !bAtrasado) return -1;
              if (!aAtrasado && bAtrasado) return 1;
              return 0;
            });

          return (
            <div key={coluna.status} className="h-full">
              <ColunaKanban
                titulo={coluna.titulo}
                status={coluna.status}
                cor={coluna.cor}
                pedidos={pedidosDaColuna}
                aoMover={lidarComMover}
                abrirFormularioEdicao={abrirFormularioEdicao}
              />
            </div>
          );
        })}
      </div>

      {/* 🖥️ Visão Desktop: Grade 4 Colunas Lado a Lado (hidden md:flex) */}
      <div className="hidden md:flex gap-6 overflow-x-auto pb-6 px-1 h-full scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
        {colunas.map((coluna, index) => {
          const pedidosDaColuna = pedidos
            .filter((p) => {
              if (index === 0) {
                return p.status === coluna.status || 
                       (![StatusPedido.EM_PRODUCAO, StatusPedido.ACABAMENTO, StatusPedido.CONCLUIDO, StatusPedido.ARQUIVADO].includes(p.status as StatusPedido));
              }
              return p.status === coluna.status;
            })
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
              abrirFormularioEdicao={abrirFormularioEdicao}
            />
          );
        })}
      </div>
    </div>
  );
}
