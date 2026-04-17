import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { TecnologiaImpressora } from "@/funcionalidades/producao/impressoras/tipos";

export type OrdenacaoImpressora = "NOME" | "MAIOR_HORIMETRO" | "MENOR_HORIMETRO" | "MAIOR_VALOR" | "RECENTES" | "MANUTENCAO_URGENTE";

interface PropriedadesFiltrosImpressora {
    filtroAtual: TecnologiaImpressora | "Todas";
    aoFiltrar: (filtro: TecnologiaImpressora | "Todas") => void;
    ordenacaoAtual: OrdenacaoImpressora;
    aoOrdenar: (ordenacao: OrdenacaoImpressora) => void;
    ordemInvertida: boolean;
    aoInverterOrdem: () => void;
}

export function FiltrosImpressora({
    filtroAtual,
    aoFiltrar,
    ordenacaoAtual,
    aoOrdenar,
    ordemInvertida,
    aoInverterOrdem,
}: PropriedadesFiltrosImpressora) {
    const [seletorAberto, definirSeletorAberto] = useState(false);
    const referenciaSeletor = useRef<HTMLDivElement>(null);

    const opcoesOrdenacao: { valor: OrdenacaoImpressora; rotulo: string }[] = [
        { valor: "NOME", rotulo: "Ordem Alfabética" },
        { valor: "MAIOR_HORIMETRO", rotulo: "Maior Horímetro Total" },
        { valor: "MENOR_HORIMETRO", rotulo: "Menor Horímetro Total" },
        { valor: "MAIOR_VALOR", rotulo: "Maior Valor de Compra" },
        { valor: "RECENTES", rotulo: "Adicionadas Recentemente" },
        { valor: "MANUTENCAO_URGENTE", rotulo: "Manutenção Urgente" },
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
            {/* Tabs de Filtro (Padronizada e Neutra) */}
            <div className="flex items-center p-1 bg-zinc-100/50 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/5 rounded-full overflow-x-auto no-scrollbar max-w-full">
                <button
                    onClick={() => aoFiltrar("Todas")}
                    className={`px-5 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${filtroAtual === "Todas"
                        ? "bg-zinc-800 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                        }`}
                >
                    Todas
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
                {/* Espaço reservado onde ficava a temperatura no layout original */}
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
                        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 py-1">
                            {opcoesOrdenacao.map((opcao) => (
                                <button
                                    key={opcao.valor}
                                    onClick={() => {
                                        aoOrdenar(opcao.valor);
                                        definirSeletorAberto(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${ordenacaoAtual === opcao.valor
                                        ? "bg-zinc-800 dark:bg-white text-white dark:text-zinc-950 font-bold"
                                        : "text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5"
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
