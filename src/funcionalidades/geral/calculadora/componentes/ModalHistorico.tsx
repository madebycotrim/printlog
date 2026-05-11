import { Dialogo } from "@/compartilhado/componentes";
import { Timer, Trash2, Check, Save } from "lucide-react";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { VersaoCalculo } from "../tipos";
import { useState } from "react";

interface ModalHistoricoProps {
  aberto: boolean;
  aoFechar: () => void;
  historico: VersaoCalculo[];
  aoSalvar: (nome: string) => void;
  aoCarregar: (versao: VersaoCalculo) => void;
  aoRemover: (id: string) => void;
}

export function ModalHistorico({
  aberto, aoFechar, historico, aoSalvar, aoCarregar, aoRemover
}: ModalHistoricoProps) {
  const [novoNome, setNovoNome] = useState("");

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Histórico de Variações" larguraMax="max-w-2xl">
      <div className="p-6 space-y-6">
        {/* Salvar Novo Snapshot */}
        <div className="flex gap-3 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/20">
          <input 
            type="text" 
            placeholder="NOME DA VARIAÇÃO..." 
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            className="flex-1 h-12 px-4 rounded-xl bg-white dark:bg-black/40 border border-borda-sutil outline-none font-black text-[10px] uppercase tracking-[0.2em] text-primary dark:text-white placeholder:text-zinc-400 focus:ring-1 focus:ring-sky-500"
          />
          <button 
            onClick={() => { aoSalvar(novoNome); setNovoNome(""); }}
            className="px-6 h-12 bg-sky-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-sky-600 transition-all flex items-center gap-2"
          >
            <Save size={14} /> Salvar
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-1">Versões Salvas ({historico.length})</p>
          
          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto scrollbar-hide">
            {historico.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-borda-sutil dark:border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3">
                <Timer size={24} className="text-zinc-300 dark:text-gray-300 opacity-50" />
                <p className="text-[10px] font-bold text-zinc-400 dark:text-gray-400 uppercase">Nenhum snapshot salvo ainda.</p>
              </div>
            ) : (
              historico.map((v) => (
                <div key={v.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-transparent hover:border-sky-500/30 transition-all flex items-center justify-between group">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest text-primary dark:text-white mb-1">{v.nome}</span>
                    <span className="text-[8px] font-bold text-zinc-400 dark:text-gray-400 uppercase">
                      {new Date(v.data).toLocaleString('pt-BR')} • {centavosParaReais(v.calculo.precoSugerido)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => aoCarregar(v)}
                      className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg font-black uppercase text-[9px] hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Check size={12} /> Restaurar
                    </button>
                    <button 
                      onClick={() => aoRemover(v.id)}
                      className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center">
          * Os snapshots são salvos localmente no seu navegador.
        </p>
      </div>
    </Dialogo>
  );
}
