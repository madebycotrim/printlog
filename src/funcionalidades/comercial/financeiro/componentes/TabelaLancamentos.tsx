import { LancamentoFinanceiro } from "../tipos";
import { TipoLancamentoFinanceiro } from "@/compartilhado/tipos/modelos";
import { ArrowUpRight, ArrowDownLeft, Tag, User, Pencil, Trash2, AlertCircle } from "lucide-react";
import { usarGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/usarGerenciadorClientes";
import { motion } from "framer-motion";

interface TabelaLancamentosProps {
  lancamentos: LancamentoFinanceiro[];
  aoExcluir: (id: string) => Promise<void>;
  aoEditar: (lancamento: LancamentoFinanceiro) => void;
}

export function TabelaLancamentos({ lancamentos, aoExcluir, aoEditar }: TabelaLancamentosProps) {
  const { estado: estadoClientes } = usarGerenciadorClientes();
  
  const formatarMoeda = (centavos: number) => {
    return (centavos / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const agruparPorData = () => {
    const grupos: Record<string, LancamentoFinanceiro[]> = {};
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    lancamentos.forEach((l) => {
      const dataObjeto = l.dataCriacao instanceof Date ? l.dataCriacao : new Date(l.dataCriacao);
      const dataL = new Date(dataObjeto);
      dataL.setHours(0, 0, 0, 0);

      let chave = dataObjeto.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      if (dataL.getTime() === hoje.getTime()) chave = "Hoje";
      else if (dataL.getTime() === ontem.getTime()) chave = "Ontem";

      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(l);
    });

    return grupos;
  };

  const grupos = agruparPorData();

  if (lancamentos.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl">
        <p className="text-muted-foreground italic">Nenhuma transação registrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(grupos).map(([data, itens]) => (
        <div key={data} className="space-y-4">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
              {data}
            </h3>
            <div className="h-[1px] w-full bg-zinc-100 dark:bg-white/5" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {itens.map((l) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="relative flex items-center justify-between p-5 rounded-2xl border border-borda-sutil dark:border-white/5 bg-card hover:border-zinc-200 dark:hover:border-white/10 hover:shadow-premium transition-all group overflow-hidden"
              >
                {/* Background Decorativo */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform group-hover:scale-110 group-hover:rotate-6 duration-700">
                  {l.tipo === TipoLancamentoFinanceiro.ENTRADA ? (
                    <ArrowUpRight size={120} strokeWidth={1} />
                  ) : (
                    <ArrowDownLeft size={120} strokeWidth={1} />
                  )}
                </div>

                <div className="flex items-center gap-5 relative z-10">
                  {/* Ícone do Tipo */}
                  <div
                    className={`p-4 rounded-xl transition-all duration-300 ${
                      l.tipo === TipoLancamentoFinanceiro.ENTRADA
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 shadow-sm"
                        : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 shadow-sm"
                    }`}
                  >
                    {l.tipo === TipoLancamentoFinanceiro.ENTRADA ? (
                      <ArrowUpRight size={22} strokeWidth={2.5} />
                    ) : (
                      <ArrowDownLeft size={22} strokeWidth={2.5} />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[15px] font-black text-zinc-900 dark:text-zinc-100 leading-none tracking-tight">
                      {l.descricao}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {l.categoria && (
                        <span className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-widest border border-zinc-100 dark:border-white/5">
                          <Tag size={12} strokeWidth={2.5} />
                          {l.categoria}
                        </span>
                      )}

                      {l.idCliente && (
                        <span className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-zinc-900 dark:bg-white text-[10px] uppercase font-black text-white dark:text-zinc-900 tracking-widest shadow-sm">
                          <User size={12} strokeWidth={2.5} />
                          {estadoClientes.clientes.find((c) => c.id === l.idCliente)?.nome || "Cliente"}
                        </span>
                      )}

                      {l.idPedido && (
                        <span className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-500/10 text-[9px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-widest border border-amber-500/20">
                          <AlertCircle size={10} strokeWidth={3} />
                          Vinculado a Pedido
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 relative z-10">
                  {/* Ações (Aparecem no Hover) */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300">
                    <button
                      onClick={() => aoEditar(l)}
                      className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all active:scale-90"
                      title="Editar Lançamento"
                    >
                      <Pencil size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir esta transação?")) {
                          aoExcluir(l.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all active:scale-90"
                      title="Excluir Lançamento"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Valor */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 min-w-[120px]">
                    <span
                      className={`text-xl font-black tracking-tighter ${
                        l.tipo === TipoLancamentoFinanceiro.ENTRADA
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {l.tipo === TipoLancamentoFinanceiro.ENTRADA ? "+" : "-"} {formatarMoeda(l.valorCentavos)}
                    </span>
                    <div
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                        l.tipo === TipoLancamentoFinanceiro.ENTRADA
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600/70 dark:text-emerald-400/70"
                          : "bg-rose-500/5 border-rose-500/20 text-rose-600/70 dark:text-rose-400/70"
                      }`}
                    >
                      {l.tipo === TipoLancamentoFinanceiro.ENTRADA ? "Recebimento" : "Pagamento"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
