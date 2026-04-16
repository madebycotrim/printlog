import { History as HistoryIcon, ArrowLeft, Download, Package, Clock, DollarSign } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

import { usarArmazemPedidos } from "@/funcionalidades/producao/projetos/estado/armazemPedidos";
import { servicoRelatorios } from "@/compartilhado/servicos/servicoRelatorios";
import { servicoExportacao } from "@/compartilhado/servicos/servicoExportacao";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import toast from "react-hot-toast";

export function PaginaHistoricoProducao() {
  const navigate = useNavigate();
  const pedidos = usarArmazemPedidos((s) => s.pedidos);

  const historico = useMemo(() => servicoRelatorios.gerarHistoricoGlobal(pedidos), [pedidos]);

  usarDefinirCabecalho({
    titulo: "Histórico Global de Produção",
    subtitulo: "Rastreabilidade total de tudo que já foi produzido no seu estúdio.",
    acao: {
      texto: "Voltar",
      icone: ArrowLeft,
      aoClicar: () => navigate("/dashboard"),
    },
  });

  const exportarHistorico = () => {
    const dadosExport = pedidos
      .filter((p) => p.status === "concluido")
      .map((p) => ({
        id: p.id,
        cliente: p.idCliente,
        descricao: p.descricao,
        valor: (p.valorCentavos / 100).toFixed(2),
        peso: p.pesoGramas,
        tempo: p.tempoMinutos,
        data: p.dataConclusao?.toLocaleDateString("pt-BR") || p.dataCriacao.toLocaleDateString("pt-BR"),
      }));

    const colunas = [
      { chave: "data", rotulo: "Data Conclusão" },
      { chave: "descricao", rotulo: "Projeto" },
      { chave: "valor", rotulo: "Valor (R$)" },
      { chave: "peso", rotulo: "Peso (g)" },
      { chave: "tempo", rotulo: "Tempo (min)" },
    ];

    servicoExportacao.exportarCSV(dadosExport, colunas, `historico_producao_${new Date().toISOString().split("T")[0]}`);
    toast.success("Histórico exportado com sucesso!");
  };

  return (
    <div className="space-y-10 pb-20">
      {/* 🔝 RESUMO ACUMULADO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-[2rem] bg-zinc-900 text-white shadow-xl relative overflow-hidden"
        >
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Total Produzido</p>
          <h3 className="text-3xl font-black">{historico.totalPesoGramas / 1000}kg</h3>
          <Package className="absolute -right-4 -bottom-4 opacity-5" size={100} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-[2rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tempo de Máquina</p>
          <h3 className="text-3xl font-black text-zinc-900 dark:text-white">
            {Math.round(historico.totalTempoMinutos / 60)}h
          </h3>
          <Clock className="text-sky-500 mt-2" size={20} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-[2rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Projetos Entregues</p>
          <h3 className="text-3xl font-black text-zinc-900 dark:text-white">{historico.totalProjetosConcluidos}</h3>
          <HistoryIcon className="text-emerald-500 mt-2" size={20} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-[2rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Faturamento Bruto</p>
          <h3 className="text-3xl font-black text-zinc-900 dark:text-white">
            {centavosParaReais(historico.totalFaturadoCentavos)}
          </h3>
          <DollarSign className="text-amber-500 mt-2" size={20} />
        </motion.div>
      </div>

      {/* 📊 GRÁFICO DE ESFORÇO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 rounded-[2.5rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <HistoryIcon size={20} className="text-sky-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Fluxo de Produção Semanal</h4>
            </div>
            <button
              onClick={exportarHistorico}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-500 hover:opacity-70 transition-opacity"
            >
              <Download size={14} />
              Exportar CSV
            </button>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historico.pontosHistoricos}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888810" />
                <XAxis
                  dataKey="data"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 900, fill: "#888" }}
                  tickFormatter={(val) => val.split("-").reverse().slice(0, 2).join("/")}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "11px",
                  }}
                  formatter={(value: any) => [`${value}g`, "Peso"]}
                />
                <Area
                  type="monotone"
                  dataKey="pesoGramas"
                  name="Peso (g)"
                  stroke="#0ea5e9"
                  strokeWidth={4}
                  fill="url(#colorProd)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-10 rounded-[2.5rem] bg-zinc-900 text-white flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Média por Projeto</h4>
            <div className="space-y-8">
              <div>
                <p className="text-sm font-black text-zinc-400 uppercase tracking-tight">Peso Médio</p>
                <p className="text-4xl font-black">
                  {historico.totalProjetosConcluidos > 0
                    ? Math.round(historico.totalPesoGramas / historico.totalProjetosConcluidos)
                    : 0}
                  g
                </p>
              </div>
              <div>
                <p className="text-sm font-black text-zinc-400 uppercase tracking-tight">Tempo Médio</p>
                <p className="text-4xl font-black">
                  {historico.totalProjetosConcluidos > 0
                    ? Math.round(historico.totalTempoMinutos / historico.totalProjetosConcluidos)
                    : 0}
                  min
                </p>
              </div>
              <div>
                <p className="text-sm font-black text-zinc-400 uppercase tracking-tight">Ticket Médio</p>
                <p className="text-4xl font-black text-emerald-400">
                  {centavosParaReais(
                    historico.totalProjetosConcluidos > 0
                      ? Math.round(historico.totalFaturadoCentavos / historico.totalProjetosConcluidos)
                      : 0,
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5">
            <div className="flex items-center gap-3 text-emerald-400 bg-emerald-400/5 p-4 rounded-2xl border border-emerald-400/10">
              <Package size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                Produção estável com crescimento de 12% este mês.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 LISTA RESUMIDA DE CONCLUSÕES */}
      <div className="p-10 rounded-[2.5rem] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-10">
          Projetos Recentemente Concluídos
        </h4>
        <div className="space-y-4">
          {pedidos
            .filter((p) => p.status === "concluido")
            .slice(-5)
            .reverse()
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-transparent hover:border-sky-500/20 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">{p.descricao}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Concluído em: {p.dataConclusao?.toLocaleDateString("pt-BR") || "---"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Recursos</p>
                    <p className="text-xs font-black">
                      {p.pesoGramas}g • {p.tempoMinutos}min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Valor</p>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">
                      {centavosParaReais(p.valorCentavos)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
