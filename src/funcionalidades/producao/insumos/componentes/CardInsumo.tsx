import {
  Edit2,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  History,
} from "lucide-react";
import { Insumo, CategoriaInsumo } from "@/funcionalidades/producao/insumos/tipos";
import { Dica } from "@/compartilhado/componentes/Dica";

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
  aoEditar: (insumo: Insumo) => void;
  aoBaixar: (insumo: Insumo) => void;
  aoRepor: (insumo: Insumo) => void;
  aoExcluir: (insumo: Insumo) => void;
  aoVerHistorico: (insumo: Insumo) => void;
}

export function CardInsumo({
  insumo,
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
      className="group relative flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 px-6 border-b border-gray-100 dark:border-white/[0.03] transition-all hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
    >
      {/* 1. ACENTO E NOME (Sempre expande o máximo possível) */}
      <div className="flex items-center gap-4 flex-1 min-w-[200px]">
        <div className={`h-10 w-1.5 rounded-full ${corDaCategoria} shadow-sm transition-all group-hover:scale-y-110`} />
        <div className="flex flex-col">
          <h3 className="text-[15px] font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1.5 pt-1">
            {insumo.nome}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-2 py-0.5 rounded-md bg-zinc-200/50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-[0.1em] border border-zinc-300/20 dark:border-white/5 whitespace-nowrap">
              {insumo.categoria}
            </span>
            {insumo.marca && (
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest truncate max-w-[100px]">
                {insumo.marca}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BLOCO DE DADOS (Preço e Estoque) */}
      <div className="flex items-center gap-6 flex-wrap md:flex-nowrap">
        {/* 2. CUSTO E VALORIZAÇÃO */}
        <div className="flex flex-col items-start md:items-end min-w-[120px]">
          <div className="flex items-baseline gap-1">
            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase">UN:</span>
            <span className="text-[14px] font-black text-gray-700 dark:text-zinc-300 tabular-nums">
              {insumo.custoMedioUnidade.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
          <div className="flex items-center gap-1 leading-none mt-1">
            <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">VALOR:</span>
            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 tabular-nums uppercase underline decoration-zinc-800/20 underline-offset-2">
              {(insumo.quantidadeAtual * insumo.custoMedioUnidade).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>
        </div>

        {/* 3. ESTOQUE CENTRAL */}
        <div className="flex flex-col items-center min-w-[80px]">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className={`text-4xl font-black tabular-nums tracking-tighter ${estaComEstoqueBaixo ? 'text-rose-500 shadow-rose-500/20' : 'text-gray-900 dark:text-white'}`}>
              {insumo.quantidadeAtual}
            </span>
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase italic">{insumo.unidadeMedida}</span>
          </div>
          <div className={`mt-0.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${estaComEstoqueBaixo ? 'border-rose-200 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 animate-pulse' : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-[#34d399] dark:border-emerald-500/20 opacity-60'}`}>
            {estaComEstoqueBaixo ? 'RE-SUPRIR' : 'ESTOQUE'}
          </div>
        </div>
      </div>

      {/* 4. BOTÕES DE AÇÃO E FERRAMENTAS */}
      <div className="flex items-center gap-3 ml-auto md:ml-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => aoBaixar(insumo)}
            className="group/btn h-11 px-4 sm:px-6 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 border border-amber-500/20 hover:border-amber-500"
          >
            <ArrowDownCircle size={16} strokeWidth={3} className="transition-transform group-hover/btn:scale-110" />
            <span className="hidden sm:inline">Baixar</span>
          </button>
          
          <button
            onClick={() => aoRepor(insumo)}
            className="group/btn h-11 px-4 sm:px-6 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 border border-emerald-500/20 hover:border-emerald-500"
          >
            <ArrowUpCircle size={16} strokeWidth={3} className="transition-transform group-hover/btn:scale-110" />
            <span className="hidden sm:inline">Repor</span>
          </button>
        </div>

        {/* Ferramentas Secundárias */}
        <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity ml-2 border-l border-zinc-200 dark:border-white/5 pl-2">
          <Dica texto="Histórico">
            <button onClick={() => aoVerHistorico(insumo)} className="p-2 text-zinc-400 hover:text-sky-500 transition-colors">
              <History size={16} />
            </button>
          </Dica>
          <Dica texto="Editar">
            <button onClick={() => aoEditar(insumo)} className="p-2 text-zinc-400 hover:text-indigo-500 transition-colors">
              <Edit2 size={16} />
            </button>
          </Dica>
          <Dica texto="Arquivar">
            <button onClick={() => aoExcluir(insumo)} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors">
              <Trash2 size={16} />
            </button>
          </Dica>
        </div>
      </div>
    </div>
  );
}
