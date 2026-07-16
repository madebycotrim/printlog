import {
  Edit2,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  History as HistoryIcon,
} from "lucide-react";
import { Insumo, CategoriaInsumo } from "@/funcionalidades/producao/insumos/tipos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { obterIconeInsumo } from "@/funcionalidades/producao/insumos/constantes";
import { createElement } from "react";

/** Mapa de cores por categoria para a barra lateral do card */
const CORES_CATEGORIA: Record<CategoriaInsumo, string> = {
  Limpeza: "bg-sky-500",
  Embalagem: "bg-amber-500",
  Embrulho: "bg-pink-500",
  Fixação: "bg-red-500",
  Eletrônica: "bg-violet-500",
  Acabamento: "bg-emerald-500",
  Proteção: "bg-teal-500",
  Geral: "bg-zinc-500",
  Outros: "bg-stone-500",
};

/** Variações de cor para os botões primários (Repor) */
const CORES_BOTAO_PRIMARIO: Record<CategoriaInsumo, string> = {
  Limpeza: "text-sky-500 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20",
  Embalagem: "text-amber-500 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20",
  Embrulho: "text-pink-500 border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20",
  Fixação: "text-red-500 border-red-500/30 bg-red-500/10 hover:bg-red-500/20",
  Eletrônica: "text-violet-500 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20",
  Acabamento: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20",
  Proteção: "text-teal-500 border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20",
  Geral: "text-zinc-500 border-zinc-500/30 bg-zinc-500/10 hover:bg-zinc-500/20",
  Outros: "text-stone-500 border-stone-500/30 bg-stone-500/10 hover:bg-stone-500/20",
};

/** Variações mais suaves para botões secundários (Baixar) */
const CORES_BOTAO_SECUNDARIO: Record<CategoriaInsumo, string> = {
  Limpeza: "text-sky-500 border-sky-500/20 bg-transparent hover:bg-sky-500/5",
  Embalagem: "text-amber-500 border-amber-500/20 bg-transparent hover:bg-amber-500/5",
  Embrulho: "text-pink-500 border-pink-500/20 bg-transparent hover:bg-pink-500/5",
  Fixação: "text-red-500 border-red-500/20 bg-transparent hover:bg-red-500/5",
  Eletrônica: "text-violet-500 border-violet-500/20 bg-transparent hover:bg-violet-500/5",
  Acabamento: "text-emerald-500 border-emerald-500/20 bg-transparent hover:bg-emerald-500/5",
  Proteção: "text-teal-500 border-teal-500/20 bg-transparent hover:bg-teal-500/5",
  Geral: "text-zinc-500 border-zinc-500/20 bg-transparent hover:bg-zinc-500/5",
  Outros: "text-stone-500 border-stone-500/20 bg-transparent hover:bg-stone-500/5",
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
  const corDaCategoria = CORES_CATEGORIA[insumo.categoria] || "bg-muted-foreground/40";
  

  const custoEfetivo = insumo.itemFracionavel && insumo.rendimentoTotal 
    ? insumo.custoMedioUnidade / insumo.rendimentoTotal 
    : null;

  return (
    <div 
      onClick={() => aoVerHistorico(insumo)}
      className="group relative bg-card rounded-xl border border-borda-sutil p-4 transition-all duration-300 hover:bg-muted/30 overflow-hidden cursor-pointer"
    >

      <div className="relative z-10 flex flex-col gap-4">
        {/* LINHA SUPERIOR: INFO + DADOS + ESTOQUE */}
        <div className="flex items-start justify-between gap-4">
          
          {/* IDENTIDADE */}
          <div className="flex items-start gap-3 flex-1">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${corDaCategoria.replace('bg-', 'bg-').replace('500', '500/10')} ${corDaCategoria.replace('bg-', 'text-')}`}>
              {createElement(obterIconeInsumo(insumo.icone, insumo.categoria), { size: 20, strokeWidth: 2.5 })}
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-primary uppercase tracking-tight leading-none mb-2">
                {insumo.nome}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-black uppercase tracking-[0.1em] border border-borda-sutil">
                  {insumo.categoria}
                </span>
                {insumo.marca && (
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[100px]">
                    {insumo.marca}
                  </span>
                )}
                {insumo.itemFracionavel && insumo.rendimentoTotal && (
                  <span className="text-[9px] font-bold text-sky-500 uppercase tracking-widest border border-sky-500/20 px-1.5 rounded bg-sky-500/5">
                    Rende {insumo.rendimentoTotal}{insumo.unidadeConsumo}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* DADOS FINANCEIROS */}
          <div className="flex flex-col items-end gap-1 mt-1">
              {custoEfetivo !== null ? (
                // Se é fracionado, o maior destaque é o custo efetivo!
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[13px] font-black text-sky-500 tabular-nums">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(custoEfetivo / 100)}
                    </span>
                    <span className="text-[8px] font-black text-sky-500/70 uppercase tracking-widest">
                      / {insumo.unidadeConsumo}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 opacity-60">
                    <span className="text-[9px] font-bold text-muted-foreground tabular-nums">
                      {centavosParaReais(insumo.custoMedioUnidade)}
                    </span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                      / {insumo.unidadeMedida || "UN"}
                    </span>
                  </div>
                </div>
              ) : (
                // Se não é fracionado, mostra o custo base normal
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[13px] font-black text-primary tabular-nums">
                      {centavosParaReais(insumo.custoMedioUnidade)}
                    </span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest truncate max-w-[40px]" title={insumo.unidadeMedida || "UN"}>
                      / {insumo.unidadeMedida || "UN"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">ESTOQUE:</span>
                    <span className="text-[9px] font-bold text-muted-foreground tabular-nums">
                      {centavosParaReais(insumo.quantidadeAtual * insumo.custoMedioUnidade)}
                    </span>
                  </div>
                </div>
              )}
          </div>

          {/* ESTOQUE MONITOR */}
          <div className="flex flex-col items-center ml-2">
            <div className="flex items-baseline gap-1 leading-none">
              <span className={`text-3xl font-black tabular-nums tracking-tighter ${estaComEstoqueBaixo ? 'text-rose-500' : 'text-primary'}`}>
                {insumo.quantidadeAtual}
              </span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                {insumo.unidadeMedida || "UN"}
              </span>
            </div>
            <div className={`mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border ${
              estaComEstoqueBaixo 
                ? 'border-rose-500/20 bg-rose-500/10 text-rose-500 animate-pulse' 
                : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500/80'
            }`}>
              {estaComEstoqueBaixo ? 'RE-SUPRIR' : 'ESTOQUE'}
            </div>
          </div>
        </div>

          {/* LINHA INFERIOR: BOTÕES + FERRAMENTAS */}
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  aoBaixar(insumo);
                }}
                className={`h-10 px-5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all active:scale-95 border ${CORES_BOTAO_SECUNDARIO[insumo.categoria] || CORES_BOTAO_SECUNDARIO.Geral}`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-current/10">
                  <ArrowDownCircle size={12} strokeWidth={3} />
                </div>
                Baixar
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  aoRepor(insumo);
                }}
                className={`h-10 px-5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all active:scale-95 border ${CORES_BOTAO_PRIMARIO[insumo.categoria] || CORES_BOTAO_PRIMARIO.Geral}`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-current/10">
                  <ArrowUpCircle size={12} strokeWidth={3} />
                </div>
                Repor
              </button>
           </div>

           <div className="h-5 w-px bg-borda-sutil" />

           <div className="flex items-center gap-1">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 aoVerHistorico(insumo);
               }}
               className="p-1.5 text-muted-foreground hover:text-sky-500 transition-all"
             >
               <HistoryIcon size={16} />
             </button>
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 aoEditar(insumo);
               }}
               className="p-1.5 text-muted-foreground hover:text-indigo-500 transition-all"
             >
               <Edit2 size={16} />
             </button>
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 aoExcluir(insumo);
               }}
               className="p-1.5 text-muted-foreground hover:text-rose-500 transition-all"
             >
               <Trash2 size={16} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
