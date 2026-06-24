import { Pedido, ItemPosProcesso } from "../tipos";
import { 
  DollarSign
} from "lucide-react";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { useMemo } from "react";
import { useGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/useGerenciadorMateriais";

interface PropriedadesAbaCustos {
  pedido: Pedido;
}

export function AbaCustosProjeto({ pedido }: PropriedadesAbaCustos) {
  const { estado: estadoMateriais } = useGerenciadorMateriais();

  const pesoEfetivo = useMemo(() => {
    return pedido.pesoGramas || (pedido.materiais?.reduce((acc, m) => acc + (m.quantidadeGasta || 0), 0)) || 0;
  }, [pedido]);

  const itensPosProcesso = useMemo((): ItemPosProcesso[] => {
    const parsear = (v: any): any[] => {
      if (!v) return [];
      if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; } }
      return Array.isArray(v) ? v : [];
    };
    return parsear(pedido.posProcesso).length > 0 
      ? parsear(pedido.posProcesso) 
      : parsear(pedido.configuracoes?.posProcesso);
  }, [pedido]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Resumo do Investimento */}
      <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-[9px] font-black text-emerald-600/60 dark:text-emerald-500/40 uppercase tracking-[0.2em] block">Investimento Comercial</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter">
              {centavosParaReais(pedido.valorCentavos)}
            </span>
          </div>
        </div>

        {pedido.configuracoes?.quantidade > 1 && (
          <span className="text-[10px] font-black px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg uppercase tracking-wider">
            {centavosParaReais(Math.round(pedido.valorCentavos / pedido.configuracoes.quantidade))} /un
          </span>
        )}
      </div>

      {/* Composição de Materiais e Insumos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Materiais Utilizados */}
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 space-y-4">
          <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Composição de Materiais</span>
          {pedido.materiais && pedido.materiais.length > 0 ? (
            <div className="space-y-3">
              {pedido.materiais.map((m, idx) => {
                const infoMaterial = (estadoMateriais.materiais || []).find(mat => mat.id === m.idMaterial);
                const corMaterial = infoMaterial?.cor || "#3b82f6";
                return (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: corMaterial }} />
                      <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{m.nome}</span>
                    </div>
                    <span className="text-xs font-black text-zinc-500 tabular-nums">{m.quantidadeGasta}g</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-white/5 rounded-xl">
              <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{pedido.material || "Filamento Base"}</span>
              <span className="text-xs font-black text-zinc-500 tabular-nums">{pesoEfetivo}g</span>
            </div>
          )}
        </div>

        {/* Insumos Secundários */}
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 space-y-4">
          <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Insumos Secundários</span>
          {pedido.insumosSecundarios && pedido.insumosSecundarios.length > 0 ? (
            <div className="space-y-3">
              {pedido.insumosSecundarios.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-white/5 rounded-xl">
                  <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{i.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-zinc-400">Qtd: {i.quantidade}</span>
                    <span className="text-xs font-black text-zinc-500 tabular-nums">
                      {centavosParaReais(i.quantidade * (i.custoUnitarioCentavos || 0))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-600 italic py-3 text-center uppercase tracking-wider">Sem insumos secundários</p>
          )}
        </div>

      </div>

      {/* Pós-Processamento e Custos do Setup */}
      {pedido.configuracoes && (
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 space-y-6">
          <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block border-b border-zinc-200/30 dark:border-white/5 pb-3">Composição Fina de Setup</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Energia */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-white/5 space-y-1">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Energia</span>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-250 block">{pedido.configuracoes.potencia || 0}W</span>
            </div>

            {/* Mão de Obra */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-white/5 space-y-1">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Mão de Obra</span>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-250 block">R$ {pedido.configuracoes.maoDeObra?.toFixed(2) || "0.00"}/h</span>
            </div>

            {/* Depreciação */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-white/5 space-y-1">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Desgaste Máquina</span>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-250 block">R$ {pedido.configuracoes.depreciacaoHora?.toFixed(2) || "0.00"}/h</span>
            </div>

            {/* Margem */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/20 border border-zinc-200/30 dark:border-white/5 space-y-1">
              <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Lucro Líquido</span>
              <span className="text-sm font-black text-zinc-800 dark:text-zinc-250 block">{pedido.configuracoes.margem || 0}%</span>
            </div>

          </div>
        </div>
      )}

      {/* Serviços de Acabamento */}
      {itensPosProcesso.length > 0 && (
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-white/[0.01] border border-zinc-200/50 dark:border-white/5 space-y-4">
          <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Serviços de Acabamento</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {itensPosProcesso.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-white/5 rounded-xl">
                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{p.nome}</span>
                <span className="text-xs font-black text-zinc-500 tabular-nums">{centavosParaReais(p.valor)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
