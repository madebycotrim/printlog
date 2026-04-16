import { Pencil, Trash2, History, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";
import { useState, useRef, useEffect } from "react";
import { pluralizar } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesCardMaterial {
  material: Material;
  aoEditar: (material: Material) => void;
  aoExcluir: (id: string) => void;
  aoHistorico: (id: string) => void;
}

export function CardMaterial({ material, aoEditar, aoExcluir, aoHistorico }: PropriedadesCardMaterial) {
  const referenciaCard = useRef<HTMLDivElement>(null);
  const referenciaMenu = useRef<HTMLDivElement>(null);
  const [estaVisivel, definirEstaVisivel] = useState(false);
  const [menuAberto, definirMenuAberto] = useState(false);

  useEffect(() => {
    const clicarFora = (e: MouseEvent) => {
      if (referenciaMenu.current && !referenciaMenu.current.contains(e.target as Node)) {
        definirMenuAberto(false);
      }
    };
    document.addEventListener("mousedown", clicarFora);
    return () => document.removeEventListener("mousedown", clicarFora);
  }, []);

  useEffect(() => {
    const observador = new IntersectionObserver(
      ([entrada]) => {
        definirEstaVisivel(entrada.isIntersecting);
      },
      { rootMargin: "250px" },
    );
    if (referenciaCard.current) {
      observador.observe(referenciaCard.current);
    }
    return () => observador.disconnect();
  }, []);

  const porcentagem = Math.min(100, Math.max(0, (material.pesoRestanteGramas / material.pesoGramas) * 100));

  // Cor da barra de progresso e textos
  let corProgressoTexto = "text-emerald-600 dark:text-emerald-400";

  if (porcentagem < 20) {
    corProgressoTexto = "text-rose-600 dark:text-rose-400";
  } else if (porcentagem < 50) {
    corProgressoTexto = "text-amber-600 dark:text-amber-400";
  }

  const unidade = material.tipo === "FDM" ? "g" : "ml";

  return (
    <div
      ref={referenciaCard}
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-default bg-white dark:bg-card-fundo border border-gray-200 dark:border-white/5"
    >
      {/* Badge Superior Esquerdo (Tipo de Material) */}
      <div className="absolute top-4 left-4 z-20">
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#a1a1aa] bg-gray-50/50 dark:bg-transparent border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-sm dark:shadow-none">
          {material.tipoMaterial}
        </span>
      </div>

      {/* Indicador de Quantidade Fechada (Estoque) */}
      {material.estoque > 0 && (
        <div className="absolute top-4 right-14 bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1 z-20 border border-emerald-500/20 shadow-[0_0_8px_rgba(52,211,153,0.1)]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulse_2s_ease-in-out_infinite]" />+
          {pluralizar(material.estoque, "lacre", "lacres")}
        </div>
      )}

      {/* Ícone 3D Central */}
      <div className="flex flex-col flex-1 items-center justify-center p-6 pt-14 pb-10 relative min-h-[180px]">
        <div className="relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105">
          {!estaVisivel ? (
            <div
              className="w-20 h-20 rounded-full opacity-50 border-4 shadow-inner border-gray-200 dark:border-white/5"
              style={{ backgroundColor: material.cor || "#27272a" }}
            />
          ) : material.tipo === "FDM" ? (
            <Carretel cor={material.cor} tamanho={120} porcentagem={porcentagem} />
          ) : (
            <GarrafaResina cor={material.cor} tamanho={96} porcentagem={porcentagem} />
          )}
        </div>
      </div>

      {/* Ações Rápidas (Sempre visíveis) */}
      <div className="absolute top-4 right-4 z-30" ref={referenciaMenu}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            definirMenuAberto(!menuAberto);
          }}
          className={`p-2 rounded-xl transition-all ${menuAberto ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-400 hover:bg-gray-50 dark:hover:bg-white/5"}`}
        >
          <MoreVertical size={18} />
        </button>

        <AnimatePresence>
          {menuAberto && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    aoHistorico(material.id);
                    definirMenuAberto(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-primaria/10 hover:text-primaria rounded-xl transition-colors group/item uppercase tracking-widest"
                >
                  <History size={14} className="text-gray-400 group-hover/item:text-primaria transition-colors" />
                  GERENCIAR USO
                </button>

                <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    aoEditar(material);
                    definirMenuAberto(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-gray-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors group/item uppercase tracking-widest"
                >
                  <Pencil
                    size={14}
                    className="text-gray-400 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors"
                  />
                  EDITAR
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    aoExcluir(material.id);
                    definirMenuAberto(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors group/item uppercase tracking-widest"
                >
                  <Trash2 size={14} className="text-rose-400 group-hover/item:text-rose-600 transition-colors" />
                  REMOVER
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rodapé: Fabricante | Nome | Quantidade Restante */}
      <div className="px-5 py-5 flex items-end justify-between bg-transparent border-t border-gray-100 dark:border-white/5">
        <div className="flex flex-col min-w-0 pr-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500 mb-1.5 truncate">
            {material.fabricante}
          </span>
          <h4
            className="text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate leading-none"
            title={material.nome}
          >
            {material.nome}
          </h4>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-2">
            {material.pesoRestanteGramas < 200 && <History size={14} className="text-rose-500 animate-pulse" />}
            <span className={`text-[25px] font-black ${corProgressoTexto} leading-none tracking-tighter`}>
              {material.pesoRestanteGramas}
              <span className="text-[14px] opacity-70 ml-[1px]">{unidade}</span>
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-zinc-600 mt-2">
            Restantes
          </span>
        </div>
      </div>
    </div>
  );
}
