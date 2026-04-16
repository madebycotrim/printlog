import {
  Edit2,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Trash2,
  ShoppingCart,
  History,
  Scissors,
} from "lucide-react";
import { Insumo, CategoriaInsumo } from "@/funcionalidades/producao/insumos/tipos";
import { Dica } from "@/compartilhado/componentes/Dica";
import { pluralizar } from "@/compartilhado/utilitarios/formatadores";

/** Mapa de cores por categoria para a barra lateral do card */
const CORES_CATEGORIA: Record<CategoriaInsumo, string> = {
  Limpeza: "bg-sky-500",
  Embalagem: "bg-amber-500",
  Fixação: "bg-orange-500",
  Eletrônica: "bg-violet-500",
  Acabamento: "bg-emerald-500",
  Geral: "bg-gray-400 dark:bg-zinc-500",
  Outros: "bg-gray-400 dark:bg-zinc-500",
};

interface PropriedadesCardInsumo {
  insumo: Insumo;
  ultimo?: boolean;
  aoEditar: (insumo: Insumo) => void;
  aoBaixar: (insumo: Insumo) => void;
  aoRepor: (insumo: Insumo) => void;
  aoExcluir: (insumo: Insumo) => void;
  aoVerHistorico: (insumo: Insumo) => void;
}

export function CardInsumo({
  insumo,
  ultimo,
  aoEditar,
  aoBaixar,
  aoRepor,
  aoExcluir,
  aoVerHistorico,
}: PropriedadesCardInsumo) {
  const estaComEstoqueBaixo = insumo.quantidadeAtual <= insumo.quantidadeMinima;
  const corDaCategoria = CORES_CATEGORIA[insumo.categoria] || "bg-gray-400 dark:bg-zinc-500";

  return (
    <div
      className={`py-4 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-card/40 relative group ${!ultimo ? "border-b border-gray-100 dark:border-white/5" : ""}`}
    >
      {/* SEÇÃO 1: Identificação */}
      <div className="flex-1 min-w-[200px] flex items-center gap-3">
        <div className={`h-8 w-1 rounded-full ${corDaCategoria}`} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{insumo.nome}</span>
            {estaComEstoqueBaixo && (
              <div
                title="Estoque Crítico"
                className="flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400 p-0.5 px-1 rounded-md"
              >
                <AlertTriangle size={12} strokeWidth={2.5} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 leading-none mt-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-bold uppercase tracking-wider border border-gray-200 dark:border-white/5">
              {insumo.categoria}
            </span>
            {insumo.itemFracionavel && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider border border-violet-200 dark:border-violet-500/20 flex items-center gap-0.5">
                <Scissors size={8} strokeWidth={2.5} />
                Fracionável
              </span>
            )}
            {insumo.marca && (
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">• {insumo.marca}</span>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO 2 e 3: Custo e Estoque (Agrupados lado a lado) */}
      <div className="flex items-center gap-6 justify-between md:justify-end flex-1 md:flex-none mt-2 md:mt-0">
        {/* Custo */}
        <div className="flex flex-col items-start md:items-end min-w-[120px]">
          <div className="flex items-baseline gap-1 mb-0.5">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {insumo.custoMedioUnidade.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-500">
              /{insumo.unidadeMedida.toLowerCase()}
            </span>
          </div>
          {insumo.itemFracionavel && insumo.rendimentoTotal && insumo.unidadeConsumo ? (
            <div className="flex items-baseline gap-1">
              <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest leading-none">
                EFETIVO:
              </span>
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 leading-none">
                {(insumo.custoMedioUnidade / insumo.rendimentoTotal).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
              <span className="text-[9px] font-medium text-violet-500/70 dark:text-violet-400/60 leading-none">
                /{insumo.unidadeConsumo}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                TOTAL:
              </span>
              <span className="text-[10px] font-medium text-gray-600 dark:text-zinc-400 leading-none">
                {(insumo.quantidadeAtual * insumo.custoMedioUnidade).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Estoque */}
        <div className="flex flex-col items-start md:items-center min-w-[100px] gap-1.5">
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-[22px] font-black text-gray-900 dark:text-white tracking-tight">
              {insumo.quantidadeAtual}
            </span>
            <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase">
              {
                pluralizar(
                  insumo.quantidadeAtual,
                  insumo.unidadeMedida.toLowerCase(),
                  insumo.unidadeMedida.toLowerCase() + "s",
                ).split(" ")[1]
              }
            </span>
          </div>
          {estaComEstoqueBaixo ? (
            <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 leading-none">
              Estoque Baixo
            </div>
          ) : (
            <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-[#062b1a] text-emerald-600 dark:text-[#34d399] leading-none">
              Em Estoque
            </div>
          )}
        </div>

        {/* Divisor Visual (Apenas Desktop) */}
        <div className="hidden md:block w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

        {/* SEÇÃO 4: AÇÕES */}
        <div className="flex items-center gap-1.5">
          {/* Ações Primárias — Sempre visíveis */}
          <button
            onClick={() => aoBaixar(insumo)}
            className="p-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors"
          >
            <ArrowDownCircle size={16} strokeWidth={2.5} />
            <span className="hidden sm:block">Baixar</span>
          </button>

          <button
            onClick={() => aoRepor(insumo)}
            className="p-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors"
          >
            <ArrowUpCircle size={16} strokeWidth={2.5} />
            <span className="hidden sm:block">Repor</span>
          </button>

          {/* Ações Secundárias — Sempre visíveis */}
          <div className="flex items-center gap-0.5 transition-opacity duration-200">
            {/* Se tiver link de compra, são 4 botões. O usuário quer apenas os 3 ÚLTIMOS. Logo, histórico fica sem tooltip nesse caso. */}
            {insumo.linkCompra ? (
              <button
                onClick={() => aoVerHistorico(insumo)}
                className="p-2 flex items-center justify-center text-gray-400 hover:text-violet-600 dark:text-zinc-500 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors"
              >
                <History size={16} strokeWidth={2.5} />
              </button>
            ) : (
              <Dica texto="Ver Histórico">
                <button
                  onClick={() => aoVerHistorico(insumo)}
                  className="p-2 flex items-center justify-center text-gray-400 hover:text-violet-600 dark:text-zinc-500 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-colors"
                >
                  <History size={16} strokeWidth={2.5} />
                </button>
              </Dica>
            )}

            {insumo.linkCompra && (
              <Dica texto="Comprar Online">
                <a
                  href={insumo.linkCompra}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 flex items-center justify-center text-gray-400 hover:text-sky-600 dark:text-zinc-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl transition-colors"
                >
                  <ShoppingCart size={16} strokeWidth={2.5} />
                </a>
              </Dica>
            )}

            <Dica texto="Editar">
              <button
                onClick={() => aoEditar(insumo)}
                className="p-2 flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
              >
                <Edit2 size={16} strokeWidth={2.5} />
              </button>
            </Dica>

            <Dica texto="Remover">
              <button
                onClick={() => aoExcluir(insumo)}
                className="p-2 flex items-center justify-center text-gray-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </Dica>
          </div>
        </div>
      </div>
    </div>
  );
}
