import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingDown, Activity, TrendingUp, Minus, Box } from "lucide-react";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

export function GraficoConsumoMateriais({
  materiais,
}: {
  materiais: Material[];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const DIAS_ANALISE = 30;

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

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
      estoqueTotalRestante,
      mediaDiaria30d: Math.round(mediaDiaria30d)
    };
  }, [materiais]);

  // Formatações
  const totalFormatado = metricas.totalGasto30d >= 1000
    ? `${(metricas.totalGasto30d / 1000).toFixed(2)}`
    : `${metricas.totalGasto30d}`;

  const unidadeTotal = metricas.totalGasto30d >= 1000 ? 'kg' : 'g';

  const estoqueFormatado = metricas.estoqueTotalRestante >= 1000
    ? `${(metricas.estoqueTotalRestante / 1000).toFixed(1)}kg`
    : `${metricas.estoqueTotalRestante}g`;

  let stringPrevisao = "Indefinida";
  let corPrevisao = "text-sky-400";
  let bgPrevisao = "bg-sky-500/10 border-sky-500/20";
  let textoSuperPrevisao = "text-sky-400";
  let IconeTendencia = Minus;

  if (metricas.previsaoFimDias === Infinity) {
    stringPrevisao = "Inativo";
    corPrevisao = "text-zinc-500";
    bgPrevisao = "bg-zinc-500/5 border-zinc-500/10";
    textoSuperPrevisao = "text-zinc-500";
  } else if (metricas.previsaoFimDias <= 7) {
    stringPrevisao = `${metricas.previsaoFimDias} Dias!`;
    corPrevisao = "text-rose-400";
    bgPrevisao = "bg-rose-500/10 border-rose-500/20";
    textoSuperPrevisao = "text-rose-400";
    IconeTendencia = TrendingDown;
  } else if (metricas.previsaoFimDias <= 30) {
    stringPrevisao = `${metricas.previsaoFimDias} Dias`;
    corPrevisao = "text-amber-400";
    bgPrevisao = "bg-amber-500/10 border-amber-500/20";
    textoSuperPrevisao = "text-amber-400";
    IconeTendencia = TrendingDown;
  } else if (metricas.previsaoFimDias < 365) {
    const meses = Math.floor(metricas.previsaoFimDias / 30);
    stringPrevisao = `${meses} Mês${meses > 1 ? 'es' : ''}`;
    corPrevisao = "text-emerald-400";
    bgPrevisao = "bg-emerald-500/10 border-emerald-500/20";
    textoSuperPrevisao = "text-emerald-400";
    IconeTendencia = TrendingUp;
  } else {
    stringPrevisao = "Estável";
    corPrevisao = "text-sky-400";
    bgPrevisao = "bg-sky-500/10 border-sky-500/20";
    textoSuperPrevisao = "text-sky-400";
    IconeTendencia = Minus;
  }

  return (
    <div className="bg-transparent w-full flex flex-col pt-0 select-none">
      {/* 📊 GRID DE INDICADORES DE ALTA PERFORMANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Velocidade de Fluxo */}
        <div className="relative group overflow-hidden bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-6 rounded-[2rem] transition-all hover:border-sky-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={48} className="text-sky-500" />
          </div>
          <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
            Fluxo de Saída (30d)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
              {totalFormatado}
            </span>
            <span className="text-sm font-bold text-zinc-500 uppercase">{unidadeTotal}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: metricas.totalGasto30d > 0 ? "65%" : "0%" }}
                 className="h-full bg-sky-500"
               />
            </div>
          </div>
        </div>

        {/* Média Diária */}
        <div className="relative group overflow-hidden bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-6 rounded-[2rem] transition-all hover:border-indigo-500/30">
          <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
            Gasto Médio Diário
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
              {metricas.mediaDiaria30d}
            </span>
            <span className="text-sm font-bold text-zinc-500 uppercase">g/dia</span>
          </div>
          <p className="text-[10px] font-bold text-zinc-500 mt-4 uppercase tracking-titer">
            Média ponderada 30 dias
          </p>
        </div>

        {/* Patrimônio Atual */}
        <div className="relative group overflow-hidden bg-white dark:bg-[#121214] border border-zinc-200 dark:border-white/5 p-6 rounded-[2rem] transition-all hover:border-emerald-500/30">
          <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
            Total em Prateleira
          </span>
          <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
            {estoqueFormatado}
          </span>
          <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            <Box size={10} strokeWidth={3} /> Disponível P/ Uso
          </div>
        </div>

        {/* Previsão de Ruptura */}
        <div className={`relative group overflow-hidden border p-6 rounded-[2rem] transition-all ${bgPrevisao}`}>
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <IconeTendencia size={40} className={corPrevisao} />
          </div>
          <span className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${textoSuperPrevisao}`}>
             Ponto de Ruptura
          </span>
          <span className={`text-3xl font-black tracking-tighter ${corPrevisao}`}>
            {stringPrevisao}
          </span>
          <p className={`text-[10px] font-bold mt-4 uppercase tracking-tighter opacity-70 ${corPrevisao}`}>
            Estimativa de exaustão
          </p>
        </div>
      </div>

      {/* 📈 GRÁFICO DE ÁREA PREMIUM */}
      <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-200/50 dark:border-white/5 rounded-[2.5rem] p-8 relative">
        <div className="mb-6">
           <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">
             Curva de Consumo Acumulado
           </h4>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
             <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-500 uppercase tracking-widest">
               Monitoramento de Saída (D1 Database Sync)
             </span>
           </div>
        </div>

        <div className="w-full h-[320px] min-h-[320px] relative">
          {isMounted && metricas.dadosGrafico.length > 0 && metricas.totalGasto30d > 0 ? (
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart data={metricas.dadosGrafico} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="corConsumo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="linhaConsumo" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(161, 161, 170, 0.1)" />
                <XAxis 
                  dataKey="data" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: "#71717a", fontWeight: "900", letterSpacing: '0.05em' }}
                  dy={15}
                  minTickGap={40}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: "#71717a", fontWeight: "900" }} 
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : `${v}g`}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(14, 165, 233, 0.2)', strokeWidth: 1 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[140px]">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-white/5 pb-2 mb-1">
                            {label}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">
                              {data.pesoAcumulado}g
                            </span>
                            <span className="text-[9px] font-bold text-sky-500 uppercase tracking-widest">
                              Acumulado no Mês
                            </span>
                          </div>
                          {data.gastoDiario > 0 && (
                            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-white/5 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                               <span className="text-[10px] font-black text-emerald-500 uppercase">
                                 +{data.gastoDiario}g consumidos
                               </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pesoAcumulado"
                  stroke="url(#linhaConsumo)"
                  strokeWidth={5}
                  fillOpacity={1}
                  fill="url(#corConsumo)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-800 border-2 border-dashed border-zinc-100 dark:border-white/5 rounded-[2rem]">
              <div className="bg-zinc-50 dark:bg-white/5 p-6 rounded-full mb-6">
                <Activity size={40} className="opacity-20 translate-y-1" />
              </div>
              <h5 className="text-sm font-black text-zinc-400 dark:text-zinc-700 uppercase tracking-[0.2em] mb-2">
                Dados Insuficientes
              </h5>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-700 uppercase tracking-widest max-w-[280px] text-center leading-relaxed">
                Os registros de consumo começariam a aparecer aqui após a primeira produção finalizada.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
