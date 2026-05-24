import { memo, useState, useMemo } from "react";
import { Layers, Box, RefreshCcw, Check, Plus, Trash2, Star, Search } from "lucide-react";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes";
import { motion, AnimatePresence } from "framer-motion";
import { MaterialSelecionado } from "../tipos";
import { ContadorAnimado, InputBancario } from "@/compartilhado/componentes/ui";

interface CardMateriaisProps {
  materiais: any[];
  selecionados: MaterialSelecionado[];
  alertas: any[];
  busca: string;
  setBusca: (v: string) => void;
  alternar: (id: string) => void;
  atualizarQtd: (id: string, qtd: number) => void;
  atualizarPreco: (id: string, preco: number) => void;
  atualizarTempo?: (id: string, horas: number, minutos: number) => void;
  remover: (id: string) => void;
  abrirArmazem: () => void;
  abrirCriar: () => void;
  alternarFavorito: (id: string) => void;
}

export const CardMateriais = memo(function CardMateriais({
  materiais, selecionados, alertas, busca, setBusca, alternar, atualizarQtd, atualizarPreco, atualizarTempo, remover, abrirArmazem, abrirCriar, alternarFavorito
}: CardMateriaisProps) {
  const [tipoOrdenacao, setTipoOrdenacao] = useState<'favoritos' | 'uso'>('favoritos');

  // Ordenação Inteligente: Favoritos ou Mais Usados
  const materiaisOrdenados = useMemo(() => {
    return [...materiais].sort((a, b) => {
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
  }, [materiais, tipoOrdenacao]);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-3 h-3 text-cyan-500" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-gray-400">Seu Inventário</span>
            <div className="flex items-center gap-1 ml-3 bg-muted/30 dark:bg-zinc-950/40 p-0.5 rounded-lg border border-borda-sutil">
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
              className={`flex-shrink-0 min-w-[180px] p-3 rounded-2xl border-2 transition-all text-left relative group flex items-center gap-3 cursor-pointer
                ${selecionado 
                  ? "border-sky-500 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]" 
                  : "border-borda-sutil bg-zinc-50 dark:bg-white/5 hover:border-sky-500/30"}
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
                  <span className={`text-[8px] font-black uppercase mt-0.5 ${((m.estoque * m.pesoGramas) + m.pesoRestanteGramas) < 100 ? 'text-rose-500' : 'text-sky-500'}`}>
                    {((m.estoque * m.pesoGramas) + m.pesoRestanteGramas)}<span className="lowercase">{m.tipo === "FDM" ? "g" : "ml"}</span> disponíveis
                  </span>
                </div>
              </div>

              {selecionado && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white animate-in zoom-in duration-300 shadow-lg z-20">
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
          <div className="w-full flex items-center justify-between p-4 px-5 rounded-2xl bg-muted/20 border border-dashed border-borda-sutil relative overflow-hidden group/empty">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-card border border-borda-sutil flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                <Box size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Estoque Vazio</span>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase leading-tight">Cadastre materiais para começar</span>
              </div>
            </div>
            <button 
              onClick={abrirCriar}
              className="relative z-10 px-4 h-8 bg-sky-500/80 hover:bg-sky-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus size={12} strokeWidth={3} /> Cadastrar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {selecionados.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-16 border-2 border-dashed border-borda-sutil bg-muted/20 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
              <div className="w-14 h-14 rounded-full bg-card border border-borda-sutil flex items-center justify-center text-zinc-300 dark:text-zinc-700 shadow-inner">
                <Box size={24} />
              </div>
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] relative z-10">Selecione itens para calcular</p>
            </motion.div>
          ) : (
            selecionados.map((item) => {
              const alerta = alertas.find(a => a.materialId === item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-5 rounded-2xl border flex flex-wrap md:flex-nowrap items-center gap-6 group transition-all
                    ${alerta 
                      ? "bg-rose-500/5 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]" 
                      : "bg-zinc-50 dark:bg-white/[0.03] border-borda-sutil"}
                  `}
                >
                  <div className="flex items-center gap-4 min-w-[180px]">
                    <div className="shrink-0">
                      {item.tipo === "FDM" ? (
                        <Carretel cor={item.cor} tamanho={40} className="-ml-1" />
                      ) : (
                        <GarrafaResina cor={item.cor} tamanho={40} className="-ml-1" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-tight text-primary dark:text-white">{item.nome}</span>
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-gray-400 uppercase">{item.tipoMaterial || item.tipo}</span>
                      {alerta && (
                        <span className="text-[9px] font-black text-rose-500 uppercase mt-1 flex items-center gap-1">
                          <RefreshCcw size={8} /> ESTOQUE CRÍTICO
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center h-4 mb-1">
                          <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">
                            Peso (<span className="lowercase">{item.tipo === "FDM" ? "g" : "ml"}</span>)
                          </label>
                        </div>
                        <input type="number" placeholder="0" value={item.quantidade === 0 ? "" : (item.quantidade ?? "")} onChange={(e) => atualizarQtd(item.id, Number(e.target.value))} className={`w-full h-10 px-3 rounded-lg bg-muted/40 dark:bg-black/40 outline-none font-black text-xs border-transparent focus:border-sky-500/30 transition-all text-primary dark:text-white ${alerta ? "text-rose-500" : ""}`} />
                        
                        {/* Barra de Consumo */}
                        {(() => {
                          const real = materiais.find(m => m.id === item.id);
                          if (!real) return null;
                          const total = (real.estoque * real.pesoGramas) + real.pesoRestanteGramas;
                          const porcentagem = Math.min(100, (item.quantidade / total) * 100);
                          return (
                            <div className="w-full h-1 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden mt-2">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${porcentagem}%` }}
                                className={`h-full ${alerta ? 'bg-rose-500' : 'bg-sky-500'}`}
                              />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest block h-4 mb-1">Horas</label>
                        <input type="number" placeholder="0" value={item.tempoHoras === 0 ? "" : (item.tempoHoras ?? "")} onChange={(e) => atualizarTempo && atualizarTempo(item.id, Number(e.target.value) || 0, item.tempoMinutos || 0)} className="w-full h-10 px-3 rounded-lg bg-muted/40 dark:bg-black/40 outline-none font-black text-xs border-transparent focus:border-sky-500/30 transition-all text-primary dark:text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest block h-4 mb-1">Minutos</label>
                        <input type="number" placeholder="0" value={item.tempoMinutos === 0 ? "" : (item.tempoMinutos ?? "")} onChange={(e) => atualizarTempo && atualizarTempo(item.id, item.tempoHoras || 0, Number(e.target.value) || 0)} className="w-full h-10 px-3 rounded-lg bg-muted/40 dark:bg-black/40 outline-none font-black text-xs border-transparent focus:border-sky-500/30 transition-all text-primary dark:text-white" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest block h-4 mb-1">Preço/Kg</label>
                        <InputBancario placeholder="0.00" value={(item.precoKgCentavos / 100) === 0 ? "" : (item.precoKgCentavos / 100)} onChange={(e) => atualizarPreco(item.id, Number(e.target.value))} className="w-full h-10 px-3 rounded-lg bg-muted/40 dark:bg-black/40 border border-transparent focus:border-sky-500/30 outline-none font-black text-xs text-primary dark:text-white" />
                      </div>
                    </div>
                  <button onClick={() => remover(item.id)} className="p-2 rounded-lg text-zinc-400 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
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
});
