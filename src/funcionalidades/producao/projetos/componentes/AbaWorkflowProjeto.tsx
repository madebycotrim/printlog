import { Pedido } from "../tipos";
import { 
  Globe, Link2
} from "lucide-react";
import { formatarDataCompleta } from "@/compartilhado/utilitarios/formatadores";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { useState, useMemo } from "react";
import { usePedidos } from "../hooks/usePedidos";
import { toast } from "react-hot-toast";

interface PropriedadesAbaWorkflow {
  pedido: Pedido;
}

export function AbaWorkflowProjeto({ pedido }: PropriedadesAbaWorkflow) {
  const { atualizarPedido } = usePedidos();
  
  const [rastreioInput, setRastreioInput] = useState(pedido.codigoRastreio || "");
  const [obsPublicasInput, setObsPublicasInput] = useState(pedido.observacoesPublicas || "");
  const [salvando, setSalvando] = useState(false);

  const salvarRastreamento = async () => {
    setSalvando(true);
    try {
      await atualizarPedido({
        id: pedido.id,
        codigoRastreio: rastreioInput,
        observacoesPublicas: obsPublicasInput,
      });
      toast.success("Informações de rastreamento salvas com sucesso!");
    } catch (e) {
      toast.error("Erro ao salvar acompanhamento.");
    } finally {
      setSalvando(false);
    }
  };

  const copiarLinkPublico = () => {
    const url = `${window.location.origin}/rastreamento/${pedido.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link de rastreamento copiado!");
  };

  const eventos = useMemo(() => {
    const logs = [];
    logs.push({
      status: StatusPedido.A_FAZER,
      titulo: "Orçamento Criado",
      data: new Date(pedido.dataCriacao),
      desc: "Projeto lançado e aguardando aprovação financeira."
    });

    if (pedido.status !== StatusPedido.A_FAZER) {
      logs.push({
        status: StatusPedido.EM_PRODUCAO,
        titulo: "Enviado para Produção",
        data: new Date(pedido.dataCriacao),
        desc: "Projeto aprovado e direcionado para a fila de extrusão."
      });
    }

    if (pedido.status === StatusPedido.ACABAMENTO || pedido.status === StatusPedido.CONCLUIDO) {
      logs.push({
        status: StatusPedido.ACABAMENTO,
        titulo: "Pós-Processamento e Acabamento",
        data: new Date(),
        desc: "Estrutura concluída. Iniciado acabamento fino/montagem."
      });
    }

    if (pedido.status === StatusPedido.CONCLUIDO && pedido.dataConclusao) {
      logs.push({
        status: StatusPedido.CONCLUIDO,
        titulo: "Pedido Concluído",
        data: new Date(pedido.dataConclusao),
        desc: "Lote de produção finalizado e estocado."
      });
    }

    return logs.reverse();
  }, [pedido]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Rastreio & Logística */}
      <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-200/30 dark:border-white/5 pb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-500 bg-indigo-500/10 border border-indigo-500/20">
            <Globe size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-950 dark:text-white">Portal de Rastreio Público</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Notas de acompanhamento do cliente</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Código de Rastreamento / Entrega</label>
            <input
              type="text"
              value={rastreioInput}
              onChange={(e) => setRastreioInput(e.target.value)}
              placeholder="Ex: BR876543210BR"
              className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl py-2 px-3 text-xs font-black uppercase tracking-widest placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Observações para o Cliente</label>
            <input
              type="text"
              value={obsPublicasInput}
              onChange={(e) => setObsPublicasInput(e.target.value)}
              placeholder="Notas visíveis no portal público..."
              className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl py-2 px-3 text-xs font-bold placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={salvarRastreamento}
            disabled={salvando}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all cursor-pointer"
          >
            {salvando ? "Processando..." : "Salvar Rastreio"}
          </button>
          <button
            onClick={copiarLinkPublico}
            className="p-2.5 bg-zinc-200 dark:bg-white/5 hover:bg-zinc-300 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
            title="Copiar Link do Portal"
          >
            <Link2 size={14} />
          </button>
        </div>
      </div>

      {/* Linha do Tempo de Produção */}
      <div className="space-y-6 flex flex-col px-2">
        <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-4">Eventos de Produção</span>
        {eventos.map((ev, idx) => (
          <div
            key={idx}
            className="relative pl-10 before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-[2px] before:bg-zinc-100 dark:before:bg-white/5 last:before:hidden group"
          >
            {/* Marcador de Status */}
            <div
              className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-[#121214] flex items-center justify-center transition-all duration-300 z-10
                shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:scale-110
                ${
                  ev.status === StatusPedido.CONCLUIDO
                    ? "bg-emerald-500"
                    : ev.status === StatusPedido.EM_PRODUCAO
                      ? "bg-indigo-500"
                      : "bg-amber-500"
                }`}
            >
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>

            <div className="bg-zinc-50/50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 transition-all group-hover:bg-zinc-100/50 dark:group-hover:bg-white/[0.02] group-hover:-translate-y-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <h5 className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                    {ev.titulo}
                  </h5>
                  <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">{ev.desc}</p>
                </div>
                
                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 tabular-nums uppercase whitespace-nowrap">
                  {formatarDataCompleta(ev.data)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
