import { useState, useMemo, useEffect } from "react";
import { History, Package, DollarSign, Plus } from "lucide-react";
import { Cliente } from "../tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { apiPedidos } from "@/funcionalidades/producao/projetos/servicos/apiPedidos";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PropriedadesAbaHistorico {
  cliente: Cliente;
}

export function AbaHistoricoCliente({ cliente }: PropriedadesAbaHistorico) {
  const [busca, setBusca] = useState("");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { usuario } = useAutenticacao();
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarHistorico() {
      if (!usuario?.uid) return;
      try {
        setCarregando(true);
        const resultados = await apiPedidos.buscarPorCliente(cliente.id, usuario.uid);
        setPedidos(resultados);
      } catch (e) {
        console.error("Erro ao buscar histórico do cliente:", e);
        toast.error("Não foi possível carregar o histórico de pedidos deste cliente.");
      } finally {
        setCarregando(false);
      }
    }
    carregarHistorico();
  }, [cliente.id, usuario?.uid]);

  const pedidosFiltrados = useMemo(() => {
    if (!busca) return pedidos;
    const termo = busca.toLowerCase();
    return pedidos.filter((p) => p.descricao.toLowerCase().includes(termo));
  }, [pedidos, busca]);

  const { ltvReal, totalPecasReal } = useMemo(() => {
    return pedidos.reduce(
      (acc, p) => {
        if (p.status === StatusPedido.CONCLUIDO || p.status === StatusPedido.ARQUIVADO) {
          acc.ltvReal += p.valorCentavos || 0;
          acc.totalPecasReal += 1;
        }
        return acc;
      },
      { ltvReal: 0, totalPecasReal: 0 }
    );
  }, [pedidos]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-black text-primary uppercase tracking-tight">Estatísticas & Histórico</h3>
        <button
          onClick={() => navigate(`/producao/novo?cliente=${cliente.id}`)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40"
        >
          <Plus size={16} />
          Novo Orçamento
        </button>
      </div>

      {/* Mapeamento de Métricas Financeiras/CRM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:border-zinc-300 dark:hover:border-white/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-0.5">
              Total Investido (LTV)
            </span>
            <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              {centavosParaReais(ltvReal)}
            </span>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/30 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:border-zinc-300 dark:hover:border-white/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Package size={22} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-0.5">
              Total de Projetos Concluídos
            </span>
            <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              {totalPecasReal}{" "}
              <small className="text-xs text-zinc-400 dark:text-zinc-600 font-bold uppercase ml-1">PEDIDOS</small>
            </span>
          </div>
        </div>
      </div>

      {/* Caixa de Pesquisa Interna */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="BUSCAR NOS PEDIDOS DO CLIENTE..."
            className="w-full bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200 dark:border-white/5 rounded-2xl py-3 px-4 text-xs font-black uppercase tracking-widest text-primary dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Linha do tempo dos pedidos */}
      <div className="space-y-6 flex flex-col px-2">
        {carregando ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
            <Package size={36} className="mb-3" />
            <p className="text-xs font-black uppercase tracking-widest">Nenhum pedido encontrado</p>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <div
              key={pedido.id}
              className="relative pl-10 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-[2px] before:bg-zinc-100 dark:before:bg-white/5 last:before:hidden group cursor-pointer"
              onClick={() => {
                // Aqui podemos adicionar um modal de visualizar pedido no futuro
              }}
            >
              {/* Marcador de Status */}
              <div
                className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-[#121214] flex items-center justify-center transition-all duration-300 z-10
                  shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:scale-110
                  ${
                    pedido.status === StatusPedido.CONCLUIDO || pedido.status === StatusPedido.ARQUIVADO
                      ? "bg-emerald-500 shadow-emerald-500/20"
                      : pedido.status === StatusPedido.EM_PRODUCAO
                        ? "bg-sky-500 shadow-sky-500/20"
                        : pedido.status === StatusPedido.A_FAZER
                          ? "bg-amber-500 shadow-amber-500/20"
                          : "bg-rose-500 shadow-rose-500/20"
                  }`}
              >
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>

              <div className="bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 rounded-2xl p-6 transition-all group-hover:bg-zinc-100/50 dark:group-hover:bg-white/[0.02] group-hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h5 className="text-sm font-black text-zinc-950 dark:text-white truncate tracking-tight uppercase">
                        {pedido.descricao}
                      </h5>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border
                          ${
                            pedido.status === StatusPedido.CONCLUIDO || pedido.status === StatusPedido.ARQUIVADO
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                              : pedido.status === StatusPedido.EM_PRODUCAO
                                ? "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400"
                                : pedido.status === StatusPedido.A_FAZER
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                                  : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                          }`}
                      >
                        {pedido.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                      <History size={12} strokeWidth={2.5} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {new Date(pedido.dataCriacao).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <div className="bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-zinc-200/50 dark:border-white/5 text-right">
                      <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">
                        VALOR DO PROJETO
                      </span>
                      <span className="text-sm font-black text-zinc-950 dark:text-white tracking-tight">
                        {centavosParaReais(pedido.valorCentavos)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
