import { useState, useEffect } from "react";
import { Menu, Search, Beaker, AlertTriangle, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { MenuNotificacoes } from "./MenuNotificacoes";
import { useProcessadorNotificacoes } from "../hooks/useProcessadorNotificacoes";
import { useBeta } from "@/compartilhado/contextos/ContextoBeta";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { SeloPlano } from "./ui";

type PropriedadesCabecalho = {
  aoAbrirBarraLateral: () => void;
};

export function Cabecalho({ aoAbrirBarraLateral }: PropriedadesCabecalho) {
  const { dados } = useCabecalho();
  const { participarPrototipos } = useBeta();
  const { usuario } = useAutenticacao();
  const { vencimentoPlano, plano } = useArmazemConfiguracoes();
  const localizacao = useLocation();

  // Rotas onde o selo de elite deve aparecer
  const rotasElite = ["/dashboard", "/configuracoes", "/central-maker"];
  const exibirSeloElite = rotasElite.some(rota => localizacao.pathname.startsWith(rota));

  // Inicializa o processador de notificações globais (pedidos atrasados, manutenção, etc.)
  useProcessadorNotificacoes();

  const [termoBusca, setTermoBusca] = useState("");

  // Reseta a busca local se a página mudar o callback de busca
  useEffect(() => {
    setTermoBusca("");
  }, [dados.aoBuscar]);

  // Aplica o debounce de 300ms para evitar chamadas de filtro excessivas
  useEffect(() => {
    if (!dados.aoBuscar) return;
    const temporizador = setTimeout(() => {
      dados.aoBuscar!(termoBusca);
    }, 300);

    return () => clearTimeout(temporizador);
  }, [termoBusca, dados.aoBuscar]);

  // Verificação de expiração
  const estaExpirado = () => {
    if (plano !== "PRO" || !vencimentoPlano) return false;
    return new Date(vencimentoPlano) < new Date();
  };

  const vencido = estaExpirado();

  return (
    <>
      {vencido && (
        <div className="bg-red-500 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2">
          <AlertTriangle size={14} />
          <span>SEU PLANO PRO ESTÁ EXPIRADO. ENTRE EM CONTATO COM O SUPORTE PARA RENOVAR E EVITAR O BLOQUEIO DA CONTA.</span>
        </div>
      )}
      <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 md:px-12 py-2 md:py-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-b border-borda-sutil transition-all duration-300 shadow-sm dark:shadow-[0_1px_0_rgba(255,255,255,0.02)]">
        {/* Esquerda: Menu Mobile + Título */}
        <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 shrink">
          <button
            onClick={aoAbrirBarraLateral}
            aria-label="Abrir menu de navegação"
            className="md:hidden p-1.5 -ml-1 text-zinc-500 hover:text-primary dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors touch-target shrink-0"
          >
            <Menu size={20} strokeWidth={2} />
          </button>

          {/* Aesthetic: Minimalista. Tipografia marcante com ajuste responsivo. */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <h1 className="text-sm xs:text-base sm:text-xl md:text-[28px] font-black tracking-tight text-primary dark:text-white truncate leading-tight">
                {dados.titulo}
              </h1>

              {participarPrototipos && (
                <div className="hidden xs:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] shrink-0">
                  <Beaker size={10} className="animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Lab</span>
                </div>
              )}

              {exibirSeloElite && (
                <SeloPlano plano={usuario?.plano} className="hidden sm:inline-flex transform hover:scale-105 transition-transform cursor-default shrink-0" />
              )}

              <div
                className="hidden md:block w-1.5 h-1.5 rounded-full mb-0.5 shrink-0"
                style={{ backgroundColor: "var(--cor-primaria)" }}
              ></div>
            </div>
            {dados.subtitulo && (
              <p className="text-xs md:text-sm font-medium text-zinc-500 hidden md:block truncate mt-0.5">
                {dados.subtitulo}
              </p>
            )}
          </div>
        </div>

        {/* Direita: Busca + Ações */}
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-4 md:gap-8 justify-end shrink-0 ml-1">
          {/* Input de Busca - Expansível no Mobile */}
          {!dados.ocultarBusca && (
            <div className="relative group w-16 xs:w-24 sm:w-48 md:w-64 focus-within:w-32 xs:focus-within:w-40 sm:focus-within:w-64 transition-all duration-300">
              <Search
                className="absolute z-10 left-0 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-primary dark:group-focus-within:text-white transition-colors pointer-events-none"
                size={14}
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder={dados.placeholderBusca || "BUSCAR..."}
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full h-8 md:h-10 pl-4 md:pl-8 pr-5 bg-transparent border-0 border-b-2 border-zinc-100 dark:border-white/10 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-primary dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-primary dark:focus:border-white"
              />
              {termoBusca && (
                <button
                  onClick={() => {
                    setTermoBusca("");
                    dados.aoBuscar?.("");
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-full transition-colors"
                  aria-label="Limpar busca"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}

          {!dados.ocultarNotificacoes && <MenuNotificacoes />}

          {/* Elementos Customizados da Página (Injetados via Contexto) */}
          {dados.elementoAcao && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
              {(dados.acao || dados.segundaAcao) && (
                <div className="hidden lg:block w-px h-8 bg-borda-sutil mx-1" />
              )}
              {dados.elementoAcao}
            </div>
          )}

          {/* Ações Padronizadas */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {dados.segundaAcao && (
              <button
                onClick={dados.segundaAcao.aoClicar}
                disabled={dados.segundaAcao.desabilitado}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl font-bold text-xs md:text-sm active:scale-95 transition-all duration-200 shrink-0 ${
                  dados.segundaAcao.desabilitado
                    ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                }`}
              >
                {dados.segundaAcao.icone && (
                  <dados.segundaAcao.icone size={15} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />
                )}
                <span className="hidden sm:inline">{dados.segundaAcao.texto}</span>
                <span className="sm:hidden text-[11px]">{dados.segundaAcao.texto.split(" ")[0]}</span>
              </button>
            )}

            {dados.acao && (
              <button
                onClick={dados.acao.aoClicar}
                disabled={dados.acao.desabilitado}
                className={`flex items-center justify-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl font-bold text-xs md:text-sm active:scale-95 transition-all duration-200 shrink-0 ${
                  dados.acao.desabilitado
                    ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-zinc-600 cursor-not-allowed opacity-70"
                    : "text-white hover:brightness-110"
                }`}
                style={
                  !dados.acao.desabilitado
                    ? { backgroundColor: "var(--cor-primaria)", boxShadow: "var(--sombra-primaria)" }
                    : {}
                }
              >
                {dados.acao.icone && <dados.acao.icone size={15} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />}
                <span className="hidden sm:inline">{dados.acao.texto}</span>
                <span className="sm:hidden text-[11px]">{dados.acao.texto.split(" ")[0]}</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
