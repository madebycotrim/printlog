import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingDown, Activity, TrendingUp, Minus } from "lucide-react";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { useMemo } from "react";

export function GraficoConsumoMateriais({
  materiais,
}: {
  materiais: Material[];
}) {
  const DIAS_ANALISE = 30;

  const metricas = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - DIAS_ANALISE);

    // 1. Extrair e Normalizar Registros (Apenas dos últimos 30 dias)
    const registrosRecentes = materiais.flatMap((m) => {
      const historico = Array.isArray(m.historicoUso) ? m.historicoUso : [];
      return historico.map(registro => {
        // Conversão de "02 fev, 14:30" para Date requer adaptação simples
        // Como o JS puro não entende "fev" facilmente, faremos uma estimativa pelo ID (Date.now())
        // O id dos registros é gerado através de Date.now().toString()
        const timestamp = Number(registro.id);
        const dataReal = isNaN(timestamp) ? new Date() : new Date(timestamp);

        return {
          ...registro,
          dataReal,
          gastoGramas: registro.quantidadeGastaGramas
        };
      });
    }).filter(r => r.dataReal >= trintaDiasAtras && r.dataReal <= hoje);

    // 2. Total Gasto em 30 Dias
    const totalGasto30d = registrosRecentes.reduce((acc, curr) => acc + curr.gastoGramas, 0);

    // 3. Previsão de Fim
    const estoqueTotalRestante = materiais.reduce((acc, m) => acc + m.pesoRestanteGramas + (m.estoque * m.pesoGramas), 0);
    const mediaDiaria30d = totalGasto30d / DIAS_ANALISE;

    // Se o consumo diário é zero, estoque dura infinito
    const previsaoFimDias = mediaDiaria30d > 0 ? Math.floor(estoqueTotalRestante / mediaDiaria30d) : Infinity;

    // 4. Construir Array Contínua de Dias para o Grafico Área (Evitar gaps no gráfico)
    const dadosGrafico = [];
    let acumuladorPlotagem = 0;

    // Agrupa gastos por Mês-Dia "MM-DD" para aglutinar consumos no mesmo dia
    const gastosPorDia = registrosRecentes.reduce((acc, r) => {
      const dataFormatada = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
        .format(r.dataReal)
        .replace(' de ', ' ')
        .replace('.', '');
      acc[dataFormatada] = (acc[dataFormatada] || 0) + r.gastoGramas;
      return acc;
    }, {} as Record<string, number>);

    for (let i = DIAS_ANALISE - 1; i >= 0; i--) {
      const dataCorrente = new Date(hoje);
      dataCorrente.setDate(hoje.getDate() - i);

      const labelAmigavel = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
        .format(dataCorrente)
        .replace(' de ', ' ')
        .replace('.', '');

      const gastoNoDia = gastosPorDia[labelAmigavel] || 0;
      acumuladorPlotagem += gastoNoDia;

      dadosGrafico.push({
        data: labelAmigavel,
        gastoDiario: gastoNoDia,
        pesoAcumulado: Math.round(acumuladorPlotagem)
      });
    }

    return {
      totalGasto30d,
      previsaoFimDias,
      dadosGrafico,
      estoqueTotalRestante
    };
  }, [materiais]);

  // Formatações
  const totalFormatado = metricas.totalGasto30d >= 1000
    ? `${(metricas.totalGasto30d / 1000).toFixed(1)}kg`
    : `${metricas.totalGasto30d}g`;

  let stringPrevisao = "Mais de ano";
  let corPrevisao = "text-sky-700 dark:text-sky-300";
  let bgPrevisao = "bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20";
  let textoSuperPrevisao = "text-sky-600 dark:text-sky-400";
  let IconeTendencia = Minus;

  if (metricas.previsaoFimDias === Infinity) {
    stringPrevisao = "Estático";
  } else if (metricas.previsaoFimDias <= 7) {
    stringPrevisao = `${metricas.previsaoFimDias} Dias!`;
    corPrevisao = "text-rose-700 dark:text-rose-300";
    bgPrevisao = "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20";
    textoSuperPrevisao = "text-rose-600 dark:text-rose-400";
    IconeTendencia = TrendingDown;
  } else if (metricas.previsaoFimDias <= 30) {
    stringPrevisao = `${metricas.previsaoFimDias} Dias`;
    corPrevisao = "text-amber-700 dark:text-amber-300";
    bgPrevisao = "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20";
    textoSuperPrevisao = "text-amber-600 dark:text-amber-400";
    IconeTendencia = TrendingDown;
  } else if (metricas.previsaoFimDias < 365) {
    const meses = Math.floor(metricas.previsaoFimDias / 30);
    stringPrevisao = `${meses} Mês${meses > 1 ? 'es' : ''}`;
    corPrevisao = "text-emerald-700 dark:text-emerald-300";
    bgPrevisao = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20";
    textoSuperPrevisao = "text-emerald-600 dark:text-emerald-400";
    IconeTendencia = TrendingUp;
  }

  return (
    <div className="bg-transparent mb-4 w-full h-full flex flex-col pt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="text-sky-500" size={24} strokeWidth={2.5} />
            Velocidade de Consumo
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed max-w-sm">
            Gasto contínuo da biblioteca nas últimas 4 semanas de operação.
          </p>
        </div>

        <div className="flex gap-4 group">
          <div className="bg-gray-50 dark:bg-[#121214] border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 shrink-0 shadow-sm relative overflow-hidden group-hover:border-sky-200 dark:group-hover:border-sky-500/20 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="block text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5 relative z-10">
              Gasto (30d)
            </span>
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {totalFormatado}
              </span>
            </div>
          </div>

          <div className={`border rounded-2xl p-4 shrink-0 shadow-sm transition-all relative overflow-hidden ${bgPrevisao}`}>
            <span className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 transition-colors relative z-10 ${textoSuperPrevisao}`}>
              Previsão de Fim
            </span>
            <div className="flex items-center gap-2.5 relative z-10">
              <span className={`text-xl font-black tracking-tight transition-colors ${corPrevisao}`}>
                {stringPrevisao}
              </span>
              <IconeTendencia size={18} className={`transition-colors opacity-90 ${corPrevisao}`} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-64 mt-4">
        {metricas.dadosGrafico.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={metricas.dadosGrafico}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="corConsumo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="linhaConsumo" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="data"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 600 }}
                dy={10}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#a1a1aa", fontWeight: 600 }}
                tickFormatter={(valor) => `${valor}u`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  color: "#fff",
                  fontWeight: "bold",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                  padding: "12px 16px"
                }}
                itemStyle={{ color: "#38bdf8", fontSize: '15px', fontWeight: '900' }}
                formatter={(value: any, _: any, props: any) => [
                  `+${props.payload.gastoDiario}u no dia (${value}u Total)`,
                  "Consumo",
                ]}
                labelStyle={{ color: "#a1a1aa", marginBottom: "6px", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '800' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="pesoAcumulado"
                stroke="url(#linhaConsumo)"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#corConsumo)"
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-in-out"
                activeDot={{ r: 6, fill: "#38bdf8", stroke: "#fff", strokeWidth: 2, className: "drop-shadow-md" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600">
            <Activity size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
            <span className="text-sm font-bold">Consumo Insuficiente para Análise</span>
          </div>
        )}
      </div>
    </div>
  );
}
