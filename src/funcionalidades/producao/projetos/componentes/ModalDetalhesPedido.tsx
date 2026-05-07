import { Pedido, ItemPosProcesso } from "../tipos";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { 
  Settings, Box, MessageSquare, 
  TrendingUp, Zap, Percent, 
  Hammer, Activity, ShieldCheck,
  Truck, Calendar, Clock,
  Warehouse, ShoppingBag
} from "lucide-react";

import { centavosParaReais, formatarDataCompleta } from "@/compartilhado/utilitarios/formatadores";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { useMemo } from "react";
import { usarGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/usarGerenciadorImpressoras";
import { usarGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/usarGerenciadorClientes";
import { usarGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/usarGerenciadorMateriais";


interface PropriedadesModalDetalhes {
  aberto: boolean;
  aoFechar: () => void;
  pedido: Pedido | null;
}

export function ModalDetalhesPedido({ aberto, aoFechar, pedido }: PropriedadesModalDetalhes) {
  const { estado: estadoImpressoras } = usarGerenciadorImpressoras();
  const impressoras = estadoImpressoras.impressoras;
  const { estado: estadoClientes } = usarGerenciadorClientes();
  const { estado: estadoMateriais } = usarGerenciadorMateriais();


  const configStatus = useMemo(() => {
    if (!pedido) return { cor: "zinc", label: "Pendente", bg: "bg-zinc-500/10", text: "text-zinc-500", glow: "shadow-zinc-500/20" };
    switch (pedido.status) {
      case StatusPedido.A_FAZER:
        return { cor: "amber", label: "A Fazer", bg: "bg-amber-500/10", text: "text-amber-500", glow: "shadow-amber-500/20" };
      case StatusPedido.EM_PRODUCAO:
        return { cor: "emerald", label: "Produzindo", bg: "bg-emerald-500/10", text: "text-emerald-500", glow: "shadow-emerald-500/20" };
      case StatusPedido.ACABAMENTO:
        return { cor: "indigo", label: "Acabamento", bg: "bg-indigo-500/10", text: "text-indigo-500", glow: "shadow-indigo-500/20" };
      case StatusPedido.CONCLUIDO:
        return { cor: "sky", label: "Concluído", bg: "bg-sky-500/10", text: "text-sky-500", glow: "shadow-sky-500/20" };
      default:
        return { cor: "zinc", label: "Pendente", bg: "bg-zinc-500/10", text: "text-zinc-500", glow: "shadow-zinc-500/20" };
    }
  }, [pedido?.status]);

  if (!pedido) return null;

  const impressora = impressoras.find(i => i.id === pedido.idImpressora);
  const cliente = (estadoClientes.clientes || []).find(c => c.id === pedido.idCliente);
  const nomeExibicaoCliente = pedido.nomeCliente || cliente?.nome || "Cliente Avulso";

  // v9.0: Blindagem de visualização - calcula totais se os campos consolidados estiverem zerados
  const { pesoEfetivo, tempoEfetivo } = useMemo(() => {
    const peso = pedido.pesoGramas || (pedido.materiais?.reduce((acc, m) => acc + (m.quantidadeGasta || 0), 0)) || 0;
    const tempo = pedido.tempoMinutos || (
      pedido.configuracoes 
        ? ((pedido.configuracoes.tempoHoras || 0) * 60 + (pedido.configuracoes.tempoMinutos || 0))
        : 0
    ) || 0;
    return { pesoEfetivo: peso, tempoEfetivo: tempo };
  }, [pedido]);

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Inteligência de Projeto"
      larguraMax="max-w-6xl"
      semScroll={true}
    >
      <div className="flex flex-col md:flex-row bg-card min-h-[70vh] max-h-[85vh] overflow-hidden rounded-b-2xl">
        {/* 📑 Sidebar de Identidade */}
        <aside className="w-full md:w-80 bg-zinc-50 dark:bg-zinc-900/30 border-r border-borda-sutil p-8 flex flex-col gap-12 overflow-y-auto scrollbar-none">
          <div className="space-y-8">
            {/* Status & ID */}
            <div className="space-y-4">
              <div className={`w-fit px-3 py-1 rounded-full ${configStatus.bg} border border-borda-sutil flex items-center gap-2 shadow-[0_0_15px_rgba(var(--status-rgb),0.1)]`}>
                <div className={`w-1.5 h-1.5 rounded-full ${configStatus.bg.replace('/10', '')} animate-pulse`} />
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${configStatus.text}`}>{configStatus.label}</span>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-primary dark:text-white tracking-tighter uppercase italic leading-tight">
                  {pedido.descricao}
                </h2>
                <div className="flex items-center gap-2 text-emerald-500/60">
                   <span className="text-[8px] font-black uppercase tracking-[0.3em]">Code ID</span>
                   <span className="text-[10px] font-black tabular-nums tracking-widest text-zinc-300">#{pedido.id.slice(0, 12).toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Dados Principais */}
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Activity size={12} className="text-zinc-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cliente</span>
                </div>
                <span className="text-lg font-black text-primary dark:text-zinc-200 uppercase truncate tracking-tight">{nomeExibicaoCliente}</span>
              </div>

              <div className="flex flex-col gap-2 p-6 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 shadow-[0_10px_30px_rgba(16,185,129,0.05)]">
                <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">Investimento Final</span>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-emerald-400 tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                      {centavosParaReais(pedido.valorCentavos)}
                    </span>
                    {pedido.configuracoes?.quantidade > 1 && (
                      <span className="text-[11px] font-black text-emerald-600/40 uppercase tracking-tighter">
                        ({centavosParaReais(Math.round(pedido.valorCentavos / pedido.configuracoes.quantidade))} /un)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-500/10">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-emerald-600/40 uppercase tracking-widest">Quantidade</span>
                      <span className="text-xs font-black text-zinc-300 tabular-nums">
                        {pedido.configuracoes?.quantidade || 1} 
                        <span className="text-[8px] ml-1 opacity-40">{pedido.configuracoes?.modoEntrada === 'lote' ? 'LOTE' : 'UN'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-borda-sutil">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 border border-borda-sutil">
                    <Clock size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Entrega Estimada</span>
                    <span className={`text-[11px] font-bold ${pedido.prazoEntrega ? 'text-zinc-300' : 'text-zinc-600 italic'}`}>
                      {pedido.prazoEntrega ? formatarDataCompleta(pedido.prazoEntrega) : "Não agendado"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 border border-borda-sutil">
                    <Calendar size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Registrado em</span>
                    <span className="text-[11px] font-bold text-zinc-400 tabular-nums">
                      {formatarDataCompleta(pedido.dataCriacao)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-borda-sutil">
             <div className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-borda-sutil hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                   <Settings size={24} />
                </div>
                 <div className="flex flex-col">
                   <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Hardware Ativo</span>
                   <span className="text-xs font-black text-primary dark:text-zinc-200 uppercase truncate tracking-tight">{impressora?.nome || "Em Espera"}</span>
                </div>
             </div>
          </div>
        </aside>

        {/* 🚀 Área de Inteligência Técnica */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-transparent to-zinc-500/5 dark:to-zinc-900/20">
          <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-borda-sutil">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* 🚀 Engenharia de Produção */}
              <section className="col-span-1 md:col-span-2 space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <TrendingUp size={16} />
                   </div>
                    <h3 className="text-[11px] font-black text-primary dark:text-white uppercase tracking-[0.4em]">Engenharia de Produção</h3>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                   {/* Coluna 1: Materiais Utilizados */}
                   <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 mb-2 opacity-50">
                         <TrendingUp size={12} className="text-indigo-400" />
                         <span className="text-[8px] font-black text-primary dark:text-white uppercase tracking-widest">Composição de Materiais</span>
                      </div>
                      <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil flex flex-col gap-6">
                         <div className="flex items-center justify-between">
                             <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Materiais Ativos</span>
                             {pedido.materiais && pedido.materiais.length > 1 && (
                               <span className="text-[8px] font-black px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 border border-borda-sutil uppercase">Multimaterial</span>
                             )}
                         </div>
                         
                         {pedido.materiais && pedido.materiais.length > 0 ? (
                           <div className="space-y-4">
                             {pedido.materiais.map((m, idx) => (
                               <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                       {(() => {
                                         const infoMaterial = (estadoMateriais.materiais || []).find(mat => mat.id === m.idMaterial);
                                         const corMaterial = infoMaterial?.cor || "#3b82f6";
                                         return (
                                           <>
                                             <div 
                                               className="w-1.5 h-1.5 rounded-full" 
                                               style={{ 
                                                 backgroundColor: corMaterial,
                                                 boxShadow: `0 0 12px ${corMaterial}99` 
                                               }} 
                                             />
                                             <div className="flex flex-col">
                                               <div className="flex items-center gap-2">
                                                 {infoMaterial?.tipoMaterial && (
                                                   <span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-borda-sutil bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">
                                                     {infoMaterial.tipoMaterial}
                                                   </span>
                                                 )}
                                                 <span className="text-sm font-black text-primary dark:text-zinc-200 uppercase tracking-tight group-hover:text-primary dark:group-hover:text-white transition-colors">{m.nome}</span>
                                               </div>
                                             </div>
                                           </>
                                         );
                                       })()}
                                    </div>
                                  <span className="text-xs font-black text-zinc-500 tabular-nums">{m.quantidadeGasta}g</span>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                  <span className="text-sm font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">{pedido.material || "Filamento Base"}</span>
                              </div>
                              <span className="text-xs font-black text-zinc-400 dark:text-zinc-500 tabular-nums">{pesoEfetivo}g</span>
                           </div>
                         )}
                      </div>
                   </div>

                   {/* Coluna 2: Métricas de Base */}
                   <div className="w-full md:w-80 space-y-4">
                       <div className="flex items-center gap-2 mb-2 opacity-50">
                         <Activity size={12} className="text-indigo-400" />
                         <span className="text-[8px] font-black text-primary dark:text-white uppercase tracking-widest">Performance de Máquina</span>
                      </div>
                      <div className="flex flex-col gap-4">
                          {/* Massa Total */}
                          <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil flex flex-col gap-3 group hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all">
                             <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest group-hover:text-indigo-400/60 transition-colors">Massa Consolidada</span>
                             <span className="text-2xl font-black text-primary dark:text-zinc-200 tabular-nums tracking-tighter">{pesoEfetivo}g</span>
                          </div>
                         
                         {/* Tempo */}
                          <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil flex flex-col gap-3 group hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all">
                             <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest group-hover:text-indigo-400/60 transition-colors">Tempo de Máquina</span>
                             <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-primary dark:text-zinc-200 tabular-nums tracking-tighter">{Math.floor((tempoEfetivo ?? 0) / 60)}h</span>
                                <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500 tabular-nums">{(tempoEfetivo ?? 0) % 60}min</span>
                             </div>
                          </div>
                      </div>
                   </div>
                </div>
              </section>

              {/* 📦 Lista de Insumos & Acabamentos (v10.0) */}
              <section className="col-span-1 md:col-span-2 space-y-8 pt-8 border-t border-white/5">
                 <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                        <Box size={16} />
                     </div>
                     <h3 className="text-[11px] font-black text-primary dark:text-white uppercase tracking-[0.4em]">Insumos e Acabamentos</h3>
                  </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Coluna de Insumos Físicos */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 opacity-50">
                           <Box size={12} className="text-sky-400" />
                           <span className="text-[8px] font-black text-primary dark:text-white uppercase tracking-widest">Insumos</span>
                        </div>
                       
                        {pedido.insumosSecundarios && pedido.insumosSecundarios.length > 0 ? (
                          <div className="space-y-3">
                            {pedido.insumosSecundarios.map((i, idx) => (
                              <div key={`ins-${idx}`} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-borda-sutil hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all group">
                                <div className="flex items-center gap-4">
                                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-sky-500 transition-all shadow-[0_0_8px_transparent] group-hover:shadow-sky-500/40" />
                                   <span className="text-xs font-black text-zinc-400 uppercase tracking-tight">{i.nome}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                       <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-600 uppercase">Qtd: {i.quantidade}</span>
                                       <span className="text-[11px] font-black text-primary dark:text-zinc-300 tabular-nums">
                                         {centavosParaReais(i.quantidade * (i.custoUnitarioCentavos || 0))}
                                       </span>
                                    </div>
                                </div>
                             </div>
                           ))}
                         </div>
                       ) : (
                          <div className="p-10 border border-dashed border-borda-sutil rounded-2xl flex items-center justify-center opacity-30">
                             <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase">Sem insumos físicos</span>
                          </div>
                       )}
                    </div>

                    {/* Coluna de Pós-Processamento */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 opacity-50">
                           <Hammer size={12} className="text-emerald-400" />
                           <span className="text-[8px] font-black text-primary dark:text-white uppercase tracking-widest">Serviços de Acabamento</span>
                        </div>

                       {(() => {
                         // Blindagem: posProcesso pode vir como string JSON do banco
                         const parsear = (v: any): any[] => {
                           if (!v) return [];
                           if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
                           return Array.isArray(v) ? v : [];
                         };
                         const itensPos = parsear(pedido.posProcesso).length > 0 
                           ? parsear(pedido.posProcesso) 
                           : parsear(pedido.configuracoes?.posProcesso);
                         
                         if (itensPos.length > 0) {
                           return (
                             <div className="space-y-3">
                               {itensPos.map((p: ItemPosProcesso, idx: number) => (
                                 <div key={`pos-${idx}`} className="flex items-center justify-between p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 hover:bg-emerald-500/5 transition-all group">
                                    <div className="flex items-center gap-4">
                                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 group-hover:bg-emerald-500 transition-all shadow-[0_0_8px_transparent] group-hover:shadow-emerald-500/40" />
                                       <span className="text-xs font-black text-emerald-500/80 uppercase tracking-tight">{p.nome}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                       <span className="text-[8px] font-bold text-emerald-500/40 uppercase">Pós-Processo</span>
                                       <span className="text-[11px] font-black text-emerald-400 tabular-nums">
                                         {centavosParaReais(p.valor)}
                                       </span>
                                    </div>
                                 </div>
                               ))}
                             </div>
                           );
                         }

                          return (
                            <div className="p-10 border border-dashed border-borda-sutil rounded-2xl flex items-center justify-center opacity-30">
                               <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-600 uppercase">Sem acabamentos</span>
                            </div>
                          );
                       })()}
                    </div>
                 </div>
              </section>

              {/* 🧠 Engenharia de Custos & Setup (v10.0) */}
              {pedido.configuracoes && (
                <section className="col-span-1 md:col-span-2 space-y-8 pt-8 border-t border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <Box size={16} />
                     </div>
                     <h3 className="text-[11px] font-black text-primary dark:text-white uppercase tracking-[0.4em]">Engenharia de Custos & Setup</h3>
                   </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                     {/* Energia */}
                     {pedido.configuracoes.cobrarEnergia && (
                        <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil flex flex-col gap-4 group hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all">
                           <div className="flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                              <Zap size={12} className="text-rose-400" />
                              <span className="text-[9px] font-black text-primary dark:text-white uppercase tracking-widest">Energia</span>
                           </div>
                          <div className="flex flex-col">
                             <span className="text-2xl font-black text-zinc-200 tabular-nums tracking-tighter">{pedido.configuracoes.potencia}W</span>
                             <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tight">R$ {pedido.configuracoes.precoKwh?.toFixed(2)} / kWh</span>
                          </div>
                       </div>
                     )}

                     {/* Mão de Obra */}
                     {pedido.configuracoes.cobrarMaoDeObra && (
                        <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil flex flex-col gap-4 group hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all">
                           <div className="flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                              <Hammer size={12} className="text-rose-400" />
                              <span className="text-[9px] font-black text-primary dark:text-white uppercase tracking-widest">Mão de Obra</span>
                           </div>
                          <div className="flex flex-col">
                             <span className="text-2xl font-black text-zinc-200 tabular-nums tracking-tighter">R$ {pedido.configuracoes.maoDeObra?.toFixed(2)}</span>
                             <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tight">Taxa por Hora</span>
                          </div>
                       </div>
                     )}

                     {/* Hora Máquina */}
                     {pedido.configuracoes.cobrarDesgaste && (
                        <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil flex flex-col gap-4 group hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all">
                           <div className="flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                              <Settings size={12} className="text-rose-400" />
                              <span className="text-[9px] font-black text-primary dark:text-white uppercase tracking-widest">Hardware</span>
                           </div>
                          <div className="flex flex-col">
                              {(() => {
                                const tempoTotalMinutos = pedido.configuracoes.tempoHoras !== undefined 
                                  ? (pedido.configuracoes.tempoHoras * 60 + (pedido.configuracoes.tempoMinutos || 0))
                                  : (pedido.configuracoes.tempoMinutos || 0);
                                const tempoTotalHoras = tempoTotalMinutos / 60;
                                const depreciacaoTotal = tempoTotalHoras * (pedido.configuracoes.depreciacaoHora || 0);
                                
                                return (
                                  <>
                                    <span className="text-2xl font-black text-zinc-200 tabular-nums tracking-tighter">R$ {depreciacaoTotal.toFixed(2)}</span>
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tight">Depreciação Total</span>
                                    <span className="text-[8px] font-bold text-zinc-800 uppercase tracking-tighter mt-1">R$ {pedido.configuracoes.depreciacaoHora?.toFixed(2)} / H Máquina</span>
                                  </>
                                );
                              })()}
                          </div>
                       </div>
                     )}

                     {/* Margem */}
                      <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil flex flex-col gap-4 group hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all">
                         <div className="flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                            <Percent size={12} className="text-rose-400" />
                            <span className="text-[9px] font-black text-primary dark:text-white uppercase tracking-widest">Margem</span>
                         </div>
                        <div className="flex flex-col">
                           <span className="text-2xl font-black text-zinc-200 tabular-nums tracking-tighter">{pedido.configuracoes.margem}%</span>
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tight">Lucro Líquido</span>
                        </div>
                     </div>

                     {/* Lote */}
                      <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-borda-sutil flex flex-col gap-4 group hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all">
                         <div className="flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                            <Box size={12} className="text-rose-400" />
                            <span className="text-[9px] font-black text-primary dark:text-white uppercase tracking-widest">Produção</span>
                         </div>
                        <div className="flex flex-col">
                           <span className="text-2xl font-black text-zinc-200 tabular-nums tracking-tighter">{pedido.configuracoes.quantidade} UN</span>
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tight">Modo: {pedido.configuracoes.modoEntrada}</span>
                        </div>
                     </div>

                  </div>

                  {/* Matriz de Cobrança */}
                  <div className="flex flex-wrap gap-2">
                     {[
                       { label: 'Energia', ativa: pedido.configuracoes.cobrarEnergia },
                       { label: 'Mão de Obra', ativa: pedido.configuracoes.cobrarMaoDeObra },
                       { label: 'Desgaste', ativa: pedido.configuracoes.cobrarDesgaste },
                       { label: 'Insumos Fixos', ativa: pedido.configuracoes.cobrarInsumosFixos },
                       { label: 'Logística', ativa: pedido.configuracoes.cobrarLogistica },
                     ].map((t, idx) => (
                        <div key={idx} className={`px-3 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                          t.ativa ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-900/40 border-borda-sutil text-zinc-400 dark:text-zinc-600 opacity-50'
                        }`}>
                          <ShieldCheck size={10} className={t.ativa ? 'opacity-100' : 'opacity-20'} />
                          {t.label}
                       </div>
                     ))}
                  </div>
                </section>
              )}

              {/* 🚚 Logística & Fiscal (Apenas se houver cobrança) */}
              {pedido.configuracoes && (pedido.configuracoes.cobrarLogistica || pedido.configuracoes.cobrarInsumosFixos || pedido.configuracoes.perfilAtivo) && (
                <section className="col-span-1 md:col-span-2 space-y-8 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                         <Warehouse size={16} />
                      </div>
                      <h3 className="text-[11px] font-black text-primary dark:text-white uppercase tracking-[0.4em]">Logística e Vendas</h3>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Canal de Venda */}
                    {pedido.configuracoes?.perfilAtivo && (
                      <div className="p-8 rounded-2xl bg-orange-500/[0.03] border border-orange-500/10 flex flex-col gap-6 group hover:bg-orange-500/5 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                            <ShoppingBag size={12} className="text-orange-500" />
                            <span className="text-[9px] font-black text-primary dark:text-white uppercase tracking-widest">Canal de Venda</span>
                          </div>
                          <span className="text-2xl font-black text-orange-400 tabular-nums tracking-tighter uppercase">{pedido.configuracoes.perfilAtivo}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-orange-500/10">
                           <div className="flex flex-col gap-1">
                              <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none">Marketplace</span>
                              <span className="text-xs font-black text-primary dark:text-zinc-200 tabular-nums">{pedido.configuracoes.taxaEcommerce || 0}%</span>
                           </div>
                           <div className="flex flex-col gap-1 border-x border-orange-500/10 px-4">
                              <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none">Taxa Fixa</span>
                              <span className="text-xs font-black text-primary dark:text-zinc-200 tabular-nums">{centavosParaReais((pedido.configuracoes.taxaFixa || 0) * 100)}</span>
                           </div>
                           <div className="flex flex-col gap-1 pl-1">
                              <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none">Logística</span>
                              <span className="text-xs font-black text-primary dark:text-zinc-200 tabular-nums">{centavosParaReais((pedido.configuracoes.frete || 0) * 100)}</span>
                           </div>
                        </div>
                      </div>
                    )}

                     {/* Logística */}
                     {(pedido.configuracoes.cobrarLogistica || pedido.configuracoes.cobrarInsumosFixos) && (
                        <div className="space-y-4">
                           {pedido.configuracoes.cobrarLogistica && (
                             <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-borda-sutil">
                               <div className="flex items-center gap-4">
                                  <Truck size={16} className="text-orange-500" />
                                  <div className="flex flex-col">
                                     <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Logística e Frete</span>
                                     <span className="text-xs font-bold text-zinc-300">R$ {pedido.configuracoes.frete?.toFixed(2) || "0.00"}</span>
                                  </div>
                               </div>
                            </div>
                          )}
                           {pedido.configuracoes.cobrarInsumosFixos && (
                             <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-borda-sutil">
                               <div className="flex items-center gap-4">
                                  <Box size={16} className="text-orange-500" />
                                  <div className="flex flex-col">
                                     <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Insumos Fixos (Embalagem, etc)</span>
                                     <span className="text-xs font-bold text-zinc-300">R$ {pedido.configuracoes.insumosFixos?.toFixed(2) || "0.00"}</span>
                                  </div>
                               </div>
                            </div>
                          )}
                       </div>
                     )}
                  </div>
                </section>
              )}
            </div>

            {/* Notas Técnicas (se houver) */}
            {pedido.observacoes && (
              <div className="mt-12 p-8 rounded-2xl bg-indigo-500/[0.02] border border-indigo-500/10 flex items-start gap-6">
                 <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <MessageSquare size={24} />
                 </div>
                 <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-indigo-400/60 uppercase tracking-[0.3em]">Observações do Operador</span>
                    <p className="text-sm text-zinc-400 leading-relaxed font-medium italic">
                      {pedido.observacoes}
                    </p>
                 </div>
              </div>
            )}
          </div>

          {/* 📑 Footer Dashboard */}
          <div className="px-10 py-8 border-t border-borda-sutil bg-zinc-50 dark:bg-zinc-900/10 flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Versão do Projeto</span>
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">v10.0 • Sincronizado</span>
                </div>
             </div>
              <button
               onClick={aoFechar}
               className="px-10 py-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl active:scale-95"
             >
               Fechar Dashboard
             </button>
          </div>
        </main>
      </div>
    </Dialogo>
  );
}
