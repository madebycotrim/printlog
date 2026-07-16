import { motion, AnimatePresence } from "framer-motion";
import { memo, useEffect } from "react";
import { Plus, Trash2, Zap } from "lucide-react";
import { CustoAdicional } from "../tipos";
import { InputBancario } from "@/compartilhado/componentes/ui";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface CardCustosAdicionaisProps {
  custosAdicionais: CustoAdicional[];
  adicionarCustoAdicional: (c: CustoAdicional) => void;
  removerCustoAdicional: (id: string) => void;
  cobrarCustosAdicionais: boolean;
  setCobrarCustosAdicionais: (v: boolean) => void;
  multiplicadorGeral: number;
}

export const CardCustosAdicionais = memo(function CardCustosAdicionais({
  custosAdicionais,
  adicionarCustoAdicional,
  removerCustoAdicional,
  cobrarCustosAdicionais,
  setCobrarCustosAdicionais,
  multiplicadorGeral
}: CardCustosAdicionaisProps) {
  
  const totalMensalCentavos = custosAdicionais.reduce((acc, c) => acc + c.valorCentavos, 0);

  // Mantém o painel aberto caso haja valor configurado via load/snapshot
  useEffect(() => {
    if (custosAdicionais.length > 0) {
      setCobrarCustosAdicionais(true);
    }
  }, [custosAdicionais.length, setCobrarCustosAdicionais]);

  return (
    <div className="flex flex-col">
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(16,185,129,0.15)] transition-all z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
            <Zap size={16} className={`${custosAdicionais.length > 0 ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Existem Custos Adicionais?</span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Embalagem, Setup de máquina, Operação, etc.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const novoEstado = !cobrarCustosAdicionais;
            setCobrarCustosAdicionais(novoEstado);
          }}
          className={`px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all border ${cobrarCustosAdicionais
            ? "bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/30 hover:bg-emerald-600"
            : "bg-card text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 border-borda-sutil shadow-sm"
            }`}
        >
          {cobrarCustosAdicionais ? "Ocultar" : "Adicionar"}
        </button>
      </div>

      <AnimatePresence>
        {cobrarCustosAdicionais && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-6 pt-8 rounded-b-xl bg-[linear-gradient(to_bottom,transparent_12px,var(--bg-card)_12px)] shadow-sm space-y-4 -mt-3 z-0 relative overflow-hidden"
          >
            {/* Quininhas para preencher o gap dos cantos arredondados */}
            <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_100%_0%,transparent_12px,var(--bg-card)_12px)] z-[-1]" />
            <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_0%_0%,transparent_12px,var(--bg-card)_12px)] z-[-1]" />

            <div className="flex items-center justify-between pb-3 border-b border-borda-sutil mb-4">
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-emerald-400" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Gestão de Custos Adicionais</h3>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Custo Total / {multiplicadorGeral > 1 ? 'Lote' : 'Unidade'}</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-xs font-black text-muted-foreground">R$</span>
                   <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                     {centavosParaReais(totalMensalCentavos * multiplicadorGeral)}
                   </span>
                 </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between pt-2 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Itens Adicionais</span>
                  <button
                    type="button"
                    onClick={() => adicionarCustoAdicional({ id: crypto.randomUUID(), nome: 'Novo Custo', valorCentavos: 0 })}
                    className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-500/10 px-2 py-1 rounded-md transition-all flex items-center gap-1"
                  >
                    <Plus size={10} /> Adicionar
                  </button>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {custosAdicionais.length === 0 ? (
                    <div className="text-center py-6 text-[10px] font-bold text-muted-foreground border border-dashed border-borda-sutil rounded-xl">
                      Nenhum custo extra adicionado.
                    </div>
                  ) : (
                    custosAdicionais.map((c) => (
                      <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-borda-sutil">
                        <input
                          type="text"
                          value={c.nome}
                          placeholder="Ex: Embalagem"
                          onChange={(e) => {
                            const novo = { ...c, nome: e.target.value };
                            removerCustoAdicional(c.id);
                            adicionarCustoAdicional(novo);
                          }}
                          className="flex-1 min-w-0 bg-transparent text-xs font-black text-primary outline-none"
                        />
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 px-2 py-1 rounded-lg border border-borda-sutil">
                            <span className="text-[9px] font-black text-emerald-500">R$</span>
                            <InputBancario
                              placeholder="0,00"
                              value={c.valorCentavos === 0 ? "" : c.valorCentavos / 100}
                              onChange={(e) => {
                                const v = e.target.value;
                                const novo = { ...c, valorCentavos: v === "" ? 0 : Math.round(Number(v) * 100) };
                                removerCustoAdicional(c.id);
                                adicionarCustoAdicional(novo);
                              }}
                              className="w-16 bg-transparent text-xs font-black text-right text-primary outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removerCustoAdicional(c.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
