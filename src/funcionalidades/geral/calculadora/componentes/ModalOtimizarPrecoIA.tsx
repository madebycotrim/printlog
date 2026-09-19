import { useState, useEffect } from "react";
import { Dialogo } from "@/compartilhado/componentes/ui";
import { 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Crown, 
  Lightbulb, 
  ArrowRight,
  RefreshCw,
  Sliders
} from "lucide-react";
import { SugestaoPrecoIA } from "../servicos/servicoIA";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  precoAtualCentavos: number;
  margemAtual: number;
  sugestao: SugestaoPrecoIA | null;
  carregando: boolean;
  aoRecalcularIA?: () => void;
  aoAplicarPreco: (valorReais: number) => void;
}

type EstrategiaTipo = "piso" | "recomendado" | "premium" | "personalizado";

export function ModalOtimizarPrecoIA({
  aberto,
  aoFechar,
  precoAtualCentavos,
  sugestao,
  carregando,
  aoRecalcularIA,
  aoAplicarPreco
}: Props) {
  const [estrategiaSelecionada, setEstrategiaSelecionada] = useState<EstrategiaTipo>("recomendado");
  const [valorCustomizado, setValorCustomizado] = useState<number>(0);

  // Inicializa a seleção com o valor recomendado sempre que uma nova sugestão chegar
  useEffect(() => {
    if (sugestao?.recomendado) {
      setEstrategiaSelecionada("recomendado");
      setValorCustomizado(sugestao.recomendado.valor);
    }
  }, [sugestao]);

  if (!aberto) return null;

  const precoAtualReais = precoAtualCentavos / 100;

  // Determina o valor atualmente selecionado
  const obterValorSelecionado = (): number => {
    if (!sugestao) return precoAtualReais;
    switch (estrategiaSelecionada) {
      case "piso":
        return sugestao.piso.valor;
      case "recomendado":
        return sugestao.recomendado.valor;
      case "premium":
        return sugestao.premium.valor;
      case "personalizado":
        return valorCustomizado > 0 ? valorCustomizado : sugestao.recomendado.valor;
      default:
        return sugestao.recomendado.valor;
    }
  };

  const valorFinal = obterValorSelecionado();
  const diferencaReais = valorFinal - precoAtualReais;
  const percentualVariacao = precoAtualReais > 0 ? ((diferencaReais / precoAtualReais) * 100) : 0;

  const lidarComConfirmacao = () => {
    if (valorFinal > 0) {
      aoAplicarPreco(valorFinal);
      aoFechar();
    }
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Otimização de Preço com IA"
      subtitulo="Análise inteligente de concorrência, margens e custos operacionais"
      icone={Sparkles}
      larguraMax="max-w-xl"
    >
      <div className="p-5 flex flex-col gap-4">
        {carregando ? (
          <div className="py-14 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/30 flex items-center justify-center animate-pulse">
                <Sparkles size={24} className="text-sky-500 animate-spin" />
              </div>
            </div>
            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
              Processando inteligência de mercado com Llama 3.2...
            </p>
            <p className="text-[10px] text-zinc-400">
              Avaliando tempo de máquina, peso, depreciação e padrões de mercado nacional
            </p>
          </div>
        ) : sugestao ? (
          <>
            {/* Banner Comparativo: Atual vs IA */}
            <div className="bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-900 dark:via-zinc-800/80 dark:to-zinc-900 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Preço Atual
                </span>
                <span className="text-base font-black text-zinc-600 dark:text-zinc-400 line-through decoration-zinc-400/50">
                  {centavosParaReais(precoAtualCentavos)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center text-sky-500">
                  <ArrowRight size={14} />
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-sky-500">
                    Proposta Selecionada
                  </span>
                  {diferencaReais !== 0 && (
                    <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-full ${
                      diferencaReais > 0 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {diferencaReais > 0 ? '+' : ''}{percentualVariacao.toFixed(1)}%
                    </span>
                  )}
                </div>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  R$ {valorFinal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Grid com 3 Estratégias */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. PISO */}
              <button
                type="button"
                onClick={() => setEstrategiaSelecionada("piso")}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 ${
                  estrategiaSelecionada === "piso"
                    ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-500 shadow-md scale-[1.02]"
                    : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                      <ShieldCheck size={14} />
                      <span className="text-[9px] font-black uppercase tracking-wider">Piso / Atacado</span>
                    </div>
                    {estrategiaSelecionada === "piso" && (
                      <div className="w-4 h-4 rounded-full bg-zinc-600 text-white flex items-center justify-center">
                        <Check size={10} />
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-base font-black text-zinc-800 dark:text-zinc-200">
                    R$ {sugestao.piso.valor.toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <p className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  {sugestao.piso.justificativa}
                </p>
              </button>

              {/* 2. RECOMENDADO (DESTAQUE) */}
              <button
                type="button"
                onClick={() => setEstrategiaSelecionada("recomendado")}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 ${
                  estrategiaSelecionada === "recomendado"
                    ? "bg-gradient-to-b from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/15 border-sky-500 shadow-lg shadow-sky-500/10 scale-[1.03] ring-1 ring-sky-500"
                    : "bg-white dark:bg-zinc-900/50 border-sky-500/30 hover:border-sky-500/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                      <Sparkles size={14} />
                      <span className="text-[9px] font-black uppercase tracking-wider">Recomendado</span>
                    </div>
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-sky-500 text-white tracking-widest">
                      IA ✨
                    </span>
                  </div>
                  <div className="mt-1 text-lg font-black text-sky-600 dark:text-sky-400">
                    R$ {sugestao.recomendado.valor.toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <p className="text-[9px] text-zinc-600 dark:text-zinc-300 leading-tight font-medium">
                  {sugestao.recomendado.justificativa}
                </p>
              </button>

              {/* 3. PREMIUM */}
              <button
                type="button"
                onClick={() => setEstrategiaSelecionada("premium")}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 ${
                  estrategiaSelecionada === "premium"
                    ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 shadow-md scale-[1.02] ring-1 ring-amber-500"
                    : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/40 opacity-80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <Crown size={14} />
                      <span className="text-[9px] font-black uppercase tracking-wider">Premium</span>
                    </div>
                    {estrategiaSelecionada === "premium" && (
                      <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check size={10} />
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-base font-black text-amber-600 dark:text-amber-400">
                    R$ {sugestao.premium.valor.toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <p className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  {sugestao.premium.justificativa}
                </p>
              </button>
            </div>

            {/* Ajuste fino personalizado (opcional) */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Sliders size={13} className="text-zinc-400" />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                  Deseja ajustar o valor?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-zinc-400">R$</span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={valorCustomizado || ""}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setValorCustomizado(v);
                    setEstrategiaSelecionada("personalizado");
                  }}
                  placeholder={valorFinal.toFixed(2)}
                  className="w-24 h-7 text-xs font-black text-right px-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Dica Estratégica da IA */}
            {sugestao.dica && (
              <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 flex items-start gap-2.5">
                <Lightbulb size={15} className="text-sky-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-sky-900 dark:text-sky-200 leading-relaxed font-medium">
                  <strong className="font-bold text-sky-600 dark:text-sky-400 mr-1">Visão Estratégica:</strong>
                  {sugestao.dica}
                </p>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
              <button
                type="button"
                onClick={lidarComConfirmacao}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Check size={15} />
                <span>Sim, Alterar para R$ {valorFinal.toFixed(2).replace('.', ',')}</span>
              </button>

              <button
                type="button"
                onClick={aoFechar}
                className="h-11 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Não, Manter Atual ({centavosParaReais(precoAtualCentavos)})
              </button>
            </div>

            {aoRecalcularIA && (
              <div className="flex justify-center mt-1">
                <button
                  type="button"
                  onClick={aoRecalcularIA}
                  className="text-[9px] font-bold text-zinc-400 hover:text-sky-500 flex items-center gap-1 uppercase tracking-wider transition-colors"
                >
                  <RefreshCw size={10} />
                  <span>Recalcular com outra variação de IA</span>
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </Dialogo>
  );
}
