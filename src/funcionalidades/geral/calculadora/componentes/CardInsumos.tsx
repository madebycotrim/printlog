import { Box, Package, RefreshCcw, Search, Plus, Minus, Check, Trash2 } from "lucide-react";
import { InsumoSelecionado } from "../tipos";
import { centavosParaReais, formatarMoedaFinancas } from "@/compartilhado/utilitarios/formatadores";
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
    <div className="p-6 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-yellow-400 border border-yellow-500/30">
            <Box size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-white">Insumos e Adicionais</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Complementos do projeto</span>
          </div>
        </div>
        
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={busca} 
            onChange={(e) => setBusca(e.target.value)} 
            className="w-full md:w-64 h-10 pl-9 pr-4 rounded-xl bg-zinc-950/60 border border-white/5 focus:border-yellow-500/30 outline-none text-xs font-bold uppercase tracking-widest transition-all text-white placeholder:text-zinc-700" 
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-yellow-500 transition-colors" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Package className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Estoque de Insumos</span>
          </div>
          <button onClick={abrirGerenciar} className="text-[10px] font-black uppercase text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1 group">
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
                className={`flex-shrink-0 min-w-[180px] p-3 rounded-2xl border-2 transition-all text-left relative group flex items-center gap-3
                  ${sel 
                    ? "bg-yellow-500/10 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)]" 
                    : "bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-yellow-500/30"}
                `}
              >
                <div className="shrink-0">
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${sel ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30" : "bg-white dark:bg-white/5 text-zinc-400 group-hover:text-yellow-500"}`}>
                    <Box size={18} />
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <h4 className="text-xs font-black uppercase truncate leading-tight">{i.nome}</h4>
                  <div className="flex flex-col mt-0.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase whitespace-nowrap">
                      {i.categoria || 'Geral'} • {formatarMoedaFinancas(i.custoMedioUnidade)}
                    </p>
                    <span className={`text-[8px] font-black uppercase mt-0.5 ${i.quantidadeAtual <= i.quantidadeMinima ? 'text-rose-500' : 'text-yellow-500'}`}>
                      {i.quantidadeAtual} {i.unidadeMedida} em estoque
                    </span>
                  </div>
                </div>

                {sel && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-white animate-in zoom-in duration-300 shadow-lg">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            );
          })}

          {insumos.length === 0 && (
            <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <Package size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Sem Insumos</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Seu estoque está vazio no momento</span>
                </div>
              </div>
              <button 
                onClick={abrirNovo}
                className="px-4 h-9 bg-yellow-500 hover:bg-yellow-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20 flex items-center gap-2"
              >
                <Plus size={12} /> Cadastrar
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <AnimatePresence mode="popLayout">
          {selecionados.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-12 border-2 border-dashed border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-transparent rounded-2xl flex flex-col items-center justify-center gap-3"
            >
              <Box size={24} className="text-gray-400 dark:text-zinc-600 opacity-40" />
              <p className="text-xs font-black uppercase tracking-widest text-yellow-500/80 dark:text-yellow-400/80">Selecione os insumos acima para calcular</p>
            </motion.div>
          ) : (
            <div className={`grid gap-4 ${
              selecionados.length === 1 
                ? "grid-cols-1" 
                : selecionados.length === 2 
                  ? "grid-cols-1 md:grid-cols-2" 
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}>
              {selecionados.map((item) => {
                const alerta = alertas.find(a => a.insumoId === item.id);
                const original = insumos.find(i => i.id === item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 group transition-all
                      ${alerta ? "bg-rose-500/5 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]" : "bg-gray-50/50 dark:bg-white/[0.03] border-gray-100 dark:border-white/5"}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                          <Package size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black uppercase tracking-tight truncate text-zinc-900 dark:text-zinc-100">{item.nome}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Insumo</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => remover(item.id)} 
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                          Qtd ({original?.unidadeMedida || 'un'})
                        </label>
                        <div className="flex items-center h-9 rounded-lg bg-white dark:bg-black/40 overflow-hidden border border-gray-100 dark:border-white/5 focus-within:border-yellow-500/30 transition-all">
                          <button 
                            type="button"
                            onClick={() => atualizarQtd(item.id, Math.max(0, (item.quantidade || 0) - 1))}
                            className="h-full px-2 text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-r border-gray-100 dark:border-white/5"
                          >
                            <Minus size={10} strokeWidth={3} />
                          </button>
                          <input 
                            type="number" 
                            placeholder="0"
                            value={item.quantidade || ""} 
                            onChange={(e) => atualizarQtd(item.id, Number(e.target.value))} 
                            className={`w-full h-full bg-transparent outline-none font-black text-xs text-center tabular-nums ${alerta ? "text-rose-500" : "text-gray-900 dark:text-white"}`} 
                          />
                          <button 
                            type="button"
                            onClick={() => atualizarQtd(item.id, (item.quantidade || 0) + 1)}
                            className="h-full px-2 text-gray-400 hover:text-yellow-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-l border-gray-100 dark:border-white/5"
                          >
                            <Plus size={10} strokeWidth={3} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Custo Un.</label>
                        <div className="w-full h-9 px-3 rounded-lg bg-white/40 dark:bg-black/20 flex items-center border border-gray-100 dark:border-white/5">
                          <span className="font-black text-xs text-gray-500 dark:text-zinc-400">
                            {centavosParaReais(item.custoCentavos)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {alerta && (
                      <span className="text-[8px] font-black text-rose-500 uppercase flex items-center gap-1 mt-1 animate-pulse">
                        <RefreshCcw size={10} /> ESTOQUE CRÍTICO
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
