import { Menu, Search } from "lucide-react";
import { usarCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { MenuNotificacoes } from "./MenuNotificacoes";
import { usarProcessadorNotificacoes } from "../hooks/usarProcessadorNotificacoes";
import { usarBeta } from "@/compartilhado/contextos/ContextoBeta";
import { Beaker } from "lucide-react";

type PropriedadesCabecalho = {
  aoAbrirBarraLateral: () => void;
};

export function Cabecalho({ aoAbrirBarraLateral }: PropriedadesCabecalho) {
  const { dados } = usarCabecalho();
  const { participarPrototipos } = usarBeta();

  // Inicializa o processador de notificações globais (pedidos atrasados, manutenção, etc.)
  usarProcessadorNotificacoes();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-12 h-20 md:h-24 bg-white/80 dark:bg-[#0e0e11]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-all duration-300">
      {/* Esquerda: Menu Mobile + TÃ­tulo */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={aoAbrirBarraLateral}
          className="md:hidden p-2 -ml-2 text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu size={24} strokeWidth={2} />
        </button>

        {/* Aesthetic: Minimalista. Sem barras glowing, apenas tipografia marcante. */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-[28px] font-black tracking-tight text-gray-900 dark:text-white truncate">
              {dados.titulo}
            </h1>

            {participarPrototipos && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 animate-in fade-in zoom-in duration-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                <Beaker size={10} className="animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Lab</span>
              </div>
            )}

            <div
              className="hidden md:block w-1.5 h-1.5 rounded-full mb-0.5 shrink-0"
              style={{ backgroundColor: "var(--cor-primaria)" }}
            ></div>
          </div>
          {dados.subtitulo && (
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-500 hidden md:block truncate mt-0.5">
              {dados.subtitulo}
            </p>
          )}
        </div>
      </div>

      {/* Direita: Busca + AÃ§Ãµes */}
      <div className="flex items-center gap-4 md:gap-8 justify-end flex-wrap sm:flex-nowrap">
        {/* Input de Busca - Linha Adaptável, oculto quando a página solicita */}
        {!dados.ocultarBusca && (
          <div className="relative group w-auto md:w-64 max-w-[280px]">
            <Search
              className="absolute z-10 left-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors pointer-events-none"
              size={18}
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder={dados.placeholderBusca || "Pesquisar..."}
              onChange={(e) => dados.aoBuscar && dados.aoBuscar(e.target.value)}
              className="w-full h-10 pl-8 pr-2 bg-transparent border-0 border-b-2 border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-zinc-800 dark:focus:border-white"
            />
          </div>
        )}

        <MenuNotificacoes />

        {/* Ações Padronizadas */}
        <div className="flex items-center gap-2 md:gap-3">
          {dados.segundaAcao && (
            <button
              onClick={dados.segundaAcao.aoClicar}
              disabled={dados.segundaAcao.desabilitado}
              className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm active:scale-95 transition-all duration-200 shrink-0 ${
                dados.segundaAcao.desabilitado
                  ? "text-gray-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              }`}
            >
              {dados.segundaAcao.icone && (
                <dados.segundaAcao.icone size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />
              )}
              <span className="hidden sm:inline">{dados.segundaAcao.texto}</span>
              <span className="sm:hidden">{dados.segundaAcao.texto.split(" ")[0]}</span>
            </button>
          )}

          {dados.acao && (
            <button
              onClick={dados.acao.aoClicar}
              disabled={dados.acao.desabilitado}
              className={`flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm active:scale-95 transition-all duration-200 shadow-sm shrink-0 ${
                dados.acao.desabilitado
                  ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-zinc-600 cursor-not-allowed opacity-70"
                  : "text-white hover:brightness-110 shadow-lg"
              }`}
              style={
                !dados.acao.desabilitado
                  ? { backgroundColor: "var(--cor-primaria)", boxShadow: "var(--sombra-primaria)" }
                  : {}
              }
            >
              {dados.acao.icone && <dados.acao.icone size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px]" />}
              <span className="hidden sm:inline">{dados.acao.texto}</span>
              <span className="sm:hidden">{dados.acao.texto.split(" ")[0]}</span>
            </button>
          )}
        </div>

        {/* Fallback para elementos customizados (Legado) */}
        {!dados.acao && dados.elementoAcao && <div className="flex items-center">{dados.elementoAcao}</div>}
      </div>
    </header>
  );
}
