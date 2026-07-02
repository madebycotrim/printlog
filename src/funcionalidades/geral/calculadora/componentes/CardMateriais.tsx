import { memo, useState, useMemo } from "react";
import { Layers, Box, RefreshCcw, Check, Plus, Trash2, Star, Search } from "lucide-react";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes";
import { motion, AnimatePresence } from "framer-motion";
import { MaterialSelecionado } from "../tipos";
import { ContadorAnimado } from "@/compartilhado/componentes/ui";
import { useDragScroll } from "@/compartilhado/hooks/useDragScroll";

interface CardMateriaisProps {
  materiais: any[];
  selecionados: MaterialSelecionado[];
  alertas: any[];
  busca: string;
  setBusca: (v: string) => void;
  alternar: (id: string) => void;
  atualizarQtd: (id: string, qtd: number) => void;
  atualizarPreco: (id: string, preco: number) => void;
  atualizarTempo?: (id: string, horas: number, minutos: number, segundos: number) => void;
  atualizarNomePeca?: (id: string, nome: string) => void;
  abrirArmazem: () => void;
  abrirCriar: () => void;
  alternarFavorito: (id: string) => void;
  adicionarPeca?: (id: string) => void;
  remover?: (id: string) => void;
}

export const CardMateriais = memo(function CardMateriais({
  materiais, selecionados, alertas, busca, setBusca, alternar, atualizarQtd, atualizarTempo, atualizarNomePeca, remover, abrirArmazem, abrirCriar, alternarFavorito, adicionarPeca
}: CardMateriaisProps) {
  const [tipoOrdenacao, setTipoOrdenacao] = useState<'favoritos' | 'uso'>('favoritos');
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const { ref: dragRef, isDragging, hasDragged, events: dragEvents } = useDragScroll<HTMLDivElement>();

  const tiposDisponiveis = useMemo(() => {
    const tipos = materiais.map(m => m.tipoMaterial || m.tipo).filter(Boolean);
    return Array.from(new Set(tipos)).sort();
  }, [materiais]);

  // Ordenação Inteligente: Favoritos ou Mais Usados
  const materiaisOrdenados = useMemo(() => {
    let filtrados = materiais;
    if (filtroTipo) {
      filtrados = materiais.filter(m => (m.tipoMaterial || m.tipo) === filtroTipo);
    }
    
    return [...filtrados].sort((a, b) => {
      if (tipoOrdenacao === 'favoritos') {
        if (a.favorito === b.favorito) {
           // Se empatar no favorito, usa o uso como desempate
           return (b.historicoUso?.length || 0) - (a.historicoUso?.length || 0);
        }
        return a.favorito ? -1 : 1;
      } else {
        // Ordenação por Uso (Quantidade de registros no histórico)
        const usoA = a.historicoUso?.length || 0;
        const usoB = b.historicoUso?.length || 0;
        if (usoA === usoB) {
            // Se empatar no uso, usa o favorito como desempate
            return a.favorito === b.favorito ? 0 : (a.favorito ? -1 : 1);
        }
        return usoB - usoA;
      }
    });
  }, [materiais, tipoOrdenacao, filtroTipo]);

  return (
    <div className="p-6 rounded-3xl bg-card border border-borda-sutil relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 premium-card premium-card-cyan">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-borda-sutil">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            <Layers size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Materiais e Consumo</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Gerencie filamentos e resinas</span>
          </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 group-focus-within:text-cyan-500 transition-colors" />
          <input 
            type="text"
            placeholder="Buscar material..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full md:w-64 h-10 pl-10 pr-4 rounded-xl bg-muted/40 dark:bg-zinc-950/60 border border-borda-sutil focus:border-cyan-500/30 outline-none text-xs font-bold uppercase tracking-widest transition-all text-primary dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Box className="w-3 h-3 text-cyan-500 hidden sm:block" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-gray-400 hidden sm:block">Seu Inventário</span>
            <div className="flex items-center gap-1 sm:ml-3 bg-muted/30 dark:bg-zinc-950/40 p-0.5 rounded-lg border border-borda-sutil">
              <button 
                onClick={() => setTipoOrdenacao('favoritos')}
                className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${tipoOrdenacao === 'favoritos' ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-500' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-400'}`}
                title="Mostrar favoritos primeiro"
              >
                Favoritos
              </button>
              <button 
                onClick={() => setTipoOrdenacao('uso')}
                className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${tipoOrdenacao === 'uso' ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-500' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-400'}`}
                title="Mostrar os mais usados primeiro"
              >
                Mais Usados
              </button>
            </div>

            {tiposDisponiveis.length > 0 && (
              <>
                <div className="hidden sm:block w-[1px] h-3 bg-borda-sutil mx-1" />
                <div 
                  ref={dragRef}
                  {...dragEvents}
                  className={`flex items-center gap-1 bg-muted/30 dark:bg-zinc-950/40 p-0.5 rounded-lg border border-borda-sutil overflow-x-auto scrollbar-none ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab md:cursor-default'}`}
                >
                  <button 
                    onClick={(e) => { if (hasDragged.current) { e.preventDefault(); return; } setFiltroTipo(null) }}
                    className={`shrink-0 px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${filtroTipo === null ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-500' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-400'}`}
                  >
                    Todos
                  </button>
                  {tiposDisponiveis.map(tipo => (
                    <button 
                      key={tipo}
                      onClick={(e) => { if (hasDragged.current) { e.preventDefault(); return; } setFiltroTipo(tipo) }}
                      className={`shrink-0 px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${filtroTipo === tipo ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-500' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-400'}`}
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
              onClick={abrirArmazem}
              className="text-[10px] font-black uppercase text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1 group"
            >
              Gerenciar Armazém <RefreshCcw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <div className="w-[1px] h-3 bg-borda-sutil" />
            <button 
              onClick={abrirCriar}
              className="w-5 h-5 flex items-center justify-center rounded-md bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all active:scale-90"
              title="Adicionar Novo Material"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 overflow-y-auto max-h-[280px] scrollbar-thin pb-4 pr-2 min-h-[110px] items-stretch">
        {materiaisOrdenados.length === 0 && materiais.length > 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-6 border border-dashed border-borda-sutil rounded-2xl bg-zinc-50 dark:bg-white/[0.01] relative overflow-hidden">
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
             <Search className="w-4 h-4 mb-1.5 text-zinc-400 dark:text-zinc-600 relative z-10" />
             <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 relative z-10">Sem resultados</span>
          </div>
        ) : materiaisOrdenados.map((m) => {
          const selecionado = selecionados.some(s => s.id === m.id);
          return (
            <div
              key={m.id}
              onClick={() => alternar(m.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  alternar(m.id);
                }
              }}
              title={m.nome}
              className={`flex-shrink-0 min-w-[180px] p-3 rounded-2xl border-2 transition-all text-left relative group flex items-center gap-3 cursor-pointer
                ${selecionado 
                  ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]" 
                  : "border-borda-sutil bg-zinc-50 dark:bg-white/5 hover:border-cyan-500/30"}
              `}
            >
              <div className="shrink-0">
                {m.tipo === "FDM" ? (
                  <Carretel cor={m.cor} tamanho={36} className="-ml-1" />
                ) : (
                  <GarrafaResina cor={m.cor} tamanho={36} className="-ml-1" />
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                <h4 className="text-xs font-black uppercase truncate leading-tight text-primary dark:text-white">{m.nome}</h4>
                <div className="flex flex-col mt-0.5">
                  <p className="text-[9px] font-bold text-zinc-500 dark:text-gray-400 uppercase whitespace-nowrap">
                    {m.tipoMaterial || m.tipo} • <ContadorAnimado valor={(m.precoCentavos / m.pesoGramas) * 10} />/kg
                  </p>
                  <span className={`text-[8px] font-black uppercase mt-0.5 ${((m.estoque * m.pesoGramas) + m.pesoRestanteGramas) < 100 ? 'text-rose-500' : 'text-cyan-500'}`}>
                    {((m.estoque * m.pesoGramas) + m.pesoRestanteGramas)}<span className="lowercase">{m.tipo === "FDM" ? "g" : "ml"}</span> disponíveis
                  </span>
                </div>
              </div>

              {selecionado && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-white animate-in zoom-in duration-300 shadow-lg z-20">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alternarFavorito(m.id);
                }}
                className={`absolute top-2 right-2 p-1 rounded-lg transition-all z-20 ${
                  m.favorito 
                    ? "text-amber-500 bg-amber-500/10" 
                    : "text-zinc-400 dark:text-zinc-600 hover:text-amber-600 dark:hover:text-amber-500/50 hover:bg-muted dark:hover:bg-white/5"
                }`}
                title={m.favorito ? "Remover dos mais usados" : "Marcar como mais usado"}
              >
                <Star size={12} fill={m.favorito ? "currentColor" : "none"} />
              </button>
            </div>
          );
        })}
        
        {materiais.length === 0 && (
          <div className="col-span-full w-full flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-zinc-50 dark:bg-[#121214] border border-dashed border-zinc-200 dark:border-white/10 relative overflow-hidden group/empty shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent pointer-events-none" />
            <div className="flex items-center gap-5 relative z-10 w-full md:w-auto mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-white/5 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover/empty:scale-110 group-hover/empty:text-cyan-500 transition-all duration-500">
                <Box size={20} className="group-hover/empty:animate-bounce" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Estoque Vazio</span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase leading-relaxed mt-0.5">Nenhum material cadastrado ainda. Adicione agora para começar.</span>
              </div>
            </div>
            <button 
              onClick={abrirCriar}
              className="relative z-10 w-full md:w-auto px-6 h-10 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_4px_20px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_6px_25px_-5px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={14} strokeWidth={3} /> Cadastrar Material
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 flex flex-col">
        <AnimatePresence mode="popLayout">
          {selecionados.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-16 border-2 border-dashed border-borda-sutil bg-muted/20 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
              <div className="w-14 h-14 rounded-full bg-card border border-borda-sutil flex items-center justify-center text-zinc-300 dark:text-zinc-700 shadow-inner">
                <Box size={24} />
              </div>
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] relative z-10">Selecione itens para calcular</p>
            </motion.div>
          ) : (
            Object.values(
              selecionados.reduce((acc, item) => {
                if (!acc[item.id]) acc[item.id] = [];
                acc[item.id].push(item);
                return acc;
              }, {} as Record<string, typeof selecionados>)
            ).map((grupo) => {
              const materialBase = grupo[0];
              const alerta = alertas.find(a => a.materialId === materialBase.id);
              const materialOriginal = materiais.find(m => m.id === materialBase.id);
              
              const quantidadeTotal = grupo.reduce((sum, item) => sum + (item.quantidade || 0), 0);
              const estoque = materialOriginal?.pesoGramas || 0;
              const percentualUso = estoque > 0 ? (quantidadeTotal / estoque) * 100 : 0;
              const vaiFaltar = quantidadeTotal > estoque;
              
              return (
                <motion.div
                  key={materialBase.id}
                  layout="position"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className={`p-4 rounded-2xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-colors overflow-hidden
                    ${alerta 
                      ? "bg-rose-500/5 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]" 
                      : "bg-zinc-50 dark:bg-white/[0.03] border-borda-sutil"}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-[200px] shrink-0 self-start lg:self-center">
                    <div className="shrink-0">
                      {materialBase.tipo === "FDM" ? (
                        <Carretel cor={materialBase.cor} tamanho={36} className="-ml-1" />
                      ) : (
                        <GarrafaResina cor={materialBase.cor} tamanho={36} className="-ml-1" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-start gap-1.5">
                        <span className="text-xs sm:text-sm font-black uppercase tracking-tight truncate text-primary dark:text-white leading-none">
                          {materialBase.nome}
                        </span>
                        <span className="px-1 py-0.5 rounded-sm text-[7px] font-black uppercase tracking-widest bg-zinc-200/50 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 border border-borda-sutil leading-none mt-[-2px]">
                          {materialBase.tipoMaterial || materialBase.tipo}
                        </span>
                        {alerta && (
                          <span className="px-1 py-0.5 rounded-sm text-[7px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1 leading-none mt-[-2px]">
                            <RefreshCcw size={6} /> CRÍTICO
                          </span>
                        )}
                      </div>
                      
                      {materialOriginal && (
                        <div className="mt-3 w-[160px] shrink-0 flex flex-col gap-1">
                          <div className="text-[9px] font-black tracking-wider">
                            <span className="text-zinc-500 uppercase">Uso Estimado</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-200/50 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ease-out ${vaiFaltar ? "bg-gradient-to-r from-rose-600 to-rose-400" : "bg-gradient-to-r from-cyan-600 to-cyan-400"}`}
                              style={{ width: `${Math.min(percentualUso, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-end text-[9px] font-black tracking-wider mt-0.5">
                            <span className={vaiFaltar ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "text-cyan-500"}>
                              {Number(quantidadeTotal.toFixed(1))}{materialOriginal.tipo === "FDM" ? "g" : "ml"} <span className="text-zinc-500 mx-0.5">/</span> <span className="text-zinc-400 dark:text-zinc-500">{estoque}{materialOriginal.tipo === "FDM" ? "g" : "ml"}</span>
                            </span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                  
                  <div className="flex-1 w-full flex flex-col gap-3">
                    {grupo.map((item, index) => (
                      <div key={item.instanceId || item.id} className="flex flex-col sm:flex-row sm:items-end justify-end gap-4 w-full">
                        
                        {/* Nome da Sub-Peça */}
                        <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-[140px]">
                          {index === 0 && (
                            <label className="text-[8px] font-black uppercase tracking-widest leading-none text-zinc-400 dark:text-zinc-500">
                              Sub-Peça (Opcional)
                            </label>
                          )}
                          <input 
                            type="text" 
                            placeholder={`Ex: Parte ${index + 1}`} 
                            value={item.nomePeca || ""} 
                            onChange={(e) => atualizarNomePeca && atualizarNomePeca(item.instanceId || item.id, e.target.value)} 
                            className="h-9 px-3 rounded-xl bg-zinc-100 dark:bg-black/40 outline-none font-black text-xs text-left border border-borda-sutil focus:border-cyan-500/30 transition-all shadow-inner text-primary dark:text-white" 
                          />
                        </div>

                        {/* Peso Input */}
                        <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-[90px]">
                          {index === 0 && (
                            <label className="text-[8px] font-black uppercase tracking-widest leading-none text-zinc-400 dark:text-zinc-500 text-center">
                              Peso ({item.tipo === "FDM" ? "g" : "ml"})
                            </label>
                          )}
                          <input 
                            type="number" 
                            placeholder="0" 
                            value={item.quantidade === 0 ? "" : item.quantidade} 
                            onChange={(e) => atualizarQtd(item.instanceId || item.id, Number(e.target.value))} 
                            className={`h-9 px-3 rounded-xl bg-zinc-100 dark:bg-black/40 outline-none font-black text-xs text-center tabular-nums border border-borda-sutil focus:border-cyan-500/30 transition-all shadow-inner ${alerta ? 'text-rose-500' : 'text-primary dark:text-white'}`} 
                          />
                        </div>

                        {/* Tempo: Horas e Minutos */}
                        <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-auto">
                          {index === 0 && (
                            <label className="text-[8px] font-black uppercase tracking-widest leading-none text-zinc-400 dark:text-zinc-500">
                              Tempo de Impressão
                            </label>
                          )}
                          <div className="flex items-center gap-1 h-9">
                            <input 
                              type="number" 
                              placeholder="h" 
                              value={item.tempoHoras === 0 ? "" : item.tempoHoras} 
                              onChange={(e) => atualizarTempo && atualizarTempo(item.instanceId || item.id, Number(e.target.value), item.tempoMinutos || 0, item.tempoSegundos || 0)} 
                              className="w-full sm:w-16 h-full rounded-xl bg-zinc-100 dark:bg-black/40 outline-none font-black text-xs text-center tabular-nums border border-borda-sutil focus:border-cyan-500/30 transition-all shadow-inner text-primary dark:text-white" 
                            />
                            <span className="text-zinc-400 font-bold">:</span>
                            <input 
                              type="number" 
                              placeholder="m" 
                              value={item.tempoMinutos === 0 ? "" : item.tempoMinutos} 
                              onChange={(e) => atualizarTempo && atualizarTempo(item.instanceId || item.id, item.tempoHoras || 0, Number(e.target.value), item.tempoSegundos || 0)} 
                              className="w-full sm:w-16 h-full rounded-xl bg-zinc-100 dark:bg-black/40 outline-none font-black text-xs text-center tabular-nums border border-borda-sutil focus:border-cyan-500/30 transition-all shadow-inner text-primary dark:text-white" 
                            />
                            {(!item.tempoHoras || item.tempoHoras === 0) && (
                              <>
                                <span className="text-zinc-400 font-bold">:</span>
                                <input 
                                  type="number" 
                                  placeholder="s" 
                                  value={item.tempoSegundos === 0 ? "" : item.tempoSegundos} 
                                  onChange={(e) => atualizarTempo && atualizarTempo(item.instanceId || item.id, item.tempoHoras || 0, item.tempoMinutos || 0, Number(e.target.value))} 
                                  className="w-full sm:w-16 h-full rounded-xl bg-zinc-100 dark:bg-black/40 outline-none font-black text-xs text-center tabular-nums border border-borda-sutil focus:border-cyan-500/30 transition-all shadow-inner text-primary dark:text-white animate-in fade-in slide-in-from-left-2 duration-300" 
                                />
                              </>
                            )}
                          </div>
                        </div>

                        {/* Custo Total do Item */}
                        <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-auto">
                          {index === 0 && (
                            <label className="text-[8px] font-black uppercase tracking-widest leading-none text-zinc-400 dark:text-zinc-500">
                              Custo Estimado
                            </label>
                          )}
                          <div className="h-9 px-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center min-w-[100px]">
                            <span className="font-black text-xs text-cyan-500">
                              <ContadorAnimado valor={((item.quantidade * item.precoKgCentavos) / 1000) / 100} prefixo="R$ " />
                            </span>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-1.5 self-end shrink-0">
                          {index === 0 && (
                            <label className="text-[8px] font-black uppercase text-transparent tracking-widest leading-none hidden sm:block select-none">
                              Ações
                            </label>
                          )}
                          <div className="flex items-center gap-1">
                            {adicionarPeca && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); adicionarPeca(materialBase.id); }} 
                                className="h-9 w-9 flex items-center justify-center text-zinc-400 dark:text-gray-400 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-xl transition-all border border-transparent hover:border-cyan-500/20"
                                title="Adicionar nova peça (linha zerada)"
                              >
                                <Plus size={16} strokeWidth={2.5} />
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); remover?.(item.instanceId || item.id); }} 
                              className="h-9 w-9 flex items-center justify-center text-zinc-400 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                              title="Remover esta peça"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
