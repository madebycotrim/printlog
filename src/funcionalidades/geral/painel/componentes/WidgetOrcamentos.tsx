import { FileText, ArrowRight } from "lucide-react";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { centavosParaReais, formatarDataOuRelativa } from "@/compartilhado/utilitarios/formatadores";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface PropriedadesWidgetOrcamentos {
  pedidos: Pedido[];
  aoVerTodos: () => void;
}

export function WidgetOrcamentos({ pedidos, aoVerTodos }: PropriedadesWidgetOrcamentos) {
  const navegar = useNavigate();
  const recentes = [...pedidos]
    .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
    .slice(0, 5);

  return (
    <div className="bg-card border border-borda-sutil rounded-[2rem] p-0 overflow-hidden flex flex-col h-full shadow-media group/widget relative transition-all hover:bg-zinc-50 dark:hover:bg-white/[0.01]">
      {/* Grid Pattern Background - Subtil */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
      <div className="p-6 border-b border-borda-sutil flex justify-between items-center bg-zinc-50/50 dark:bg-white/[0.01]">
        <div className="flex flex-col">
          <h4 className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">
            Orçamentos Recentes
          </h4>
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
            Últimas {recentes.length} interações
          </span>
        </div>
        <button 
          onClick={aoVerTodos}
          className="group/btn flex items-center gap-2 text-[10px] text-sky-500 font-black hover:opacity-80 transition-all tracking-widest uppercase"
        >
          VER TODOS
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {recentes.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <FileText size={32} className="text-zinc-200 dark:text-zinc-800 mb-3" />
            <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Nenhum registro</div>
          </div>
        ) : (
          recentes.map((pedido, index) => (
            <motion.div
              key={pedido.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navegar(`/producao?id=${pedido.id}`)}
              className="flex items-center p-5 border-b border-borda-sutil last:border-0 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer group/item"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-borda-sutil mr-4 text-zinc-400 group-hover/item:text-sky-500 group-hover/item:border-sky-500/20 transition-all shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0 mr-4">
                <div className="text-sm font-black text-primary truncate group-hover/item:text-sky-500 transition-colors mb-0.5">
                  {pedido.descricao}
                </div>
                <div className="text-[10px] text-muted flex items-center gap-2 font-black uppercase tracking-wider">
                  <span className="text-zinc-400">{pedido.nomeCliente || "Cliente Avulso"}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span>{formatarDataOuRelativa(pedido.dataCriacao)}</span>
                </div>
              </div>

              <div className="text-right mr-6">
                <div className="text-sm font-black text-primary tabular-nums">
                  {centavosParaReais(pedido.valorCentavos || 0)}
                </div>
                <div className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Valor Final</div>
              </div>

              <div>
                <BadgeStatus status={pedido.status} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function BadgeStatus({ status }: { status: StatusPedido }) {
  const configs: any = {
    [StatusPedido.A_FAZER]: { cor: "amber", rotulo: "Pendente" },
    [StatusPedido.EM_PRODUCAO]: { cor: "sky", rotulo: "Produção" },
    [StatusPedido.CONCLUIDO]: { cor: "emerald", rotulo: "Concluído" },
    [StatusPedido.ACABAMENTO]: { cor: "violet", rotulo: "Acabamento" },
    [StatusPedido.ARQUIVADO]: { cor: "zinc", rotulo: "Arquivado" },
  };

  const config = configs[status] || configs[StatusPedido.A_FAZER];

  const cores: any = {
    sky: "bg-sky-500/10 border-sky-500/20 text-sky-500",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-500",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    zinc: "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${cores[config.cor]} text-[9px] font-black uppercase tracking-widest shadow-sm`}>
      <span className={`w-1 h-1 rounded-full bg-current`} />
      {config.rotulo}
    </span>
  );
}


