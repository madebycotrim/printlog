import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type FiltroTipoMaterial = "TODOS" | "FDM" | "SLA";
export type OrdenacaoMaterial = "NOME" | "MAIOR_PRECO" | "MENOR_ESTOQUE";

interface PropriedadesFiltrosMaterial {
  filtroAtual: FiltroTipoMaterial;
  aoFiltrar: (filtro: FiltroTipoMaterial) => void;
  ordenacaoAtual: OrdenacaoMaterial;
  aoOrdenar: (ordenacao: OrdenacaoMaterial) => void;
  ordemInvertida: boolean;
  aoInverterOrdem: () => void;
}

export function FiltrosMaterial({
  filtroAtual,
  aoFiltrar,
  ordenacaoAtual,
  aoOrdenar,
  ordemInvertida,
  aoInverterOrdem,
}: PropriedadesFiltrosMaterial) {
  const [seletorAberto, definirSeletorAberto] = useState(false);
  const referenciaSeletor = useRef<HTMLDivElement>(null);

  const opcoesOrdenacao: { valor: OrdenacaoMaterial; rotulo: string }[] = [
    { valor: "NOME", rotulo: "Ordem Alfabética" },
    { valor: "MAIOR_PRECO", rotulo: "Maior Valor em Estoque" },
    { valor: "MENOR_ESTOQUE", rotulo: "Menor Quantidade Restante" },
  ];

  const opcaoSelecionada =
    opcoesOrdenacao.find((o) => o.valor === ordenacaoAtual) ||
    opcoesOrdenacao[0];

  useEffect(() => {
    function lidarComCliqueFora(event: MouseEvent) {
      if (
        referenciaSeletor.current &&
        !referenciaSeletor.current.contains(event.target as Node)
      ) {
        definirSeletorAberto(false);
      }
    }
    document.addEventListener("mousedown", lidarComCliqueFora);
    return () => document.removeEventListener("mousedown", lidarComCliqueFora);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 w-full">
      {/* Tabs de Filtro (Padronizado e Neutro) */}
      <div className="flex items-center p-1 bg-zinc-100/50 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/5 rounded-full overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => aoFiltrar("TODOS")}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${filtroAtual === "TODOS"
            ? "bg-zinc-800 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
        >
          Todos
        </button>
        <button
          onClick={() => aoFiltrar("FDM")}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${filtroAtual === "FDM"
            ? "bg-zinc-800 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
        >
          Filamentos (FDM)
        </button>
        <button
          onClick={() => aoFiltrar("SLA")}
          className={`px-5 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${filtroAtual === "SLA"
            ? "bg-zinc-800 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
        >
          Resinas (SLA)
        </button>
      </div>

      <div className="flex-1 hidden xl:flex justify-center">
        {/* Pílula de Ambiente (Temperatura e Umidade) */}
        <div
          className="flex items-center gap-4 px-4 h-10 bg-transparent border border-gray-200 dark:border-white/10 rounded-xl shadow-sm cursor-help hover:border-gray-300 dark:hover:border-white/20 transition-colors"
          title="Condições do Ambiente de Impressão"
        >
          <div className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-orange-500 dark:text-orange-400"
            >
              <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
              <path d="M12 7v4" />
            </svg>
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-300 font-mono tracking-tight">
              24°C
            </span>
          </div>
          <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10" />
          <div className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-sky-500 dark:text-sky-400"
            >
              <path d="M12 22a5 5 0 0 0 5-5c0-2-2.5-7-5-12-2.5 5-5 10-5 12a5 5 0 0 0 5 5z" />
            </svg>
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-300 font-mono tracking-tight">
              45%
            </span>
          </div>
        </div>
      </div>

      {/* Ordenação (Padronizada e Neutra) */}
      <div className="flex items-center gap-2">
        <button
          onClick={aoInverterOrdem}
          data-ativo={ordemInvertida}
          title={ordemInvertida ? "Ordem Descendente" : "Ordem Ascendente"}
          className={`w-11 h-11 flex items-center justify-center transition-all focus:outline-none border-b-2 ${ordemInvertida
            ? "border-zinc-800 dark:border-white text-zinc-800 dark:text-white bg-zinc-800/5 dark:bg-white/5"
            : "border-gray-200 dark:border-white/10 text-gray-400 dark:text-zinc-500 hover:border-gray-300 dark:hover:border-white/20 bg-transparent"
            }`}
        >
          <ArrowUpDown size={16} className={`transition-transform duration-300 ${ordemInvertida ? "rotate-180" : ""}`} />
        </button>

        <div className="relative" ref={referenciaSeletor}>
          <button
            onClick={() => definirSeletorAberto(!seletorAberto)}
            className={`h-11 px-4 text-sm font-medium bg-transparent border-b-2 flex items-center justify-between gap-3 min-w-[240px] transition-all outline-none ${seletorAberto
              ? "border-zinc-800 dark:border-white text-zinc-900 dark:text-white"
              : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-white/20"
              }`}
          >
            {opcaoSelecionada.rotulo}
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${seletorAberto ? "rotate-180 text-zinc-900 dark:text-white" : ""}`}
            />
          </button>

          {seletorAberto && (
            <div className="absolute top-full right-0 w-full mt-1 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 py-1">
              {opcoesOrdenacao.map((opcao) => (
                <button
                  key={opcao.valor}
                  onClick={() => {
                    aoOrdenar(opcao.valor);
                    definirSeletorAberto(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${ordenacaoAtual === opcao.valor
                    ? "bg-zinc-800 dark:bg-white text-white dark:text-zinc-950 font-bold"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
                    }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
