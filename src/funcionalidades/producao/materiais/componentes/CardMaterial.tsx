import { Pencil, Trash2, History, MoreVertical, Scale, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";
import { useState, useRef, useEffect } from "react";
import { pluralizar, centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesCardMaterial {
  material: Material;
  aoEditar: (material: Material) => void;
  aoExcluir: (material: Material) => void;
  aoHistorico: (material: Material, abaInicial?: "extrato" | "novo") => void;
  aoAlternarFavorito: (id: string) => void;
}

export function CardMaterial({ material, aoEditar, aoExcluir, aoHistorico, aoAlternarFavorito }: PropriedadesCardMaterial) {
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
      className="group relative flex flex-col h-full rounded-2xl transition-all duration-700 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] cursor-default bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/[0.04]"
    >
      {/* Camada de Clipping para o Fundo e Imagem */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" />

      {/* Badge Superior Esquerdo (Tipo de Material) */}
      <div className="absolute top-4 left-4 z-20">
        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#a1a1aa] bg-gray-50/50 dark:bg-transparent border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-sm dark:shadow-none">
          {material.tipoMaterial}
        </span>
      </div>

      {/* Indicador de Quantidade Fechada (Estoque) */}
      {material.estoque > 0 && (
        <div className="absolute top-4 right-[90px] bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1 z-20 border border-emerald-500/20 shadow-[0_0_8px_rgba(52,211,153,0.1)]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulse_2s_ease-in-out_infinite]" />+
          {pluralizar(material.estoque, "lacre", "lacres")}
        </div>
      )}

      {/* Ícone 3D Central com Glow Dinâmico */}
      <div className="flex flex-col flex-1 items-center justify-center p-6 pt-14 pb-10 relative min-h-[180px]">
        <motion.div 
          animate={{ filter: [`drop-shadow(0 10px 20px ${material.cor}00)`, `drop-shadow(0 10px 30px ${material.cor}33)`, `drop-shadow(0 10px 20px ${material.cor}00)`] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 transition-transform duration-500 group-hover:scale-105"
        >
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
        </motion.div>
      </div>

      {/* Ações Rápidas (Sempre visíveis) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5" ref={referenciaMenu}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            aoAlternarFavorito(material.id);
          }}
          title={material.favorito ? "Remover dos favoritos" : "Marcar como favorito"}
          className={`p-2 rounded-xl transition-all border ${
            material.favorito 
              ? "text-amber-500 bg-amber-500/10 border-amber-500/20" 
              : "text-zinc-400 hover:bg-amber-500/10 hover:text-amber-500 border-transparent hover:border-amber-500/20"
          }`}
        >
          <Star size={18} fill={material.favorito ? "currentColor" : "none"} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            aoHistorico(material, "novo");
          }}
          title="Registrar consumo (balança)"
          className="p-2 rounded-xl text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-500/20"
        >
          <Scale size={18} />
        </button>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              definirMenuAberto(!menuAberto);
            }}
            className={`p-2 rounded-xl transition-all ${menuAberto ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-400 hover:bg-gray-50 dark:hover:bg-white/5"}`}
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {menuAberto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-1.5"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    aoHistorico(material);
                    definirMenuAberto(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-all uppercase tracking-widest"
                >
                  <History size={14} />
                  Ver Histórico
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    aoEditar(material);
                    definirMenuAberto(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white rounded-xl transition-all uppercase tracking-widest"
                >
                  <Pencil size={14} />
                  Editar Cadastro
                </button>

                <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    aoExcluir(material);
                    definirMenuAberto(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all uppercase tracking-widest"
                >
                  <Trash2 size={14} />
                  Excluir Insumo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rodapé: Organização Profissional */}
      <div className="px-5 py-5 flex flex-col bg-transparent border-t border-gray-100 dark:border-white/[0.04]">
        {/* Linha 1: Fabricante e Peso Principal */}
        <div className="flex items-start justify-between mb-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-600 truncate mr-2">
            {material.fabricante}
          </span>
          <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-700">
             <span className="text-[8px] font-black uppercase tracking-widest">Peso Atual</span>
          </div>
        </div>

        {/* Linha 2: Nome e Peso Gigante */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col min-w-0 pr-4">
            <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight truncate uppercase leading-none">
              {material.nome}
            </h4>
          </div>

          <div className="flex items-baseline gap-1 shrink-0">
            {material.pesoRestanteGramas < 200 && <History size={14} className="text-rose-500 animate-pulse mr-1" />}
            <span className={`text-2xl font-black ${corProgressoTexto} leading-none tracking-tighter tabular-nums`}>
              {material.pesoRestanteGramas}
            </span>
            <span className="text-[10px] font-black opacity-30 dark:opacity-20 uppercase">{unidade}</span>
          </div>
        </div>

        {/* Linha 3: Métricas de Valor */}
        <div className="space-y-3 mt-auto">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest leading-none">
             <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-600">
               <span className="text-[7px] tracking-[0.2em]">Valor Restante</span>
             </div>
             
             <div className="flex items-center whitespace-nowrap">
               <span className="text-zinc-900 dark:text-zinc-300 tracking-tighter tabular-nums font-black">
                 {centavosParaReais((material.precoCentavos * material.pesoRestanteGramas) / material.pesoGramas)}
               </span>
             </div>
          </div>
          
          <div className="relative">
            <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${porcentagem}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full relative z-10 ${porcentagem < 20 ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' : porcentagem < 50 ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'}`}
              />
            </div>
            {/* Porcentagem Estratégica Abaixo da Barra */}
            <div className="flex justify-end mt-1.5">
               <span className={`text-[9px] font-black ${corProgressoTexto} opacity-80 uppercase tracking-tighter`}>
                 {Math.round(porcentagem)}% DISPONÍVEL
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
