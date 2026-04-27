import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Printer,
  Package,
  FolderKanban,
  Users,
  Wallet,
  LogOut,
  Settings,
  X,
  Calculator,
  Layers,
  HelpCircle,
  Beaker,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useState } from "react";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { SeletorEstudio } from "@/funcionalidades/beta/multi_estudos/componentes/SeletorEstudio";
import { usarBeta } from "@/compartilhado/contextos/ContextoBeta";
import { Avatar } from "./Avatar";

type PropriedadesBarraLateral = {
  abertaMobile?: boolean;
  aoFechar?: () => void;
};

type ItemNavegacao = {
  nome: string;
  icone: React.ElementType;
  caminho: string;
  exato?: boolean;
  beta?: boolean;
};

type GrupoNavegacao = {
  titulo: string;
  itens: ItemNavegacao[];
};

export function BarraLateral({ abertaMobile = false, aoFechar }: PropriedadesBarraLateral) {
  const localizacao = useLocation();
  const { usuario, sair } = usarAutenticacao();
  const { participarPrototipos, betaMultiEstudio, resetarTudo } = usarBeta();
  
  // Estado de colapso da Barra Lateral (Desktop)
  const [colapsada, setColapsada] = useState(false);

  const lidarComSair = async () => {
    try {
      await sair();
      window.location.href = "/";
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "BarraLateral" }, "Erro ao realizar logout", erro);
    }
  };

  const grupos: GrupoNavegacao[] = [
    {
      titulo: "Geral",
      itens: [
        { nome: "Dashboard", icone: LayoutDashboard, caminho: "/dashboard", exato: true },
        { nome: "Calculadora", icone: Calculator, caminho: "/calculadora" },
      ],
    },
    {
      titulo: "Produção",
      itens: [
        { nome: "Projetos", icone: FolderKanban, caminho: "/projetos" },
        { nome: "Impressoras", icone: Printer, caminho: "/impressoras" },
        { nome: "Materiais", icone: Package, caminho: "/materiais" },
        { nome: "Insumos", icone: Layers, caminho: "/insumos" },
      ],
    },
    {
      titulo: "Comercial",
      itens: [
        { nome: "Clientes", icone: Users, caminho: "/clientes" },
        { nome: "Financeiro", icone: Wallet, caminho: "/financeiro" },
      ],
    },
    {
      titulo: "Sistema",
      itens: [
        { nome: "Configurações", icone: Settings, caminho: "/configuracoes" },
        { nome: "Central Maker", icone: HelpCircle, caminho: "/central-maker" },
      ],
    },
  ];

  function itemAtivo(caminho: string, exato?: boolean) {
    return exato ? localizacao.pathname === caminho : localizacao.pathname.startsWith(caminho);
  }

  const classesContainer = `
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-white dark:bg-[var(--bg-sidebar)]
        border-r border-gray-100 dark:border-[var(--border-subtle)]
        transition-all duration-300 ease-in-out md:translate-x-0
        ${abertaMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        md:static md:shadow-none
        ${colapsada ? "w-20" : "w-64"}
    `;

  return (
    <>
      {abertaMobile && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={aoFechar} />}

      <aside className={classesContainer}>
        {/* Grade de Design (Background) */}
        <div
          className="absolute inset-0 pointer-events-none z-[1] opacity-[0.03] dark:opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, var(--text-muted) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            maskImage: "linear-gradient(to bottom, black 10%, transparent 90%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 10%, transparent 90%)",
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo Section */}
          <div className={`h-24 flex items-center gap-3 ${colapsada ? "justify-center px-0 flex-col py-4" : "px-6"}`}>
            <div className="relative group shrink-0">
              <div className="absolute -inset-1.5 bg-primaria/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <img src="/logo-colorida.png" alt="PrintLog" className="relative w-9 h-9 object-contain" />
            </div>

            {!colapsada && (
              <div className="flex flex-col justify-center transition-all duration-300">
                <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                  PRINTLOG
                </span>
                <span className="text-[10px] font-bold text-primaria tracking-[0.3em] uppercase">Studio</span>
              </div>
            )}

            {aoFechar ? (
              <button onClick={aoFechar} className="md:hidden ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            ) : (
              <button 
                onClick={() => setColapsada(!colapsada)} 
                className={`hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-sky-500 hover:bg-gray-100/50 dark:hover:bg-white/[0.04] transition-all ml-auto ${colapsada ? "mt-2 ml-0" : ""}`}
                title={colapsada ? "Expandir menu" : "Recolher menu"}
              >
                {colapsada ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            )}
          </div>

          {betaMultiEstudio && !colapsada && (
            <div className="px-4 mb-4">
              <SeletorEstudio />
            </div>
          )}

          {/* Navegação Principal */}
          <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-7 custom-scrollbar overflow-x-hidden">
            {grupos.map((grupo) => (
              <div key={grupo.titulo} className="space-y-1.5">
                <div className={`flex items-center gap-3 px-4 mb-3 mt-4 first:mt-0 ${colapsada ? "justify-center px-0" : ""}`}>
                  {!colapsada && (
                    <h3 className="text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap">
                      {grupo.titulo}
                    </h3>
                  )}
                  {/* Linha Divisória de Categoria */}
                  {!colapsada ? (
                    <div className="flex-1 flex items-center h-[1px] bg-gradient-to-r from-gray-200 via-gray-200/50 to-transparent dark:from-white/[0.12] dark:via-white/[0.05] dark:to-transparent">
                      <div className="w-[3px] h-[3px] rounded-full bg-gray-300 dark:bg-zinc-600 -ml-[1px]" />
                    </div>
                  ) : (
                    <div className="w-6 h-[2px] rounded-full bg-gray-200/50 dark:bg-white/5" />
                  )}
                </div>
                
                <div className="space-y-1">
                  {grupo.itens.map((item) => {
                    const ativo = itemAtivo(item.caminho, item.exato);
                    return (
                      <Link
                        key={item.caminho}
                        to={item.caminho}
                        title={colapsada ? item.nome : undefined}
                        onClick={() => aoFechar?.()}
                        className={`
                          group flex items-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden
                          ${colapsada ? "justify-center px-0 mx-1" : "px-4"}
                          ${ativo 
                            ? "text-primaria bg-gradient-to-r from-primaria/10 to-transparent dark:from-primaria/5 dark:to-transparent backdrop-blur-md shadow-[inset_1px_1px_1px_rgba(255,255,255,0.05)]" 
                            : "text-gray-500 dark:text-[var(--text-secondary)] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/[0.02]"}
                        `}
                      >
                        {/* Indicador de Profundidade 3D (Borda Brilhante) */}
                        {ativo && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-primaria rounded-full shadow-[0_0_8px_rgba(var(--cor-primaria-rgb),0.5)]" />
                        )}

                        <div className={`flex items-center justify-center transition-transform duration-300 shrink-0 ${ativo ? "" : "group-hover:scale-110 group-hover:-translate-y-0.5"}`}>
                          <item.icone
                            size={colapsada ? 20 : 18}
                            strokeWidth={ativo ? 2.5 : 2}
                            className={`transition-colors ${ativo ? "text-primaria" : "text-gray-400 dark:text-zinc-600 group-hover:text-primaria"}`}
                          />
                        </div>

                        {!colapsada && (
                          <span className="flex-1 leading-none truncate">{item.nome}</span>
                        )}

                        {!colapsada && item.beta && (
                          <div className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-500 uppercase tracking-tighter animate-pulse shrink-0">
                            Lab
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            {participarPrototipos && !colapsada && (
              <div className="pt-4 border-t border-dashed border-gray-100 dark:border-white/5 space-y-3 mx-2">
                <div className="flex items-center gap-2 px-2">
                  <Beaker size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Labs Center</span>
                </div>
                <button
                  onClick={() => resetarTudo()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-white/[0.02] border border-transparent hover:border-red-500/20 transition-all"
                >
                  Ocultar Beta
                </button>
              </div>
            )}
          </nav>

          {/* User Profile - Rodapé Premium */}
          <div className={`relative mt-auto ${colapsada ? "p-3 pb-5" : "p-4"}`}>
            {/* Elegant Faded Separator */}
            <div className={`absolute top-0 h-[1px] bg-gradient-to-r from-transparent via-gray-100 dark:via-white/10 to-transparent ${colapsada ? "left-2 right-2" : "left-6 right-6"}`} />
            
            <div className={`flex items-center gap-3 p-2 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] transition-all group overflow-hidden ${colapsada ? "justify-center p-1.5 bg-transparent" : "hover:bg-gray-100 dark:hover:bg-white/[0.04]"}`}>
              <div title={colapsada ? "Sair da plataforma" : undefined} onClick={colapsada ? lidarComSair : undefined} className={colapsada ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}>
                 <Avatar 
                   nome={usuario?.nome} 
                   fotoUrl={usuario?.fotoUrl} 
                   tamanho={colapsada ? "h-10 w-10" : "h-9 w-9"}
                   pro={usuario?.plano === "PRO"}
                 />
              </div>
              
              {!colapsada && (
                <>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-xs font-black text-gray-900 dark:text-white truncate leading-tight mb-0.5">
                      {usuario?.nome?.split(" ")[0] || "Usuário"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {usuario?.plano === "PRO" ? (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-[8px] font-black text-sky-400 uppercase tracking-widest leading-none shadow-[0_0_10px_rgba(14,165,233,0.15)] group-hover:scale-105 transition-transform">
                          <Crown size={8} className="fill-sky-400" />
                          Maker Fundador
                        </div>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-primaria/10 dark:bg-primaria/20 text-[8px] font-black text-primaria uppercase tracking-widest leading-none border border-primaria/20">
                          Maker
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={lidarComSair}
                    title="Sair"
                    className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <LogOut size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
