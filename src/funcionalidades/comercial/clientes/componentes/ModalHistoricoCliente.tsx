import { useState, useMemo } from "react";
import { History, Package, DollarSign, User, TrendingUp } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { Cliente, RegistroHistoricoCliente } from "../tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface ModalHistoricoClienteProps {
  aberto: boolean;
  aoFechar: () => void;
  cliente: Cliente | null;
}

export function ModalHistoricoCliente({ aberto, aoFechar, cliente }: ModalHistoricoClienteProps) {
  const [busca, setBusca] = useState("");

  const registrosRaw: RegistroHistoricoCliente[] = useMemo(() => {
    if (!cliente) return [];
    return (
      cliente.historico || [
        {
          id: "1",
          data: new Date(new Date().setDate(new Date().getDate() - 5)),
          descricao: "Impressão: Protótipo Industrial V2",
          valorCentavos: 15000,
          status: StatusPedido.CONCLUIDO,
        },
        {
          id: "2",
          data: new Date(new Date().setDate(new Date().getDate() - 12)),
          descricao: "Impressão: Action Figure Batman (Resina)",
          valorCentavos: 8500,
          status: StatusPedido.CONCLUIDO,
        },
      ]
    );
  }, [cliente]);

  const registrosFiltrados = useMemo(() => {
    if (!busca) return registrosRaw;
    const termo = busca.toLowerCase();
    return registrosRaw.filter((r) => r.descricao.toLowerCase().includes(termo));
  }, [registrosRaw, busca]);

  if (!cliente) return null;

  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Histórico do Cliente"
      iconeTitulo={History}
      corDestaque="indigo"
      termoBusca={busca}
      aoMudarBusca={setBusca}
      placeholderBusca="BUSCAR NOS PEDIDOS DO CLIENTE..."
      temResultados={registrosFiltrados.length > 0}
      totalResultados={registrosFiltrados.length}
      iconeVazio={Package}
      mensagemVazio="Nenhum registro encontrado para este critério de busca."
      infoRodape="Histórico sincronizado em tempo real com o módulo comercial."
    >
      <div className="space-y-10">
        {/* ═══════ CABEÇALHO DO CLIENTE & DASHBOARD ═══════ */}
        <div className="bg-gray-50/50 dark:bg-white/[0.02] p-8 rounded-3xl border border-gray-100 dark:border-white/5 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
            <User size={140} strokeWidth={1} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-xl shadow-black/5">
              <User size={32} strokeWidth={1.5} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate tracking-tight uppercase">
                  {cliente.nome}
                </h3>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <TrendingUp size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                    CLIENTE VIP
                  </span>
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 truncate tracking-wide">
                {cliente.email} • {cliente.telefone}
              </p>
            </div>
          </div>

          {/* ═══ MÉTRICAS RÁPIDAS ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm group hover:border-gray-300 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                <DollarSign size={22} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-0.5">
                  Total Investido (LTV)
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {centavosParaReais(cliente.ltvCentavos)}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm group hover:border-gray-300 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Package size={22} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-0.5">
                  Total de Peças
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {cliente.totalProdutos}{" "}
                  <small className="text-xs text-gray-400 dark:text-zinc-600 font-bold uppercase ml-1">UNIDADES</small>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ LINHA DO TEMPO DE PEDIDOS ═══════ */}
        <div className="space-y-6 flex flex-col px-2">
          {registrosFiltrados.map((registro) => (
            <div
              key={registro.id}
              className="relative pl-10 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-[2px] before:bg-gray-100 dark:before:bg-white/5 last:before:hidden group"
            >
              {/* Marcador de Status */}
              <div
                className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-[#18181b] flex items-center justify-center transition-all duration-300 z-10
                                shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:scale-110
                                ${
                                  registro.status === StatusPedido.CONCLUIDO
                                    ? "bg-emerald-500 shadow-emerald-500/20"
                                    : registro.status === StatusPedido.EM_PRODUCAO
                                      ? "bg-sky-500 shadow-sky-500/20"
                                      : "bg-rose-500 shadow-rose-500/20"
                                }`}
              >
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>

              <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-2xl p-6 transition-all group-hover:bg-gray-50 dark:group-hover:bg-white/5 group-hover:-translate-y-1 shadow-sm hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h5 className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight uppercase">
                        {registro.descricao}
                      </h5>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border
                                                ${
                                                  registro.status === StatusPedido.CONCLUIDO
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                                                    : registro.status === StatusPedido.EM_PRODUCAO
                                                      ? "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400"
                                                      : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
                                                }`}
                      >
                        {registro.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-500">
                      <History size={12} strokeWidth={2.5} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {new Date(registro.data).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <div className="bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-white/5 text-right">
                      <span className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">
                        INVESTIMENTO
                      </span>
                      <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                        {centavosParaReais(registro.valorCentavos)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModalListagemPremium>
  );
}
