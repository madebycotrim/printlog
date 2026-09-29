import { ArrowDownCircle, ArrowUpCircle, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Insumo } from "../../tipos";
import { centavosParaReais, formatarMoedaFracionada } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesAbaOperacoes {
  insumo: Insumo;
  aoBaixar: () => void;
  aoRepor: () => void;
  corTema?: string;
}

export function AbaOperacoesInsumo({ insumo, aoBaixar, aoRepor, corTema = "sky-500" }: PropriedadesAbaOperacoes) {
  const estaBaixo = insumo.quantidadeAtual <= insumo.quantidadeMinima;

  return (
    <div className="flex flex-col gap-8">
      {/* Cards de Status Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 p-6 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Saldo Atual</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black tabular-nums tracking-tighter transition-colors duration-500 ${estaBaixo ? "text-rose-500" : `text-${corTema}`}`}>
              {insumo.quantidadeAtual}
            </span>
            <span className="text-xs font-black text-zinc-400 uppercase italic">{insumo.unidadeMedida}</span>
          </div>
          {estaBaixo && (
            <div className="flex items-center gap-1.5 mt-2 text-rose-500">
              <AlertTriangle size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Abaixo do Mínimo ({insumo.quantidadeMinima})</span>
            </div>
          )}
        </div>

        <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 p-6 rounded-2xl flex flex-col gap-1">
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Patrimônio em Estoque</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white tabular-nums tracking-tighter">
              {centavosParaReais(Math.round(insumo.quantidadeAtual * insumo.custoMedioUnidade))}
            </span>
          </div>
          <span className="text-[9px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">
            Custo Médio: {formatarMoedaFracionada(insumo.custoMedioUnidade)} / {insumo.unidadeMedida.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Botões de Operação Grande */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <button
          onClick={aoBaixar}
          className="group relative h-32 bg-amber-500/5 hover:bg-amber-500/10 border-2 border-amber-500/20 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all active:scale-95 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <TrendingDown size={80} strokeWidth={1} className="text-amber-500" />
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <ArrowDownCircle size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-center gap-0.5 relative z-10">
            <span className="text-sm font-black text-amber-500 uppercase tracking-widest">Dar Baixa</span>
            <span className="text-[9px] font-bold text-amber-500/60 uppercase">Registrar Saída de Insumo</span>
          </div>
        </button>

        <button
          onClick={aoRepor}
          className="group relative h-32 bg-emerald-500/5 hover:bg-emerald-500/10 border-2 border-emerald-500/20 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all active:scale-95 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <TrendingUp size={80} strokeWidth={1} className="text-emerald-500" />
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <ArrowUpCircle size={24} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-center gap-0.5 relative z-10">
            <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Repor Estoque</span>
            <span className="text-[9px] font-bold text-emerald-500/60 uppercase">Registrar Entrada de Item</span>
          </div>
        </button>
      </div>

      <div className="p-4 bg-zinc-50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-zinc-200 dark:border-white/5 flex items-center justify-center">
         <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">
           Selecione uma operação acima para movimentar o inventário. <br/> 
           <span className="text-[8px] opacity-60">Todas as ações são registradas automaticamente no histórico.</span>
         </p>
      </div>
    </div>
  );
}
