import { memo, useState, useEffect, useMemo } from "react";
import { Layers, Search, Box, RefreshCcw, Check, Plus, Trash2, Star } from "lucide-react";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";
import { motion, AnimatePresence } from "framer-motion";
import { MaterialSelecionado } from "../tipos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface CardMateriaisProps {
  materiais: any[];
  selecionados: MaterialSelecionado[];
  alertas: any[];
  busca: string;
  setBusca: (v: string) => void;
  alternar: (id: string) => void;
  atualizarQtd: (id: string, qtd: number) => void;
  atualizarPreco: (id: string, preco: number) => void;
  remover: (id: string) => void;
  abrirArmazem: () => void;
  modoEntrada: 'unitario' | 'lote';
  abrirCriar: () => void;
  alternarFavorito: (id: string) => void;
}

export const CardMateriais = memo(function CardMateriais({
  materiais, selecionados, alertas, busca, setBusca, alternar, atualizarQtd, atualizarPreco, remover, abrirArmazem, abrirCriar, modoEntrada, alternarFavorito
}: CardMateriaisProps) {
  const [pagina, setPagina] = useState(0);
  const [tipoOrdenacao, setTipoOrdenacao] = useState<'favoritos' | 'uso'>('favoritos');
  const itensPorPagina = 4;

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

  const totalPaginas = Math.ceil(materiaisOrdenados.length / itensPorPagina);
  
  // Resetar página se a busca mudar e a página atual ficar vazia
  useEffect(() => {
    if (pagina >= totalPaginas && totalPaginas > 0) {
      setPagina(totalPaginas - 1);
    } else if (totalPaginas === 0) {
      setPagina(0);
    }
  }, [materiaisOrdenados.length, totalPaginas, pagina]);

  const materiaisExibidos = materiaisOrdenados.slice(pagina * itensPorPagina, (pagina + 1) * itensPorPagina);
  return (
    <div className="p-6 rounded-3xl bg-[#121214] border border-white/5 relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/30">
            <Layers size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-white">Materiais e Consumo</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Gerencie filamentos e resinas</span>
          </div>
        </div>
        
        <div className="relative group">
          <input 
            type="text"
            placeholder="Buscar material..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full md:w-64 h-10 pl-9 pr-4 rounded-xl bg-zinc-950/60 border border-white/5 focus:border-sky-500/30 outline-none text-xs font-bold uppercase tracking-widest transition-all text-white placeholder:text-zinc-700"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Box className="w-3 h-3 text-sky-500" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Seu Inventário</span>
            <div className="flex items-center gap-1 ml-3 bg-zinc-950/40 p-0.5 rounded-lg border border-white/5">
              <button 
                onClick={() => setTipoOrdenacao('favoritos')}
                className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${tipoOrdenacao === 'favoritos' ? 'bg-amber-500/20 text-amber-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                title="Mostrar favoritos primeiro"
              >
                Favoritos
              </button>
              <button 
                onClick={() => setTipoOrdenacao('uso')}
                className={`px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all ${tipoOrdenacao === 'uso' ? 'bg-sky-500/20 text-sky-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                title="Mostrar os mais usados primeiro"
              >
                Mais Usados
              </button>
            </div>
            {totalPaginas > 1 && (
              <span className="text-[10px] font-bold text-zinc-600 uppercase ml-2">
                {pagina + 1}/{totalPaginas}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {totalPaginas > 1 && (
              <div className="flex items-center gap-1 bg-zinc-950/40 p-0.5 rounded-lg border border-white/5">
                <button 
                  onClick={() => setPagina(p => Math.max(0, p - 1))}
                  disabled={pagina === 0}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-500 hover:text-sky-400 disabled:opacity-20 transition-colors"
                >
                  <Plus className="w-3 h-3 rotate-45" />
                </button>
                <div className="w-[1px] h-3 bg-white/5" />
                <button 
                  onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
                  disabled={pagina === totalPaginas - 1}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-500 hover:text-sky-400 disabled:opacity-20 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
            <button 
              onClick={abrirArmazem}
              className="text-[10px] font-black uppercase text-sky-500 hover:text-sky-400 transition-colors flex items-center gap-1 group"
            >
              Gerenciar Armazém <RefreshCcw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-hidden pb-4 -mx-2 px-2 min-h-[110px] items-stretch">
          {materiaisExibidos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-4 border border-dashed border-white/5 rounded-2xl opacity-40">
               <Box className="w-6 h-6 mb-2" />
               <span className="text-[10px] font-black uppercase">Nenhum material encontrado</span>
            </div>
          ) : materiaisExibidos.map((m) => {
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
                    : "border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-sky-500/30"}
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
                  <h4 className="text-xs font-black uppercase truncate leading-tight">{m.nome}</h4>
                  <div className="flex flex-col mt-0.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase whitespace-nowrap">
                      {m.tipoMaterial || m.tipo} • {centavosParaReais(Math.round((m.precoCentavos / m.pesoGramas) * 1000))}/kg
                    </p>
                    <span className={`text-[8px] font-black uppercase mt-0.5 ${((m.estoque * m.pesoGramas) + m.pesoRestanteGramas) < 100 ? 'text-rose-500' : 'text-sky-500'}`}>
                      {((m.estoque * m.pesoGramas) + m.pesoRestanteGramas)}g disponíveis
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
                      : "text-zinc-700 hover:text-amber-500/50 hover:bg-white/5"
                  }`}
                  title={m.favorito ? "Remover dos mais usados" : "Marcar como mais usado"}
                >
                  <Star size={12} fill={m.favorito ? "currentColor" : "none"} />
                </button>
              </div>
            );
          })}
          
          {materiais.length === 0 && (
            <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                  <Box size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Sem Materiais</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Seu catálogo está vazio no momento</span>
                </div>
              </div>
              <button 
                onClick={abrirCriar}
                className="px-4 h-9 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
              >
                <Plus size={12} /> Cadastrar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {selecionados.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-12 border-2 border-dashed border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-transparent rounded-2xl flex flex-col items-center justify-center gap-3"
            >
              <Box size={24} className="text-gray-400 dark:text-zinc-600 opacity-40" />
              <p className="text-[10px] font-medium text-zinc-500/60 dark:text-zinc-500/40 tracking-wider">Selecione os materiais acima para calcular</p>
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
                      : "bg-gray-50/50 dark:bg-white/[0.03] border-gray-100 dark:border-white/5"}
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
                      <span className="text-xs font-black uppercase tracking-tight">{item.nome}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{item.tipoMaterial || item.tipo}</span>
                      {alerta && (
                        <span className="text-[9px] font-black text-rose-500 uppercase mt-1 flex items-center gap-1">
                          <RefreshCcw size={8} /> ESTOQUE CRÍTICO
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center h-4 mb-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                          {modoEntrada === 'unitario' ? `Peso p/ Peça (${item.tipo === "FDM" ? "g" : "ml"})` : `Peso Total Lote (${item.tipo === "FDM" ? "g" : "ml"})`}
                        </label>
                      </div>
                      <input type="number" placeholder="0" value={item.quantidade === 0 ? "" : item.quantidade} onChange={(e) => atualizarQtd(item.id, Number(e.target.value))} className={`w-full h-10 px-3 rounded-lg bg-white dark:bg-black/40 outline-none font-black text-xs border-transparent focus:border-sky-500/30 transition-all ${alerta ? "text-rose-500" : ""}`} />
                      
                      {/* Barra de Consumo */}
                      {(() => {
                        const real = materiais.find(m => m.id === item.id);
                        if (!real) return null;
                        const total = (real.estoque * real.pesoGramas) + real.pesoRestanteGramas;
                        const porcentagem = Math.min(100, (item.quantidade / total) * 100);
                        return (
                          <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mt-2">
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
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Preço/Kg</label>
                      <input type="number" placeholder="0" value={(item.precoKgCentavos / 100) === 0 ? "" : (item.precoKgCentavos / 100)} onChange={(e) => atualizarPreco(item.id, Number(e.target.value))} className="w-full h-10 px-3 rounded-lg bg-white dark:bg-black/40 border-transparent focus:border-sky-500/30 outline-none font-black text-xs" />
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
});
