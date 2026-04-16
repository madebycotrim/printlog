import { useState, useRef, useEffect, ElementType } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Opcao {
  valor: string;
  rotulo: string;
}

interface PropriedadesCombobox {
  opcoes: Opcao[];
  valor: string;
  aoAlterar: (valor: string) => void;
  placeholder?: string;
  titulo?: string; // Label do campo
  className?: string;
  permitirNovo?: boolean; // Se true, funciona como um input com sugestões
  icone?: ElementType; // Novo prop para ícone
  aoCriarNovo?: (termo: string) => Promise<string | void>; // Callback de criação
  erro?: string; // Mensagem de erro para paridade com CampoTexto
}

export function Combobox({
  opcoes,
  valor,
  aoAlterar,
  placeholder = "Selecione...",
  titulo,
  className = "",
  permitirNovo = true,
  icone: Icone,
  aoCriarNovo,
  erro,
}: PropriedadesCombobox) {
  const [aberto, definirAberto] = useState(false);
  const [termoBusca, definirTermoBusca] = useState("");
  const [posicao, definirPosicao] = useState({ top: 0, left: 0, width: 0 });
  const [criando, definirCriando] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const lidarComCliqueFora = (event: MouseEvent) => {
      const clickNoContainer = containerRef.current?.contains(event.target as Node);
      const clickNoMenu = menuRef.current?.contains(event.target as Node);

      if (!clickNoContainer && !clickNoMenu) {
        definirAberto(false);
      }
    };
    document.addEventListener("mousedown", lidarComCliqueFora);
    return () => document.removeEventListener("mousedown", lidarComCliqueFora);
  }, []);

  const atualizarPosicao = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      definirPosicao({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (aberto) {
      atualizarPosicao();
      window.addEventListener("scroll", atualizarPosicao, true);
      window.addEventListener("resize", atualizarPosicao);
      return () => {
        window.removeEventListener("scroll", atualizarPosicao, true);
        window.removeEventListener("resize", atualizarPosicao);
      };
    }
  }, [aberto]);

  // Filtra opÃ§Ãµes
  const opcoesFiltradas = opcoes.filter((op) => op.rotulo.toLowerCase().includes(termoBusca.toLowerCase()));

  const selecionarOpcao = async (valorOpcao: string) => {
    if (criando) return;

    const opcaoExiste = opcoes.find((op) => op.valor === valorOpcao);

    if (!opcaoExiste && permitirNovo && aoCriarNovo) {
      try {
        definirCriando(true);
        const novoValor = await aoCriarNovo(valorOpcao);
        aoAlterar(novoValor || valorOpcao);
      } finally {
        definirCriando(false);
      }
    } else {
      aoAlterar(valorOpcao);
    }

    definirAberto(false);
    definirTermoBusca("");
  };

  return (
    <div className={`space-y-2 ${className}`} ref={containerRef}>
      {titulo && (
        <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1 mb-1">
          {titulo}
        </label>
      )}

      <div className="relative group">
        {/* ÍCONE À ESQUERDA (Posicionamento absoluto para paridade com CampoTexto) */}
        {Icone && (
          <Icone
            size={16}
            strokeWidth={2}
            className={`absolute left-0 top-1/2 -translate-y-1/2 transition-colors duration-300 
                ${erro ? "text-red-500" : "text-gray-400 dark:text-zinc-600"}
              `}
          />
        )}

        <div
          className={`
            flex items-center justify-between w-full h-10 bg-transparent border-0 border-b-[3px] outline-none transition-all duration-300 cursor-text gap-2
            ${Icone ? "pl-8" : "pl-0"} 
            ${
              erro
                ? "border-red-500 focus-within:border-red-600"
                : aberto
                  ? "border-gray-300 dark:border-white/20"
                  : "border-gray-100 dark:border-white/10 focus-within:border-gray-300 dark:focus-within:border-white/20"
            }
          `}
          onClick={() => {
            if (!aberto) {
              definirAberto(true);
              if (permitirNovo && valor) {
                const label = opcoes.find((op) => op.valor === valor)?.rotulo || valor;
                definirTermoBusca(label);
              }
            }
          }}
        >
          {aberto ? (
            <input
              autoFocus
              type="text"
              className="bg-transparent border-none outline-none w-full text-gray-900 dark:text-white placeholder-gray-400/50 dark:placeholder:text-zinc-700 font-normal text-sm h-full"
              placeholder={permitirNovo ? placeholder : "Buscar..."}
              value={termoBusca}
              onChange={(e) => {
                definirTermoBusca(e.target.value);
                if (permitirNovo) aoAlterar(e.target.value);
              }}
            />
          ) : (
            <span
              className={`flex-1 truncate text-sm font-normal ${!valor ? "text-gray-400/50 dark:text-zinc-700" : "text-gray-900 dark:text-white"}`}
            >
              {opcoes.find((op) => op.valor === valor)?.rotulo || valor || placeholder}
            </span>
          )}

          <ChevronDown
            size={14}
            className={`text-gray-400 dark:text-zinc-500 shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {erro && (
        <span className="text-[10px] font-bold text-red-500 mt-1 block animate-in fade-in slide-in-from-top-1">
          {erro}
        </span>
      )}

      {createPortal(
        <AnimatePresence>
          {aberto && (
            <motion.div
              ref={menuRef}
              style={{
                position: "absolute",
                top: `${posicao.top}px`,
                left: `${posicao.left}px`,
                width: `${posicao.width}px`,
              }}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 8, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="z-[9999] bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700"
            >
              {opcoesFiltradas.length > 0 ? (
                opcoesFiltradas.map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    onClick={() => selecionarOpcao(opcao.valor)}
                    className={`
                                          w-full text-left px-3 py-2 text-sm flex items-center justify-between
                                          hover:bg-gray-50 dark:hover:bg-white/5 transition-colors
                                          ${valor === opcao.valor ? "text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800" : "text-gray-700 dark:text-zinc-300"}
                                      `}
                  >
                    <span>{opcao.rotulo}</span>
                    {valor === opcao.valor && <Check size={14} />}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-xs text-zinc-500 text-center">
                  {permitirNovo
                    ? termoBusca
                      ? `Usar "${termoBusca}"`
                      : "Digite para criar novo"
                    : "Nenhum resultado encontrado."}
                </div>
              )}

              {/* Se permitir novo e o termo nÃ£o estiver na lista, mostra opÃ§Ã£o explÃ­cita de criar se nÃ£o vazio */}
              {permitirNovo && termoBusca && !opcoesFiltradas.find((op) => op.valor === termoBusca) && (
                <button
                  type="button"
                  disabled={criando}
                  onClick={() => selecionarOpcao(termoBusca)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-t border-gray-100 dark:border-white/5 flex items-center gap-2 disabled:opacity-50"
                >
                  <PlusIconPequeno />
                  {criando ? "Criando..." : `Criar "${termoBusca}"`}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

function PlusIconPequeno() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
