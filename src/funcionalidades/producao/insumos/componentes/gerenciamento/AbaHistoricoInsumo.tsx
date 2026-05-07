import { useState, useMemo } from "react";
import { Package, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Insumo } from "../../tipos";

interface PropriedadesAbaHistorico {
  insumo: Insumo;
}

export function AbaHistoricoInsumo({ insumo }: PropriedadesAbaHistorico) {
  const [busca, setBusca] = useState("");

  const registrosRaw = useMemo(() => insumo.historico || [], [insumo]);

  const registrosFiltrados = useMemo(() => {
    if (!busca) return registrosRaw;
    const termo = busca.toLowerCase();
    return registrosRaw.filter(
      (r) => (r.motivo || "").toLowerCase().includes(termo) || (r.observacao || "").toLowerCase().includes(termo)
    );
  }, [registrosRaw, busca]);

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Busca */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-sky-500 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="BUSCAR NO HISTÓRICO..."
          value={busca}
          onChange={(e) => setBusca(e.target.value.toUpperCase())}
          className="w-full h-14 bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 rounded-2xl pl-12 pr-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
        />
      </div>

      {/* Timeline */}
      <div className="space-y-4 flex flex-col">
        {registrosFiltrados.length > 0 ? (
          registrosFiltrados.map((registro, index) => {
            const ehEntrada = registro.tipo === "Entrada";
            return (
              <motion.div
                key={registro.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-8 before:absolute before:left-[9px] before:top-6 before:bottom-[-16px] before:w-[2px] before:bg-zinc-100 dark:before:bg-white/5 last:before:hidden group"
              >
                {/* Marcador */}
                <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-[#0a0a0a] z-10 transition-transform group-hover:scale-125 ${ehEntrada ? "bg-emerald-500" : "bg-amber-500"}`} />

                <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${ehEntrada ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                        {ehEntrada ? "Entrada" : "Saída"}
                      </span>
                      <h4 className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">
                        {registro.motivo || "Movimentação Geral"}
                      </h4>
                    </div>
                    {registro.observacao && (
                      <p className="text-[11px] text-zinc-500 font-medium leading-snug">
                        {registro.observacao}
                      </p>
                    )}
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">
                      {formatarData(registro.data)}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-lg font-black tabular-nums ${ehEntrada ? "text-emerald-500" : "text-amber-500"}`}>
                      {ehEntrada ? "+" : "-"}{registro.quantidade}
                      <small className="text-[10px] ml-1 opacity-50 uppercase">{insumo.unidadeMedida}</small>
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-500 gap-4">
            <Package size={48} className="opacity-10" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nenhum registro encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
