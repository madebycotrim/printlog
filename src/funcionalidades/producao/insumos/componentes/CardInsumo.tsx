import {
  Edit2,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  History as HistoryIcon,
} from "lucide-react";
import { Insumo, CategoriaInsumo } from "@/funcionalidades/producao/insumos/tipos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

/** Mapa de cores por categoria para a barra lateral do card */
const CORES_CATEGORIA: Record<CategoriaInsumo, string> = {
  Limpeza: "bg-sky-500",
  Embalagem: "bg-amber-500",
  Fixação: "bg-orange-500",
  Eletrônica: "bg-violet-500",
  Acabamento: "bg-emerald-500",
  Geral: "bg-muted-foreground/40",
  Outros: "bg-muted-foreground/40",
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
  
  const CORES_AURA: Record<CategoriaInsumo, string> = {
    Limpeza: "#0ea5e9",
    Embalagem: "#f59e0b",
    Fixação: "#f97316",
    Eletrônica: "#8b5cf6",
    Acabamento: "#10b981",
    Geral: "#71717a",
    Outros: "#71717a",
  };
  const corAura = CORES_AURA[insumo.categoria] || "#71717a";

  return (
    <div className="group relative bg-card rounded-xl border border-borda-sutil p-4 transition-all duration-300 hover:bg-muted/30 overflow-hidden">
      {/* Aura de fundo dinâmica */}
      <div 
        className="absolute -right-20 -top-20 w-48 h-48 blur-[80px] opacity-[0.04] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: corAura }}
      />

      <div className="relative z-10 flex flex-col gap-4">
        {/* LINHA SUPERIOR: INFO + DADOS + ESTOQUE */}
        <div className="flex items-start justify-between gap-4">
          
          {/* IDENTIDADE */}
          <div className="flex items-start gap-3 flex-1">
            <div className={`h-8 w-1 rounded-full ${corDaCategoria} shadow-sm shrink-0 mt-1`} />
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
              </div>
            </div>
          </div>

          {/* DADOS FINANCEIROS */}
          <div className="flex flex-col items-end gap-0.5 mt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">UN:</span>
                <span className="text-[13px] font-black text-primary tabular-nums">
                  {centavosParaReais(insumo.custoMedioUnidade)}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">VALOR:</span>
                <span className="text-[9px] font-bold text-muted-foreground tabular-nums">
                  {centavosParaReais(insumo.quantidadeAtual * insumo.custoMedioUnidade)}
                </span>
              </div>
          </div>

          {/* ESTOQUE MONITOR */}
          <div className="flex flex-col items-center ml-2">
            <div className="flex items-baseline gap-1 leading-none">
              <span className={`text-3xl font-black tabular-nums tracking-tighter ${estaComEstoqueBaixo ? 'text-rose-500' : 'text-primary'}`}>
                {insumo.quantidadeAtual}
              </span>
              <span className="text-[9px] font-black text-muted-foreground uppercase italic">{insumo.unidadeMedida}</span>
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
                onClick={() => aoBaixar(insumo)}
                className="h-10 px-5 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all active:scale-95 border border-amber-500/20"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <ArrowDownCircle size={12} strokeWidth={3} />
                </div>
                Baixar
              </button>
              
              <button
                onClick={() => aoRepor(insumo)}
                className="h-10 px-5 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all active:scale-95 border border-emerald-500/20"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <ArrowUpCircle size={12} strokeWidth={3} />
                </div>
                Repor
              </button>
           </div>

           <div className="h-5 w-px bg-borda-sutil" />

           <div className="flex items-center gap-1">
             <button onClick={() => aoVerHistorico(insumo)} className="p-1.5 text-muted-foreground hover:text-sky-500 transition-all">
               <HistoryIcon size={16} />
             </button>
             <button onClick={() => aoEditar(insumo)} className="p-1.5 text-muted-foreground hover:text-indigo-500 transition-all">
               <Edit2 size={16} />
             </button>
             <button onClick={() => aoExcluir(insumo)} className="p-1.5 text-muted-foreground hover:text-rose-500 transition-all">
               <Trash2 size={16} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
