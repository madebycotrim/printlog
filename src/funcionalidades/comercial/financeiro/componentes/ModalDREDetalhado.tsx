import { X, DollarSign, Activity, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { DadosDRE } from "@/compartilhado/servicos/servicoFinanceiroAvancado";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface ModalDREDetalhadoProps {
  aberto: boolean;
  aoFechar: () => void;
  dre: DadosDRE;
}

export function ModalDREDetalhado({ aberto, aoFechar, dre }: ModalDREDetalhadoProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-card border border-borda-sutil rounded-[2rem] shadow-2xl p-8 relative overflow-hidden"
      >
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, var(--text-muted) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex flex-col h-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-primary dark:text-white uppercase tracking-widest">
                  DRE Detalhado
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Demonstrativo do Resultado do Exercício
                </p>
              </div>
            </div>
            <button
              onClick={aoFechar}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="border border-borda-sutil rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-white/[0.01]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-borda-sutil bg-zinc-100 dark:bg-white/[0.03]">
                  <th className="p-4 font-black uppercase tracking-wider text-zinc-500 text-[10px]">Indicador</th>
                  <th className="p-4 font-black uppercase tracking-wider text-zinc-500 text-[10px] text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. Receita Bruta */}
                <tr className="border-b border-borda-sutil/60">
                  <td className="p-4 font-bold text-primary dark:text-white">Receita Bruta (Faturamento)</td>
                  <td className="p-4 text-right font-black text-emerald-500 tabular-nums">
                    {centavosParaReais(dre.receitaBrutaCentavos)}
                  </td>
                </tr>

                {/* 2. Custos Variáveis */}
                <tr className="border-b border-borda-sutil/60 bg-zinc-50/30 dark:bg-white/[0.005]">
                  <td className="p-4 font-semibold text-zinc-600 dark:text-zinc-400 pl-8">(-) Custo de Materiais (Filamentos/Resinas)</td>
                  <td className="p-4 text-right font-medium text-rose-500/80 tabular-nums">
                    -{centavosParaReais(dre.custoMaterialCentavos)}
                  </td>
                </tr>
                <tr className="border-b border-borda-sutil/60 bg-zinc-50/30 dark:bg-white/[0.005]">
                  <td className="p-4 font-semibold text-zinc-600 dark:text-zinc-400 pl-8">(-) Custo de Insumos Auxiliares</td>
                  <td className="p-4 text-right font-medium text-rose-500/80 tabular-nums">
                    -{centavosParaReais(dre.custoInsumosCentavos)}
                  </td>
                </tr>
                <tr className="border-b border-borda-sutil/60 bg-zinc-50/30 dark:bg-white/[0.005]">
                  <td className="p-4 font-semibold text-zinc-600 dark:text-zinc-400 pl-8">(-) Custo Estimado de Energia Elétrica</td>
                  <td className="p-4 text-right font-medium text-rose-500/80 tabular-nums">
                    -{centavosParaReais(dre.custoEnergiaCentavos)}
                  </td>
                </tr>
                <tr className="border-b border-borda-sutil/60 bg-zinc-50/30 dark:bg-white/[0.005]">
                  <td className="p-4 font-semibold text-zinc-600 dark:text-zinc-400 pl-8">(-) Depreciação Linear de Equipamentos</td>
                  <td className="p-4 text-right font-medium text-rose-500/80 tabular-nums">
                    -{centavosParaReais(dre.depreciacaoCentavos)}
                  </td>
                </tr>

                {/* Total de Custos Variáveis */}
                <tr className="border-b border-borda-sutil/80 bg-zinc-100/30 dark:bg-white/[0.015]">
                  <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300 pl-6">Total Custos Variáveis (COGS)</td>
                  <td className="p-4 text-right font-black text-rose-500 tabular-nums">
                    -{centavosParaReais(dre.custosVariaveisCentavos)}
                  </td>
                </tr>

                {/* Margem de Contribuição */}
                <tr className="border-b border-borda-sutil font-bold bg-zinc-100/50 dark:bg-white/[0.025]">
                  <td className="p-4 text-primary dark:text-white uppercase tracking-wider text-[10px]">(=) Margem de Contribuição</td>
                  <td className="p-4 text-right font-black text-primary dark:text-white tabular-nums">
                    {centavosParaReais(dre.margemContribuicaoCentavos)}
                  </td>
                </tr>

                {/* Despesas Fixas */}
                <tr className="border-b border-borda-sutil/60">
                  <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-300">(-) Despesas Fixas (Operacionais/Adm)</td>
                  <td className="p-4 text-right font-medium text-rose-500 tabular-nums">
                    -{centavosParaReais(dre.despesasFixasCentavos)}
                  </td>
                </tr>

                {/* Lucro Líquido */}
                <tr className="border-b-2 border-borda-sutil font-black bg-zinc-100 dark:bg-white/[0.04]">
                  <td className="p-4 text-sm text-primary dark:text-white uppercase tracking-wider text-[11px]">(=) Lucro Líquido</td>
                  <td className={`p-4 text-right text-sm font-black tabular-nums ${dre.lucroLiquidoCentavos >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {centavosParaReais(dre.lucroLiquidoCentavos)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-borda-sutil bg-zinc-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <Percent size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">Lucratividade</span>
              </div>
              <span className={`text-base font-black ${dre.lucroLiquidoCentavos >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {dre.lucratividadePercentual}%
              </span>
            </div>

            <div className="p-4 rounded-xl border border-borda-sutil bg-zinc-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <DollarSign size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">Ponto de Equilíbrio</span>
              </div>
              <span className="text-base font-black text-primary dark:text-white">
                {centavosParaReais(dre.pontoEquilibrioCentavos)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
