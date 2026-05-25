import { memo, useState, useMemo } from "react";
import { Box, Package, RefreshCcw, Search, Plus, Minus, Check, Trash2, Star, LayoutGrid } from "lucide-react";
import { InsumoSelecionado } from "../tipos";
import { motion, AnimatePresence } from "framer-motion";
import { ContadorAnimado } from "@/compartilhado/componentes/ui";
import { CATEGORIAS } from "@/funcionalidades/producao/insumos/constantes";
import { useDragScroll } from "@/compartilhado/hooks/useDragScroll";

interface CardInsumosProps {
  insumos: any[];
  selecionados: InsumoSelecionado[];
  alertas: any[];
  busca: string;
  setBusca: (v: string) => void;
  alternar: (i: any) => void;
  atualizarQtd: (id: string, qtd: number) => void;
  remover: (id: string) => void;
  alternarPorLote: (id: string) => void;
  abrirGerenciar: () => void;
  abrirNovo: () => void;
  modoEntrada: 'unitario' | 'lote';
  alternarFavorito: (id: string) => void;
}

export const CardInsumos = memo(function CardInsumos({
  insumos, selecionados, alertas, busca, setBusca, alternar, atualizarQtd, remover, alternarFavorito, alternarPorLote, abrirGerenciar, abrirNovo, modoEntrada
}: CardInsumosProps) {
  const [tipoOrdenacao, setTipoOrdenacao] = useState<'favoritos' | 'uso'>('favoritos');
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const dragScroll = useDragScroll<HTMLDivElement>();

  const tiposDisponiveis = useMemo(() => {
    const tipos = insumos.map(i => i.categoria).filter(Boolean);
    return Array.from(new Set(tipos)).sort();
  }, [insumos]);

  // Ordenação Inteligente: Favoritos ou Mais Usados
  const insumosOrdenados = useMemo(() => {
    let filtrados = insumos;
    if (filtroTipo) {
      filtrados = insumos.filter(i => i.categoria === filtroTipo);
    }

    return [...filtrados].sort((a, b) => {
      if (tipoOrdenacao === 'favoritos') {
        if (a.favorito === b.favorito) {
           // Se empatar no favorito, usa o uso como desempate (tamanho do histórico)
           return (b.historico?.length || 0) - (a.historico?.length || 0);
        }
        return a.favorito ? -1 : 1;
      } else {
        // Ordenação por Uso (Quantidade de registros no histórico)
        const usoA = a.historico?.length || 0;
        const usoB = b.historico?.length || 0;
        if (usoA === usoB) {
            // Se empatar no uso, usa o favorito como desempate
            return a.favorito === b.favorito ? 0 : (a.favorito ? -1 : 1);
        }
        return usoB - usoA;
      }
    });
  }, [insumos, tipoOrdenacao, filtroTipo]);

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

  return (
    <div className="p-6 rounded-3xl bg-card border border-borda-sutil relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-borda-sutil">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-500/30">
            <Box size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Insumos e Adicionais</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Complementos do projeto</span>
          </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-700 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={busca} 
            onChange={(e) => setBusca(e.target.value)} 
            className="w-full md:w-64 h-10 pl-10 pr-4 rounded-xl bg-zinc-100 dark:bg-zinc-950/60 border border-borda-sutil focus:border-teal-500/30 outline-none text-xs font-bold uppercase tracking-widest transition-all text-primary dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-700" 
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Package className="w-3 h-3 text-teal-500 hidden sm:block" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-gray-400 hidden sm:block">Estoque de Insumos</span>
            <div className="flex items-center gap-1 sm:ml-3 bg-zinc-100 dark:bg-zinc-950/40 p-0.5 rounded-lg border border-borda-sutil">
              <button 
                onClick={() => setTipoOrdenacao('favoritos')}
                className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${tipoOrdenacao === 'favoritos' ? 'bg-teal-500/20 text-teal-600 dark:text-teal-500' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-400'}`}
                title="Mostrar favoritos primeiro"
              >
                Favoritos
              </button>
              <button 
                onClick={() => setTipoOrdenacao('uso')}
                className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${tipoOrdenacao === 'uso' ? 'bg-teal-500/20 text-teal-600 dark:text-teal-500' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-400'}`}
                title="Mostrar os mais usados primeiro"
              >
                Mais Usados
              </button>
            </div>

            {tiposDisponiveis.length > 0 && (
              <>
                <div className="hidden sm:block w-[1px] h-3 bg-borda-sutil mx-1" />
                <div 
                  ref={dragScroll.ref}
                  {...dragScroll.events}
                  className={`flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950/40 p-0.5 rounded-lg border border-borda-sutil overflow-x-auto scrollbar-none ${dragScroll.isDragging ? 'cursor-grabbing select-none' : 'cursor-grab md:cursor-default'}`}
                >
                  <button 
                    onClick={(e) => { if (dragScroll.hasDragged.current) { e.preventDefault(); return; } setFiltroTipo(null) }}
                    className={`shrink-0 px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${filtroTipo === null ? 'bg-teal-500/20 text-teal-600 dark:text-teal-500' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-400'}`}
                  >
                    Todas
                  </button>
                  {tiposDisponiveis.map(tipo => (
                    <button 
                      key={tipo}
                      onClick={(e) => { if (dragScroll.hasDragged.current) { e.preventDefault(); return; } setFiltroTipo(tipo) }}
                      className={`shrink-0 px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${filtroTipo === tipo ? 'bg-teal-500/20 text-teal-600 dark:text-teal-500' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-400'}`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={abrirGerenciar} 
              className="text-[10px] font-black uppercase text-teal-500 hover:text-teal-400 transition-colors flex items-center gap-1 group"
            >
              Gerenciar Estoque <RefreshCcw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <div className="w-[1px] h-3 bg-borda-sutil" />
            <button 
              onClick={abrirNovo}
              className="w-5 h-5 flex items-center justify-center rounded-md bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-white transition-all active:scale-90"
              title="Adicionar Novo Insumo"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 overflow-y-auto max-h-[280px] scrollbar-thin pb-4 pr-2 min-h-[110px] items-stretch">
        {insumosOrdenados.length === 0 && insumos.length > 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-6 border border-dashed border-borda-sutil rounded-2xl bg-zinc-50 dark:bg-white/[0.01] relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
             <Search className="w-4 h-4 mb-1.5 text-zinc-400 dark:text-zinc-700 relative z-10" />
             <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-600 relative z-10">Sem resultados</span>
          </div>
        ) : insumosOrdenados.map((i) => {
          const sel = selecionados.some(s => s.id === i.id);
          const corHex = CORES_AURA[i.categoria] || "#84cc16"; // fallback lime-500
          const categoriaInfo = CATEGORIAS.find(c => c.id.toLowerCase() === i.categoria?.toLowerCase());
          const IconeCategoria = categoriaInfo?.icone || Box;

          return (
            <div 
              key={i.id} 
              onClick={() => alternar(i)} 
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  alternar(i);
                }
              }}
              className={`flex-shrink-0 min-w-[180px] p-3 rounded-2xl border-2 transition-all text-left relative group flex items-center gap-3 cursor-pointer
                ${sel 
                  ? "shadow-md" 
                  : "bg-zinc-50 dark:bg-white/5 border-borda-sutil"}
              `}
              style={{
                borderColor: sel ? corHex : undefined,
                backgroundColor: sel ? `${corHex}15` : undefined
              }}
              onMouseEnter={(e) => {
                if (!sel) e.currentTarget.style.borderColor = `${corHex}50`;
              }}
              onMouseLeave={(e) => {
                if (!sel) e.currentTarget.style.borderColor = '';
              }}
            >
              <div className="shrink-0">
                <div 
                  className={`p-2.5 rounded-xl transition-all duration-300 ${!sel && 'bg-white dark:bg-white/5 text-zinc-400 group-hover:text-current'}`}
                  style={sel ? { backgroundColor: corHex, color: '#fff', boxShadow: `0 4px 14px ${corHex}40` } : { color: corHex }}
                >
                  <IconeCategoria size={18} />
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <h4 className="text-xs font-black uppercase truncate leading-tight text-primary dark:text-white">{i.nome}</h4>
                <div className="flex flex-col mt-0.5">
                  <p className="text-[9px] font-bold text-zinc-500 dark:text-gray-400 uppercase whitespace-nowrap">
                    {i.categoria || 'Geral'} • <ContadorAnimado valor={i.custoMedioUnidade / 100} />
                  </p>
                  <div className="flex items-center justify-between mt-1 pt-0.5">
                    <span className="text-[7px] font-black uppercase text-zinc-400 tracking-widest">
                      Estoque
                    </span>
                    <span 
                      className={`text-[9px] font-black uppercase tabular-nums ${i.quantidadeAtual <= i.quantidadeMinima ? 'text-rose-500 animate-pulse' : 'text-zinc-500 dark:text-zinc-400'}`}
                    >
                      {i.quantidadeAtual} <span className="lowercase text-[8px] opacity-70">{i.unidadeMedida}</span>
                    </span>
                  </div>
                </div>
              </div>

              {sel && (
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white animate-in zoom-in duration-300 shadow-lg z-20"
                  style={{ backgroundColor: corHex }}
                >
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alternarFavorito(i.id);
                }}
                className={`absolute top-2 right-2 p-1 rounded-lg transition-all z-20 ${
                  i.favorito 
                    ? "text-amber-500 bg-amber-500/10" 
                    : "text-zinc-400 dark:text-zinc-700 hover:text-amber-600 dark:hover:text-amber-500/50 hover:bg-zinc-100 dark:hover:bg-white/5"
                }`}
                title={i.favorito ? "Remover dos favoritos" : "Marcar como favorito"}
              >
                <Star size={12} fill={i.favorito ? "currentColor" : "none"} />
              </button>
            </div>
          );
        })}

        {insumos.length === 0 && (
          <div className="col-span-full w-full flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-zinc-50 dark:bg-[#121214] border border-dashed border-zinc-200 dark:border-white/10 relative overflow-hidden group/empty shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.03] to-transparent pointer-events-none" />
            <div className="flex items-center gap-5 relative z-10 w-full md:w-auto mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-white/5 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover/empty:scale-110 group-hover/empty:text-teal-500 transition-all duration-500">
                <Package size={20} className="group-hover/empty:animate-bounce" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Estoque Vazio</span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase leading-relaxed mt-0.5">Nenhum insumo cadastrado ainda. Adicione agora para começar.</span>
              </div>
            </div>
            <button 
              onClick={abrirNovo}
              className="relative z-10 w-full md:w-auto px-6 h-10 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_4px_20px_-5px_rgba(20,184,166,0.4)] hover:shadow-[0_6px_25px_-5px_rgba(20,184,166,0.6)] flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={14} strokeWidth={3} /> Cadastrar Insumo
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {selecionados.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-16 border-2 border-dashed border-borda-sutil bg-zinc-50 dark:bg-zinc-950/20 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
              <div className="w-14 h-14 rounded-full bg-white dark:bg-zinc-900 border border-borda-sutil flex items-center justify-center text-zinc-300 dark:text-zinc-800 shadow-inner">
                <Package size={24} />
              </div>
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] relative z-10">Selecione insumos para calcular</p>
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
                const corHex = original ? (CORES_AURA[original.categoria] || "#84cc16") : "#84cc16";
                const categoriaInfo = original ? CATEGORIAS.find(c => c.id.toLowerCase() === original.categoria?.toLowerCase()) : null;
                const IconeCategoria = categoriaInfo?.icone || Package;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-3 rounded-2xl border flex flex-col justify-between gap-3 group transition-all
                      ${alerta ? "bg-rose-500/5 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]" : "bg-zinc-50 dark:bg-white/[0.03] border-borda-sutil"}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${corHex}15`, color: corHex }}
                        >
                          <IconeCategoria size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black uppercase tracking-tight truncate text-primary dark:text-zinc-100">{item.nome}</span>
                          <span className="text-[9px] font-bold text-zinc-500 dark:text-gray-400 uppercase mt-0.5">{original?.categoria || 'Insumo'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center flex-row-reverse">
                          <button 
                            onClick={(e) => { e.stopPropagation(); remover(item.id); }} 
                            className="w-0 group-hover:w-8 h-7 flex items-center justify-center text-zinc-400 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 overflow-hidden shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                          
                          {modoEntrada === 'unitario' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); alternarPorLote(item.id); }}
                              className={`px-2.5 h-7 rounded-lg text-[7px] font-black uppercase transition-all border flex items-center gap-1.5 shrink-0`}
                              style={item.porLote 
                                ? { backgroundColor: `${corHex}15`, color: corHex, borderColor: `${corHex}50`, boxShadow: `0 0 10px ${corHex}20` }
                                : { backgroundColor: "var(--bg-muted)", color: "#71717a", borderColor: "var(--borda-sutil)" }
                              }
                            >
                              <div style={{ color: item.porLote ? corHex : "#71717a" }}>
                                {item.porLote ? <LayoutGrid size={10} /> : <Box size={10} />}
                              </div>
                              {item.porLote ? "Mesa Completa" : "Por Peça"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-gray-400 tracking-widest leading-none">
                          Qtd ({original?.unidadeMedida || 'un'})
                        </label>
                        <div className="flex items-center h-9 rounded-lg bg-zinc-100 dark:bg-black/40 overflow-hidden border border-borda-sutil focus-within:border-lime-500/30 transition-all">
                          <button 
                            type="button"
                            onClick={() => atualizarQtd(item.id, Math.max(0, (item.quantidade || 0) - 1))}
                            className="h-full px-2 text-zinc-500 hover:text-lime-500 hover:bg-zinc-200 dark:hover:bg-white/5 transition-colors border-r border-borda-sutil"
                          >
                            <Minus size={10} strokeWidth={3} />
                          </button>
                          <input 
                            type="number" 
                            placeholder="0"
                            value={item.quantidade === 0 ? "" : item.quantidade} 
                            onChange={(e) => atualizarQtd(item.id, Number(e.target.value))} 
                            className={`w-full h-full bg-transparent outline-none font-black text-xs text-center tabular-nums ${alerta ? "text-rose-500" : "text-primary dark:text-white"}`} 
                          />
                          <button 
                            type="button"
                            onClick={() => atualizarQtd(item.id, (item.quantidade || 0) + 1)}
                            className="h-full px-2 text-zinc-500 hover:text-lime-500 hover:bg-zinc-200 dark:hover:bg-white/5 transition-colors border-l border-borda-sutil"
                          >
                            <Plus size={10} strokeWidth={3} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-gray-400 tracking-widest leading-none">
                          Custo Un.
                        </label>
                        <div className="w-full h-9 px-3 rounded-lg bg-zinc-100 dark:bg-black/40 flex items-center justify-center border border-borda-sutil">
                          <span className="font-black text-xs text-lime-500 text-center">
                            <ContadorAnimado valor={item.custoCentavos / 100} prefixo="R$ " />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] font-black text-emerald-500 text-center">
                        <ContadorAnimado valor={(item.quantidade * item.custoCentavos) / 100} prefixo="Total: R$ " />
                      </span>
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
});
