
import { RegistroUso } from "../tipos";
import { History, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

interface ExtratoConsumoProps {
  historico: RegistroUso[];
  corMaterial: string;
}

export function ExtratoConsumo({ historico, corMaterial }: ExtratoConsumoProps) {
  const itensOrdenados = [...historico].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  if (itensOrdenados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-white/5 flex items-center justify-center mb-4">
          <History className="text-zinc-300 dark:text-zinc-700" size={32} />
        </div>
        <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Nenhum registro ainda</h4>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-tight">O histórico de consumos e abatimentos aparecerá aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Linha do Tempo de Uso</h4>
        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500">
          {itensOrdenados.length} Registros
        </span>
      </div>

      <div className="relative">
        {/* Linha vertical da timeline */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-100 dark:bg-white/5" />

        <div className="space-y-6">
          {itensOrdenados.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-14"
            >
              {/* Marcador da Timeline */}
              <div 
                className="absolute left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#121214] z-10"
                style={{ backgroundColor: corMaterial }}
              />

              <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 rounded-2xl p-4 hover:border-zinc-200 dark:hover:border-white/10 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      {new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                    </span>
                    <h5 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase leading-none py-1">
                      {item.nomePeca}
                    </h5>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-rose-500 font-black text-sm">
                      <ArrowDownRight size={14} />
                      {item.quantidadeGastaGramas}g
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Consumido</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      item.status === 'FALHA' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-400 tabular-nums">
                    {new Date(item.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
