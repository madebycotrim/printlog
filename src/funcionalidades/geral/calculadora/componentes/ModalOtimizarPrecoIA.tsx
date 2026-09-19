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
  Sliders,
  Zap,
  AlertTriangle,
  Copy,
  ExternalLink,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { SugestaoPrecoIA } from "../servicos/servicoIA";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { toast } from "sonner";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  precoAtualCentavos: number;
  custoTotalCentavos?: number;
  margemAtual: number;
  sugestao: SugestaoPrecoIA | null;
  carregando: boolean;
  nomeProjeto?: string;
  clienteTelefone?: string;
  aoRecalcularIA?: () => void;
  aoAplicarPreco: (valorReais: number) => void;
}

type EstrategiaTipo = "piso" | "recomendado" | "premium" | "express" | "personalizado";
type AbaModal = "estrategias" | "diagnostico" | "whatsapp";

export function ModalOtimizarPrecoIA({
  aberto,
  aoFechar,
  precoAtualCentavos,
  custoTotalCentavos = 0,
  sugestao,
  carregando,
  clienteTelefone,
  aoRecalcularIA,
  aoAplicarPreco
}: Props) {
  const [abaAtiva, setAbaAtiva] = useState<AbaModal>("estrategias");
  const [estrategiaSelecionada, setEstrategiaSelecionada] = useState<EstrategiaTipo>("recomendado");
  const [valorCustomizado, setValorCustomizado] = useState<number>(0);
  const [copiado, setCopiado] = useState(false);

  // Inicializa a seleção com o valor recomendado sempre que uma nova sugestão chegar
  useEffect(() => {
    if (sugestao?.recomendado) {
      setEstrategiaSelecionada("recomendado");
      setValorCustomizado(sugestao.recomendado.valor);
    }
  }, [sugestao]);

  if (!aberto) return null;

  const precoAtualReais = precoAtualCentavos / 100;
  const custoTotalReais = custoTotalCentavos / 100;

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
      case "express":
        return sugestao.express?.valor ?? Math.round(sugestao.recomendado.valor * 1.45 * 100) / 100;
      case "personalizado":
        return valorCustomizado > 0 ? valorCustomizado : sugestao.recomendado.valor;
      default:
        return sugestao.recomendado.valor;
    }
  };

  const valorFinal = obterValorSelecionado();
  const diferencaReais = valorFinal - precoAtualReais;
  const percentualVariacao = precoAtualReais > 0 ? ((diferencaReais / precoAtualReais) * 100) : 0;
  
  // Lucro e margem estimados com base no custo total real
  const lucroEstimadoReais = Math.max(0, valorFinal - custoTotalReais);
  const margemEstimadaPercentual = valorFinal > 0 ? ((lucroEstimadoReais / valorFinal) * 100) : 0;

  const lidarComConfirmacao = () => {
    if (valorFinal > 0) {
      aoAplicarPreco(valorFinal);
      aoFechar();
    }
  };

  const copiarMensagemWhatsApp = () => {
    if (!sugestao?.pitchComercial?.textoWhatsApp) return;
    navigator.clipboard.writeText(sugestao.pitchComercial.textoWhatsApp);
    setCopiado(true);
    toast.success("Proposta comercial copiada para a área de transferência!");
    setTimeout(() => setCopiado(false), 2500);
  };

  const abrirNoWhatsApp = () => {
    if (!sugestao?.pitchComercial?.textoWhatsApp) return;
    const foneLimpo = (clienteTelefone || "").replace(/\D/g, "");
    const urlBase = foneLimpo 
      ? `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(sugestao.pitchComercial.textoWhatsApp)}`
      : `https://wa.me/?text=${encodeURIComponent(sugestao.pitchComercial.textoWhatsApp)}`;
    window.open(urlBase, "_blank", "noopener,noreferrer");
  };

  const score = sugestao?.analiseTecnica?.scoreRisco ?? 3;
  const obterCorScore = (s: number) => {
    if (s <= 3) return { texto: "text-emerald-500", bg: "bg-emerald-500", label: "Baixo Risco" };
    if (s <= 6) return { texto: "text-amber-500", bg: "bg-amber-500", label: "Risco Moderado" };
    if (s <= 8) return { texto: "text-orange-500", bg: "bg-orange-500", label: "Risco Elevado" };
    return { texto: "text-rose-500", bg: "bg-rose-500", label: "Risco Crítico" };
  };
  const corRisco = obterCorScore(score);

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Copilot de Precificação & IA Maker"
      subtitulo="Análise técnica de fatiamento, risco operacional e posicionamento comercial"
      icone={Sparkles}
      larguraMax="max-w-2xl"
    >
      <div className="p-5 flex flex-col gap-4">
        {carregando ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center animate-pulse">
                <Sparkles size={28} className="text-sky-500 animate-spin" />
              </div>
            </div>
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
              Processando inteligência de mercado com Llama 3.2...
            </p>
            <p className="text-[10px] text-zinc-400 max-w-sm text-center">
              Avaliando tempo de máquina, riscos de empenamento, complexidade e calibrando margens líquidas
            </p>
          </div>
        ) : sugestao ? (
          <>
            {/* Resumo Comparativo: Preço Atual vs Proposta IA */}
            <div className="bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-900/90 dark:via-zinc-800/80 dark:to-zinc-900/90 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Preço Calculado Atual
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
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    R$ {valorFinal.toFixed(2).replace('.', ',')}
                  </span>
                  {custoTotalReais > 0 && (
                    <span className="text-[10px] font-bold text-zinc-400">
                      (Lucro: R$ {lucroEstimadoReais.toFixed(2).replace('.', ',')} · {margemEstimadaPercentual.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Abas de Navegação */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-borda-sutil gap-1">
              <button
                type="button"
                onClick={() => setAbaAtiva("estrategias")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  abaAtiva === "estrategias"
                    ? "bg-white dark:bg-zinc-800 text-sky-500 shadow-sm border border-borda-sutil dark:border-white/5"
                    : "text-zinc-500 hover:text-primary dark:hover:text-white"
                }`}
              >
                <TrendingUp size={12} />
                <span>Estratégias de Preço</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva("diagnostico")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  abaAtiva === "diagnostico"
                    ? "bg-white dark:bg-zinc-800 text-amber-500 shadow-sm border border-borda-sutil dark:border-white/5"
                    : "text-zinc-500 hover:text-primary dark:hover:text-white"
                }`}
              >
                <AlertTriangle size={12} />
                <span>Diagnóstico & Risco</span>
                <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full ${corRisco.bg} text-white`}>
                  {score}/10
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva("whatsapp")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  abaAtiva === "whatsapp"
                    ? "bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm border border-borda-sutil dark:border-white/5"
                    : "text-zinc-500 hover:text-primary dark:hover:text-white"
                }`}
              >
                <MessageSquare size={12} />
                <span>Proposta WhatsApp</span>
              </button>
            </div>

            {/* ABA 1: ESTRATÉGIAS DE PREÇO */}
            {abaAtiva === "estrategias" && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {/* 1. PISO */}
                  <button
                    type="button"
                    onClick={() => setEstrategiaSelecionada("piso")}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                      estrategiaSelecionada === "piso"
                        ? "bg-zinc-100 dark:bg-zinc-800/90 border-zinc-400 dark:border-zinc-500 shadow-md ring-1 ring-zinc-400"
                        : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 opacity-85"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                          <ShieldCheck size={13} />
                          <span className="text-[9px] font-black uppercase tracking-wider">Piso / Atacado</span>
                        </div>
                        {estrategiaSelecionada === "piso" && (
                          <div className="w-3.5 h-3.5 rounded-full bg-zinc-600 text-white flex items-center justify-center">
                            <Check size={9} />
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-base font-black text-zinc-800 dark:text-zinc-200">
                        R$ {sugestao.piso.valor.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <p className="text-[8.5px] text-zinc-500 dark:text-zinc-400 leading-tight">
                      {sugestao.piso.justificativa}
                    </p>
                  </button>

                  {/* 2. RECOMENDADO (DESTAQUE) */}
                  <button
                    type="button"
                    onClick={() => setEstrategiaSelecionada("recomendado")}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                      estrategiaSelecionada === "recomendado"
                        ? "bg-gradient-to-b from-sky-500/15 to-blue-500/10 dark:from-sky-500/25 dark:to-blue-500/15 border-sky-500 shadow-lg shadow-sky-500/10 ring-2 ring-sky-500"
                        : "bg-white dark:bg-zinc-900/50 border-sky-500/30 hover:border-sky-500/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                          <Sparkles size={13} />
                          <span className="text-[9px] font-black uppercase tracking-wider">Recomendado</span>
                        </div>
                        <span className="text-[7.5px] font-black uppercase px-1.5 py-0.2 rounded-full bg-sky-500 text-white tracking-widest">
                          IA ✨
                        </span>
                      </div>
                      <div className="mt-1 text-base font-black text-sky-600 dark:text-sky-400">
                        R$ {sugestao.recomendado.valor.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <p className="text-[8.5px] text-zinc-600 dark:text-zinc-300 leading-tight font-medium">
                      {sugestao.recomendado.justificativa}
                    </p>
                  </button>

                  {/* 3. PREMIUM */}
                  <button
                    type="button"
                    onClick={() => setEstrategiaSelecionada("premium")}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                      estrategiaSelecionada === "premium"
                        ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 shadow-md ring-1 ring-amber-500"
                        : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/40 opacity-85"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Crown size={13} />
                          <span className="text-[9px] font-black uppercase tracking-wider">Premium</span>
                        </div>
                        {estrategiaSelecionada === "premium" && (
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                            <Check size={9} />
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-base font-black text-amber-600 dark:text-amber-400">
                        R$ {sugestao.premium.valor.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <p className="text-[8.5px] text-zinc-500 dark:text-zinc-400 leading-tight">
                      {sugestao.premium.justificativa}
                    </p>
                  </button>

                  {/* 4. EXPRESS / URGÊNCIA */}
                  <button
                    type="button"
                    onClick={() => setEstrategiaSelecionada("express")}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                      estrategiaSelecionada === "express"
                        ? "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500 shadow-md ring-1 ring-rose-500"
                        : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/80 hover:border-rose-500/40 opacity-85"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                          <Zap size={13} />
                          <span className="text-[9px] font-black uppercase tracking-wider">Express ⚡</span>
                        </div>
                        {estrategiaSelecionada === "express" && (
                          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center">
                            <Check size={9} />
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-base font-black text-rose-600 dark:text-rose-400">
                        R$ {(sugestao.express?.valor || Math.round(sugestao.recomendado.valor * 1.45 * 100) / 100).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <p className="text-[8.5px] text-zinc-500 dark:text-zinc-400 leading-tight">
                      {sugestao.express?.justificativa || "Taxa de urgência para produção prioritária com entrega imediata."}
                    </p>
                  </button>
                </div>

                {/* Ajuste fino personalizado */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <Sliders size={13} className="text-zinc-400" />
                    <span className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-wider">
                      Deseja ajustar o valor manualmente?
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
              </div>
            )}

            {/* ABA 2: DIAGNÓSTICO & RISCO DE IMPRESSÃO */}
            {abaAtiva === "diagnostico" && (
              <div className="flex flex-col gap-3.5">
                {/* Score de Risco */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-borda-sutil flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Índice de Risco Operacional
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-2xl font-black ${corRisco.texto}`}>
                          {score}/10
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${corRisco.bg} text-white`}>
                          {corRisco.label}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">
                          • Complexidade: {sugestao.analiseTecnica?.nivelComplexidade || "Média"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso do Risco */}
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${corRisco.bg}`}
                      style={{ width: `${Math.min(100, Math.max(10, score * 10))}%` }}
                    />
                  </div>
                </div>

                {/* Alertas Técnicos da Oficina */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Recomendações Práticas da IA para a Produção
                  </span>
                  <div className="flex flex-col gap-2">
                    {(sugestao.analiseTecnica?.alertas || [
                      "Parâmetros de fatiamento padrão atendem aos requisitos da peça.",
                      "Verifique nivelamento de mesa e adesão da primeira camada."
                    ]).map((alerta, idx) => (
                      <div 
                        key={idx}
                        className="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-[10px] text-amber-900 dark:text-amber-200"
                      >
                        <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                        <span className="font-medium leading-tight">{alerta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: PROPOSTA COMERCIAL WHATSAPP */}
            {abaAtiva === "whatsapp" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Texto Persuasivo Pronto para Envio
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copiarMensagemWhatsApp}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiado ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      <span>{copiado ? "Copiado!" : "Copiar Texto"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={abrirNoWhatsApp}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20"
                    >
                      <ExternalLink size={11} />
                      <span>Abrir no WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-borda-sutil font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto custom-scrollbar">
                  {sugestao.pitchComercial?.textoWhatsApp || "Proposta gerada automaticamente com base nos dados do projeto."}
                </div>
              </div>
            )}

            {/* Botões de Ação Principais */}
            <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
              <button
                type="button"
                onClick={lidarComConfirmacao}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Check size={15} />
                <span>Sim, Aplicar R$ {valorFinal.toFixed(2).replace('.', ',')}</span>
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
              <div className="flex justify-center mt-0.5">
                <button
                  type="button"
                  onClick={aoRecalcularIA}
                  className="text-[9px] font-bold text-zinc-400 hover:text-sky-500 flex items-center gap-1 uppercase tracking-wider transition-colors cursor-pointer"
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

