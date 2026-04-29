import { Box, Package, RefreshCcw, Search, Plus, Check, Trash2 } from "lucide-react";
import { InsumoSelecionado } from "../tipos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { motion, AnimatePresence } from "framer-motion";

interface CardInsumosProps {
  insumos: any[];
  selecionados: InsumoSelecionado[];
  alertas: any[];
  busca: string;
  setBusca: (v: string) => void;
  alternar: (i: any) => void;
  atualizarQtd: (id: string, qtd: number) => void;
  remover: (id: string) => void;
  insumosFixos: number;
  setInsumosFixos: (v: number) => void;
  abrirGerenciar: () => void;
  abrirNovo: () => void;
}

export function CardInsumos({
  insumos, selecionados, alertas, busca, setBusca, alternar, atualizarQtd, remover, insumosFixos, setInsumosFixos, abrirGerenciar, abrirNovo
}: CardInsumosProps) {
  return (
    <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <Box size={18} className="text-violet-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-violet-500">Insumos e Adicionais</h3>
        </div>
        <div className="relative group">
          <input type="text" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full md:w-64 h-9 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-violet-500/30 outline-none text-xs font-bold uppercase tracking-widest transition-all" />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Package className="w-3 h-3 text-violet-500" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Estoque de Insumos</span>
          </div>
          <button onClick={abrirGerenciar} className="text-[10px] font-black uppercase text-violet-500 hover:text-violet-400 transition-colors flex items-center gap-1 group">
            Gerenciar Estoque <RefreshCcw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 min-h-[110px] items-stretch">
          {insumos.map((i) => {
            const sel = selecionados.some(s => s.id === i.id);
            return (
              <button 
                key={i.id} 
                onClick={() => alternar(i)} 
                className={`flex-shrink-0 min-w-[140px] p-4 rounded-2xl border-2 transition-all text-left relative group flex flex-col justify-between
                  ${sel ? "bg-violet-500/10 border-violet-500 shadow-lg shadow-violet-500/5" : "bg-gray-50 dark:bg-white/[0.02] border-transparent hover:border-violet-500/30"}
                `}
              >
                <div className={`p-2 rounded-lg mb-3 inline-block ${sel ? "bg-violet-500 text-white" : "bg-white dark:bg-white/5 text-zinc-400 group-hover:text-violet-500"}`}>
                  <Box size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-xs font-black uppercase truncate leading-tight">{i.nome}</h4>
                  <div className="flex flex-col mt-0.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">
                      {i.categoria || 'Geral'}
                    </p>
                    <span className={`text-[9px] font-black uppercase mt-0.5 ${i.quantidadeAtual <= i.quantidadeMinima ? 'text-rose-500' : 'text-violet-500'}`}>
                      {i.quantidadeAtual} {i.unidadeMedida} em estoque
                    </span>
                  </div>
                </div>
                {sel && <div className="absolute top-2 right-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in"><Check size={10} className="text-white" /></div>}
              </button>
            );
          })}

          {insumos.length === 0 && (
            <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <Package size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Sem Insumos</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Seu estoque está vazio no momento</span>
                </div>
              </div>
              <button 
                onClick={abrirNovo}
                className="px-4 h-9 bg-violet-500 hover:bg-violet-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2"
              >
                <Plus size={12} /> Cadastrar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {selecionados.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-12 border-2 border-dashed border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-transparent rounded-2xl flex flex-col items-center justify-center gap-3"
            >
              <Box size={24} className="text-gray-400 dark:text-zinc-600 opacity-40" />
              <p className="text-xs font-black uppercase tracking-widest text-violet-500/80 dark:text-violet-400/80">Selecione os insumos acima para calcular</p>
            </motion.div>
          ) : (
            selecionados.map((item) => {
            const alerta = alertas.find(a => a.insumoId === item.id);
            const original = insumos.find(i => i.id === item.id);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-2xl border flex flex-wrap md:flex-nowrap items-center gap-6 group transition-all
                  ${alerta ? "bg-rose-500/5 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]" : "bg-gray-50/50 dark:bg-white/[0.03] border-gray-100 dark:border-white/5"}
                `}
              >
                <div className="flex items-center gap-4 min-w-[180px]">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                    <Package size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tight">{item.nome}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Insumo</span>
                    {alerta && (
                      <span className="text-[9px] font-black text-rose-500 uppercase mt-1 flex items-center gap-1">
                        <RefreshCcw size={10} /> ESTOQUE CRÍTICO
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Quantidade ({original?.unidadeMedida || 'un'})
                    </label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={item.quantidade || ""} 
                      onChange={(e) => atualizarQtd(item.id, Number(e.target.value))} 
                      className={`w-full h-10 px-3 rounded-lg bg-white dark:bg-black/40 outline-none font-black text-xs border-transparent focus:border-violet-500/30 transition-all ${alerta ? "text-rose-500" : ""}`} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Custo Un.</label>
                    <div className="w-full h-10 px-3 rounded-lg bg-white/50 dark:bg-black/20 flex items-center">
                      <span className="font-black text-xs text-gray-400">
                        {centavosParaReais(item.custoCentavos)}
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={() => remover(item.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </motion.div>
            );
          })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
