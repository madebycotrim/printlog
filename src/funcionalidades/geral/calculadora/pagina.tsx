import {
  Calculator,
  Zap,
  Scale,
  Timer,
  DollarSign,
  TrendingUp,
  RefreshCcw,
  FileUp,
  Sparkles,
  Loader2,
} from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useState, useMemo, useEffect } from "react";
import { calcularCustoImpressao } from "@/compartilhado/utilitarios/calculosFinanceiros";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { usarAnalisadorGCode } from "@/compartilhado/hooks/usarAnalisadorGCode";
import { motion, AnimatePresence } from "framer-motion";

export function PaginaCalculadora() {
  // Estados do Formulário (Valores em Reais para facilitar input, convertidos depois)
  const [peso, setPeso] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(0);
  const [precoFilamento, setPrecoFilamento] = useState<number>(120); // R$ 120/kg padrão
  const [potencia, setPotencia] = useState<number>(150); // 150W média
  const [precoKwh, setPrecoKwh] = useState<number>(0.85); // R$ 0.85/kWh média
  const [maoDeObra, setMaoDeObra] = useState<number>(25); // R$ 25/hora
  const [margem, setMargem] = useState<number>(100); // 100% de lucro padrão

  const { analisando, resultado, analisarArquivo, limparAnalise, erro: erroAnalise } = usarAnalisadorGCode();

  usarDefinirCabecalho({
    titulo: "Calculadora Pro",
    subtitulo: "Engenharia de custos para estúdios 3D",
    placeholderBusca: "ESTIMAR CUSTO...",
  });

  // Atualiza campos se houver análise de G-Code
  useEffect(() => {
    if (resultado) {
      setPeso(resultado.pesoEstimadoGramas);
      setTempo(resultado.tempoEstimadoMinutos);
    }
  }, [resultado]);

  const calculo = useMemo(() => {
    return calcularCustoImpressao({
      pesoGramas: peso,
      tempoMinutos: tempo,
      precoFilamentoKgCentavos: Math.round(precoFilamento * 100),
      potenciaW: potencia,
      precoKwhCentavos: Math.round(precoKwh * 100),
      taxaLucro: margem / 100,
      maoDeObraHoraCentavos: Math.round(maoDeObra * 100),
    });
  }, [peso, tempo, precoFilamento, potencia, precoKwh, margem, maoDeObra]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* COLUNA DE INPUTS */}
      <div className="xl:col-span-8 space-y-6">
        {/* DROPZONE G-CODE */}
        <div
          className={`relative p-8 rounded-3xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-4 group overflow-hidden ${
            analisando
              ? "border-sky-500 bg-sky-500/5"
              : resultado
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-gray-100 dark:border-white/5 bg-white dark:bg-[#121214] hover:border-sky-500/30 shadow-sm"
          }`}
        >
          <input
            type="file"
            accept=".gcode"
            className="absolute inset-0 opacity-0 cursor-pointer z-20"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) analisarArquivo(file);
            }}
          />

          <AnimatePresence mode="wait">
            {analisando ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center"
              >
                <Loader2 size={40} className="text-sky-500 animate-spin mb-4" />
                <h4 className="text-sm font-black uppercase tracking-widest">Processando Geometria...</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
                  Extraindo parâmetros via Web Worker
                </p>
              </motion.div>
            ) : resultado ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
                  <Sparkles size={24} />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Parâmetros Importados com Sucesso!
                </h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                  {resultado.fatiadorDetectado} • {resultado.quantidadeLinhas.toLocaleString()} linhas
                </p>
                <button
                  onClick={limparAnalise}
                  className="mt-4 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-lg border border-transparent hover:border-rose-500/20"
                >
                  Carregar Outro Arquivo
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-sky-500 group-hover:bg-sky-500/10 transition-all duration-500">
                  <FileUp size={32} strokeWidth={1.5} />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest mt-6">Solte seu G-Code aqui</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                  Auto-preenchimento inteligente de peso e tempo
                </p>
              </div>
            )}
          </AnimatePresence>

          {erroAnalise && (
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-4 animate-bounce">
              {erroAnalise}
            </span>
          )}
        </div>

        {/* GRADES DE INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD PROJETO */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
              <Calculator size={18} className="text-sky-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Dimensões do Projeto</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Peso Estimado (Gramas)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={peso}
                    onChange={(e) => setPeso(Number(e.target.value))}
                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-sky-500/50 focus:bg-white dark:focus:bg-black transition-all outline-none font-black text-sm"
                  />
                  <Scale size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Tempo de Impressão (Minutos)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-sky-500/50 focus:bg-white dark:focus:bg-black transition-all outline-none font-black text-sm"
                  />
                  <Timer size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* CARD OPERAÇÃO */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-white/5">
              <Zap size={18} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-widest">Configurações de Custo</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Preço do Filamento (R$/kg)
                </label>
                <input
                  type="number"
                  value={precoFilamento}
                  onChange={(e) => setPrecoFilamento(Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-amber-500/50 transition-all outline-none font-black text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Consumo (W)
                </label>
                <input
                  type="number"
                  value={potencia}
                  onChange={(e) => setPotencia(Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-amber-500/50 transition-all outline-none font-black text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  kWh (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={precoKwh}
                  onChange={(e) => setPrecoKwh(Number(e.target.value))}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-amber-500/50 transition-all outline-none font-black text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MARGEM E MÃO DE OBRA */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Margem de Lucro Sugerida
              </label>
              <span className="text-sm font-black text-sky-500">{margem}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={margem}
              onChange={(e) => setMargem(Number(e.target.value))}
              className="w-full accent-sky-500 h-2 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Mão de Obra por Hora (R$)
            </label>
            <div className="relative">
              <input
                type="number"
                value={maoDeObra}
                onChange={(e) => setMaoDeObra(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border-transparent focus:border-sky-500/50 transition-all outline-none font-black text-sm"
              />
              <DollarSign size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA DE RESULTADOS */}
      <div className="xl:col-span-4 space-y-6 lg:sticky lg:top-8">
        <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center text-center overflow-hidden relative">
          {/* Efeito Glow de Fundo */}
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />

          <div className="relative z-10 w-full">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-400 opacity-60">
              Preço Estimado de Venda
            </span>
            <div className="mt-6 mb-10 flex flex-col items-center">
              <h2 className="text-6xl font-black text-white tracking-tighter leading-none mb-2">
                {centavosParaReais(calculo.precoSugerido)}
              </h2>
              <div className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full">
                <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">
                  Margem de {margem}% Aplicada
                </span>
              </div>
            </div>

            <div className="space-y-4 w-full pt-10 border-t border-white/5">
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                    <Scale size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                    Material
                  </span>
                </div>
                <span className="text-sm font-black text-white">{centavosParaReais(calculo.custoMaterial)}</span>
              </div>

              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                    <Zap size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                    Energia
                  </span>
                </div>
                <span className="text-sm font-black text-white">{centavosParaReais(calculo.custoEnergia)}</span>
              </div>

              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                    <TrendingUp size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
                    Mão de Obra
                  </span>
                </div>
                <span className="text-sm font-black text-white">{centavosParaReais(calculo.custoMaoDeObra)}</span>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Custo Total Real
                </span>
                <span className="text-lg font-black text-emerald-400">{centavosParaReais(calculo.custoTotal)}</span>
              </div>
            </div>

            <button className="mt-12 w-full h-14 bg-white hover:bg-sky-400 text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-black/20">
              <RefreshCcw size={16} strokeWidth={3} />
              Refinar Estratégia
            </button>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-sky-500/5 border border-sky-500/10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
            <TrendingUp size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
              Insight Maker
            </h4>
            <p className="text-[11px] font-medium text-gray-500 dark:text-sky-200/50 leading-relaxed">
              Aumentar a margem para {margem + 20}% pode cobrir amortizações de hardware em menos de 6 meses baseado no
              fluxo atual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
