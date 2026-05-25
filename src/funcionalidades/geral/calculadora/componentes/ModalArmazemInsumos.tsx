import { Settings, Plus, Star, Check, Package } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesModalArmazemInsumos {
  aberto: boolean;
  aoFechar: () => void;
  busca: string;
  setBusca: (v: string) => void;
  insumosFiltrados: any[];
  selecionados: any[];
  aoAlternar: (insumo: any) => void;
  aoCriarNovo: () => void;
  aoAlternarFavorito: (id: string) => void;
}

/**
 * Modal para listagem e seleção de insumos do armazém.
 */
export function ModalArmazemInsumos({
  aberto,
  aoFechar,
  busca,
  setBusca,
  insumosFiltrados,
  selecionados,
  aoAlternar,
  aoCriarNovo,
  aoAlternarFavorito
}: PropriedadesModalArmazemInsumos) {
  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Armazém de Insumos"
      iconeTitulo={Settings}
      corDestaque="teal"
      termoBusca={busca}
      aoMudarBusca={setBusca}
      temResultados={true}
      totalResultados={insumosFiltrados.length}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Botão Novo Insumo */}
        <button
          onClick={aoCriarNovo}
          className="p-3 rounded-2xl border-2 border-dashed border-borda-sutil dark:border-white/10 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all flex items-center gap-4 h-24 group"
        >
          <div className="shrink-0 w-14 flex items-center justify-center">
            <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all text-zinc-400 group-hover:text-white">
              <Plus size={22} />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white">Novo Insumo</span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Adicionar ao catálogo</span>
          </div>
        </button>

        {insumosFiltrados.map(i => {
          const isSelecionado = selecionados.some(s => s.id === i.id);
          const custoUnitario = i.custoMedioUnidade || 0;
          
          const CORES_AURA: Record<string, string> = {
            Limpeza: "#0ea5e9", // sky-500
            Embalagem: "#f59e0b", // amber-500
            Embrulho: "#ec4899", // pink-500
            Fixação: "#ef4444", // red-500
            Eletrônica: "#8b5cf6", // violet-500
            Acabamento: "#10b981", // emerald-500
            Proteção: "#14b8a6", // teal-500
            Geral: "#71717a", // zinc-500
            Outros: "#78716c", // stone-500
          };
          const corHex = CORES_AURA[i.categoria] || "#14b8a6";

          return (
            <div
              key={i.id}
              onClick={() => aoAlternar(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  aoAlternar(i);
                }
              }}
              className={`p-3 rounded-2xl border-2 transition-all text-left flex items-center gap-4 relative overflow-hidden h-24 bg-card cursor-pointer ${isSelecionado ? "shadow-md" : "hover:shadow-lg"}`}
              style={{
                borderColor: isSelecionado ? corHex : `${corHex}22`,
                backgroundColor: isSelecionado ? `${corHex}11` : undefined
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 opacity-40"
                style={{ backgroundColor: corHex }}
              />

              <div className="shrink-0 w-14 flex items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform duration-500">
                   <Package size={24} />
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-white truncate">
                      {i.nome}
                    </h4>
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter truncate">
                      {i.categoria} • {i.unidadeMedida}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        aoAlternarFavorito(i.id);
                      }}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${i.favorito
                        ? "text-amber-500 bg-amber-500/10"
                        : "text-zinc-400 hover:text-amber-500/50 hover:bg-white/5"
                        }`}
                    >
                      <Star size={10} fill={i.favorito ? "currentColor" : "none"} />
                    </button>
                    {isSelecionado && (
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-lg z-10"
                        style={{ backgroundColor: corHex }}
                      >
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between gap-2 border-t border-borda-sutil dark:border-white/5 pt-2 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Estoque</span>
                    <span className={`text-[9px] font-black tabular-nums ${i.quantidadeAtual < (i.quantidadeMinima || 0) ? 'text-rose-500' : 'text-zinc-600 dark:text-zinc-300'}`}>
                      {i.quantidadeAtual}{i.unidadeMedida}
                    </span>
                  </div>
                  <div className="text-right">
                    <span 
                      className="text-[10px] font-black tracking-tighter tabular-nums"
                      style={{ color: corHex }}
                    >
                      {centavosParaReais(custoUnitario)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ModalListagemPremium>
  );
}
