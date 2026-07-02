import { X, DollarSign, Activity, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { DadosDRE } from "@/compartilhado/servicos/servicoFinanceiroAvancado";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ModalDREDetalhadoProps {
  aberto: boolean;
  aoFechar: () => void;
  dre: DadosDRE;
}

export function ModalDREDetalhado({ aberto, aoFechar, dre }: ModalDREDetalhadoProps) {
  if (!aberto) return null;

  const dadosGrafico = [
    { nome: "Receita", valor: dre.receitaBrutaCentavos / 100, cor: "#10b981" }, // Emerald 500
    { nome: "Custos", valor: (dre.custosVariaveisCentavos + dre.despesasFixasCentavos) / 100, cor: "#f43f5e" }, // Rose 500
    { nome: "Lucro", valor: dre.lucroLiquidoCentavos / 100, cor: dre.lucroLiquidoCentavos >= 0 ? "#10b981" : "#f43f5e" },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-custom bg-card border border-borda-sutil rounded-[2rem] shadow-2xl p-8 relative"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabela do DRE */}
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
                    <td className="p-4 font-semibold text-zinc-600 dark:text-zinc-400 pl-8">(-) Custo de Materiais</td>
                    <td className="p-4 text-right font-medium text-rose-500/80 tabular-nums">
                      -{centavosParaReais(dre.custoMaterialCentavos)}
                    </td>
                  </tr>
                  <tr className="border-b border-borda-sutil/60 bg-zinc-50/30 dark:bg-white/[0.005]">
                    <td className="p-4 font-semibold text-zinc-600 dark:text-zinc-400 pl-8">(-) Custo de Insumos</td>
                    <td className="p-4 text-right font-medium text-rose-500/80 tabular-nums">
                      -{centavosParaReais(dre.custoInsumosCentavos)}
                    </td>
                  </tr>
                  <tr className="border-b border-borda-sutil/60 bg-zinc-50/30 dark:bg-white/[0.005]">
                    <td className="p-4 font-semibold text-zinc-600 dark:text-zinc-400 pl-8">(-) Custo de Energia</td>
                    <td className="p-4 text-right font-medium text-rose-500/80 tabular-nums">
                      -{centavosParaReais(dre.custoEnergiaCentavos)}
                    </td>
                  </tr>
                  <tr className="border-b border-borda-sutil/60 bg-zinc-50/30 dark:bg-white/[0.005]">
                    <td className="p-4 font-semibold text-zinc-600 dark:text-zinc-400 pl-8">(-) Depreciação</td>
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
                    <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-300">(-) Despesas Fixas (Gerais)</td>
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

            {/* Painel Gráfico */}
            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-2xl border border-borda-sutil bg-zinc-50/50 dark:bg-white/[0.01] h-[300px]">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 text-center">
                  Análise Gráfica (Receita x Custos x Lucro)
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGrafico} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis 
                      dataKey="nome" 
                      tick={{ fill: "#71717a", fontSize: 10, fontWeight: 800 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", color: "#fff", fontWeight: "bold" }}
                      formatter={(valor: any) => [`R$ ${Number(valor ?? 0).toFixed(2)}`, "Valor"]}
                    />
                    <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                      {dadosGrafico.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-borda-sutil bg-zinc-50/50 dark:bg-white/[0.01]">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Percent size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Lucratividade</span>
                  </div>
                  <span className={`text-xl font-black ${dre.lucroLiquidoCentavos >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {dre.lucratividadePercentual}%
                  </span>
                </div>

                <div className="p-5 rounded-xl border border-borda-sutil bg-zinc-50/50 dark:bg-white/[0.01]">
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <DollarSign size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Ponto de Equilíbrio</span>
                  </div>
                  <span className="text-xl font-black text-primary dark:text-white tabular-nums">
                    {centavosParaReais(dre.pontoEquilibrioCentavos)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
