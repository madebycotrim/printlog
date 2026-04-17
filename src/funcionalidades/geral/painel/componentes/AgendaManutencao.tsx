import { Wrench, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import {
  obterStatusManutencao,
  obterCorStatusManutencao,
} from "@/funcionalidades/producao/impressoras/utilitarios/utilitariosManutencao";
import { servicoManutencao } from "@/compartilhado/servicos/servicoManutencao";

interface AgendaManutencaoProps {
  impressoras: Impressora[];
}

export function AgendaManutencao({ impressoras }: AgendaManutencaoProps) {
  const navegar = useNavigate();

  const impressorasCriticas = impressoras
    .map((i) => ({
      ...i,
      statusManutencao: obterStatusManutencao(i.horimetroTotalMinutos || 0, i.intervaloRevisaoMinutos || 0),
      percentual: ((i.horimetroTotalMinutos || 0) / (i.intervaloRevisaoMinutos || 1)) * 100,
    }))
    .filter((i) => i.statusManutencao !== "normal")
    .sort((a, b) => b.percentual - a.percentual)
    .slice(0, 3);

  return (
    <div className="bg-white dark:bg-[#121214] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-rose-500">
          <Wrench size={20} className="animate-pulse" />
          <h3 className="text-sm font-black uppercase tracking-widest">Agenda de Manutenção</h3>
        </div>
        <span className="text-[10px] font-black bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full uppercase tracking-widest">
          {impressorasCriticas.length} Alertas
        </span>
      </div>

      <div className="space-y-4 flex-1">
        {impressorasCriticas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
            <AlertTriangle size={32} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
              Nenhuma intervenção
              <br />
              crítica detectada
            </p>
          </div>
        ) : (
          impressorasCriticas.map((i, index) => {
            const cores = obterCorStatusManutencao(i.statusManutencao);
            return (
              <motion.div
                key={i.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all cursor-pointer group"
                onClick={() => navegar("/producao/manutencao")}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[12px] font-black uppercase tracking-tight mb-1">{i.nome}</h4>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                        {Math.round(i.percentual)}% do ciclo percorrido
                      </p>
                      {servicoManutencao.preverProximaManutencao(i) && (
                        <p className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">
                          Previsão: {servicoManutencao.preverProximaManutencao(i)?.toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${cores.bg} text-white`}
                  >
                    {i.statusManutencao}
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(i.percentual, 100)}%` }}
                    className={`h-full ${cores.bg}`}
                  />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <button
        onClick={() => navegar("/producao/manutencao")}
        className="mt-8 w-full py-4 rounded-xl border border-gray-100 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-sky-500 hover:bg-sky-500/5 transition-all flex items-center justify-center gap-2 group"
      >
        Gerenciar Parque
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
