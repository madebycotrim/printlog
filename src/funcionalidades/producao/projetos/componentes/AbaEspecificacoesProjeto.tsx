import { Pedido } from "../tipos";
import { 
  User, Cpu, TrendingUp, MessageSquare
} from "lucide-react";
import { formatarDataCompleta } from "@/compartilhado/utilitarios/formatadores";
import { useMemo } from "react";
import { useGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/useGerenciadorImpressoras";
import { useGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/useGerenciadorClientes";

interface PropriedadesAbaEspecificacoes {
  pedido: Pedido;
}

export function AbaEspecificacoesProjeto({ pedido }: PropriedadesAbaEspecificacoes) {
  const { estado: estadoImpressoras } = useGerenciadorImpressoras();
  const { estado: estadoClientes } = useGerenciadorClientes();

  const nomeExibicaoCliente = useMemo(() => {
    const cliente = estadoClientes.clientes?.find(c => c.id === pedido.idCliente);
    return cliente ? cliente.nome : (pedido.nomeCliente || "Consumidor Final");
  }, [pedido, estadoClientes.clientes]);

  const impressora = useMemo(() => {
    return estadoImpressoras.impressoras.find(i => i.id === pedido.idImpressora) || null;
  }, [pedido, estadoImpressoras.impressoras]);

  const tempoEfetivo = useMemo(() => {
    return pedido.tempoMinutos || (
      pedido.configuracoes 
        ? ((pedido.configuracoes.tempoHoras || 0) * 60 + (pedido.configuracoes.tempoMinutos || 0))
        : 0
    ) || 0;
  }, [pedido]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Informações Principais de Alocação e Identidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identificação */}
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-200/30 dark:border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-500 bg-indigo-500/10 border border-indigo-500/20">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-950 dark:text-white">Identificação</span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Parceiro e Descrição Comercial</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Cliente</span>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight truncate">{nomeExibicaoCliente}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Descrição do Job</span>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{pedido.descricao}</span>
            </div>
          </div>
        </div>

        {/* Hardware & Prazos */}
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-200/30 dark:border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
              <Cpu size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-950 dark:text-white">Logística & Hardware</span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Máquina e deadlines</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Equipamento Alocado</span>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{impressora ? impressora.nome : "Auto-Alocação (Fila)"}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Prazo de Entrega</span>
              <span className={`text-sm font-black tracking-tight ${pedido.prazoEntrega ? 'text-zinc-850 dark:text-zinc-200' : 'text-zinc-400 italic'}`}>
                {pedido.prazoEntrega ? formatarDataCompleta(new Date(pedido.prazoEntrega)) : "Sem agendamento"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Parâmetros de Fatiamento (se houver configuracoes) */}
      <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-200/30 dark:border-white/5 pb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-500 bg-amber-500/10 border border-amber-500/20">
            <TrendingUp size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-950 dark:text-white">Parâmetros de Fatiamento e Setup</span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Dados de Engenharia Estimados</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-white/5">
            <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Massa Estimada</span>
            <span className="text-lg font-black text-zinc-800 dark:text-zinc-250 tabular-nums">{pedido.pesoGramas || 0}g</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-white/5">
            <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Tempo de Máquina</span>
            <span className="text-lg font-black text-zinc-800 dark:text-zinc-250 tabular-nums">
              {Math.floor(tempoEfetivo / 60)}h {(tempoEfetivo % 60)}m
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-white/5">
            <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Material Base</span>
            <span className="text-xs font-black text-zinc-800 dark:text-zinc-250 uppercase truncate block mt-1">{pedido.material || "Filamento Base"}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-white/5">
            <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Data de Registro</span>
            <span className="text-xs font-black text-zinc-800 dark:text-zinc-250 block mt-1">
              {new Date(pedido.dataCriacao).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      </div>

      {/* Notas de Operação */}
      {pedido.observacoes && (
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 shrink-0">
            <MessageSquare size={18} />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Observações do Operador</span>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 italic leading-relaxed">
              "{pedido.observacoes}"
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
