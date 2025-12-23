import React, { useEffect, useMemo, useState } from "react";
import { readHistory, writeHistory, clearHistory } from "../logic/localHistory";
import { X, Trash2, RotateCcw, Search, TrendingUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "../../../lib/format";

export default function GavetaHistorico({ aberta, aoFechar, aoRestaurar }) {
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    if (aberta) setItens(readHistory() || []);
  }, [aberta]);

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => (item.label || "").toLowerCase().includes(filtro.toLowerCase()));
  }, [itens, filtro]);

  const excluirItem = (id) => {
    const proximo = itens.filter((i) => i.client_id !== id);
    writeHistory(proximo);
    setItens(proximo);
  };

  if (!aberta) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={aoFechar} />

      {/* Drawer */}
      <aside className="relative w-full max-w-md bg-[#09090b] border-l border-zinc-800 h-full shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex justify-between items-center bg-[#09090b]">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-sky-500 shadow-lg shadow-sky-500/50"></span>
             Histórico
          </h2>
          <button onClick={aoFechar} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-500 transition-colors" />
            <input
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 h-10 text-xs font-mono text-white outline-none focus:border-sky-500 transition-all placeholder:text-zinc-700"
              placeholder="Buscar por nome do projeto..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-[#050505]">
          {itensFiltrados.map((item) => {
            const margem = Number(item.data?.results?.margemEfetivaPct || 0);
            const temLucro = margem > 0;
            const precoFinal = item.data?.results?.precoSugerido;

            return (
              <div key={item.client_id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-all group hover:bg-zinc-900">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-zinc-200 text-sm mb-1 group-hover:text-white transition-colors">
                      {item.label || "Sem nome"}
                    </h3>
                    <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1.5">
                      {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${temLucro ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                    {temLucro ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}
                    {margem}%
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-800/50">
                   <span className="text-[10px] text-zinc-500 uppercase font-bold">Valor Final</span>
                   <span className="text-sm font-mono font-bold text-zinc-200">{fmtBRL(precoFinal)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => aoRestaurar(item)} className="flex items-center justify-center gap-2 bg-sky-600/10 hover:bg-sky-600 border border-sky-600/20 hover:border-sky-500 text-sky-400 hover:text-white py-2 rounded-lg text-[10px] font-bold uppercase transition-all">
                    <RotateCcw size={14} /> Carregar
                  </button>
                  <button onClick={() => excluirItem(item.client_id)} className="flex items-center justify-center gap-2 bg-zinc-950 border border-zinc-800 hover:border-rose-900 hover:text-rose-400 text-zinc-500 py-2 rounded-lg text-[10px] font-bold uppercase transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#09090b]">
          <button onClick={() => { clearHistory(); setItens([]); }} className="w-full py-3 rounded-xl border border-dashed border-zinc-800 text-zinc-600 hover:text-rose-400 hover:border-rose-900 hover:bg-rose-950/10 text-[10px] font-bold uppercase tracking-widest transition-all">
            Limpar Todo Histórico
          </button>
        </div>
      </aside>
    </div>
  );
}