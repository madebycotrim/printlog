import { Layers, Search, Box, RefreshCcw, Check, Plus, Trash2 } from "lucide-react";
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
  abrirCriar: () => void;
}

export function CardMateriais({
  materiais, selecionados, alertas, busca, setBusca, alternar, atualizarQtd, atualizarPreco, remover, abrirArmazem, abrirCriar
}: CardMateriaisProps) {
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

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Box className="w-3 h-3 text-sky-500" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Seu Inventário</span>
          </div>
          <button 
            onClick={abrirArmazem}
            className="text-[10px] font-black uppercase text-sky-500 hover:text-sky-400 transition-colors flex items-center gap-1 group"
          >
            Gerenciar Armazém <RefreshCcw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 min-h-[110px] items-stretch">
          {materiais.map((m) => {
            const selecionado = selecionados.some(s => s.id === m.id);
            return (
              <button
                key={m.id}
                onClick={() => alternar(m.id)}
                className={`flex-shrink-0 min-w-[180px] p-3 rounded-2xl border-2 transition-all text-left relative group flex items-center gap-3
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
                      {m.tipo} • {centavosParaReais(Math.round((m.precoCentavos / m.pesoGramas) * 1000))}/kg
                    </p>
                    <span className={`text-[8px] font-black uppercase mt-0.5 ${((m.estoque * m.pesoGramas) + m.pesoRestanteGramas) < 100 ? 'text-rose-500' : 'text-sky-500'}`}>
                      {((m.estoque * m.pesoGramas) + m.pesoRestanteGramas)}g disponíveis
                    </span>
                  </div>
                </div>

                {selecionado && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white animate-in zoom-in duration-300 shadow-lg">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
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
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{item.tipo}</span>
                      {alerta && (
                        <span className="text-[9px] font-black text-rose-500 uppercase mt-1 flex items-center gap-1">
                          <RefreshCcw size={8} /> ESTOQUE CRÍTICO
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Quantidade ({item.tipo === "FDM" ? "g" : "ml"})</label>
                        {alerta && (
                          <span className="text-[9px] font-black text-rose-500 uppercase bg-rose-500/10 px-1 rounded animate-pulse">
                            Faltam {alerta.falta}{item.tipo === "FDM" ? "g" : "ml"}
                          </span>
                        )}
                      </div>
                      <input type="number" placeholder="0" value={item.quantidade || ""} onChange={(e) => atualizarQtd(item.id, Number(e.target.value))} className={`w-full h-10 px-3 rounded-lg bg-white dark:bg-black/40 outline-none font-black text-xs border-transparent focus:border-sky-500/30 transition-all ${alerta ? "text-rose-500" : ""}`} />
                      
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
                      <input type="number" placeholder="0" value={(item.precoKgCentavos / 100) || ""} onChange={(e) => atualizarPreco(item.id, Number(e.target.value))} className="w-full h-10 px-3 rounded-lg bg-white dark:bg-black/40 border-transparent focus:border-sky-500/30 outline-none font-black text-xs" />
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
