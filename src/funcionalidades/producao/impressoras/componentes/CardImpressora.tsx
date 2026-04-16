import { MoreVertical, Edit2, Archive, Wrench, Activity, CheckCircle2, PlayCircle } from "lucide-react";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  calcularPercentualVidaUtil,
  obterStatusManutencao,
  obterCorStatusManutencao,
} from "../utilitarios/utilitariosManutencao";
import { StatusImpressora } from "@/compartilhado/tipos/modelos";

interface PropriedadesCardImpressora {
  impressora: Impressora;
  aoEditar: (impressora: Impressora) => void;
  aoAposentar: (impressora: Impressora) => void;
  aoDetalhes?: (impressora: Impressora) => void;
  aoManutencoes?: (impressora: Impressora) => void;
}

export function CardImpressora({
  impressora,
  aoEditar,
  aoAposentar,
  aoDetalhes,
  aoManutencoes,
}: PropriedadesCardImpressora) {
  const [menuAberto, definirMenuAberto] = useState(false);
  const referenciaMenu = useRef<HTMLDivElement>(null);
  const fecharMenu = useCallback(() => definirMenuAberto(false), []);

  useEffect(() => {
    const lidarComCliqueFora = (e: MouseEvent) => {
      if (referenciaMenu.current && !referenciaMenu.current.contains(e.target as Node)) fecharMenu();
    };
    const lidarComTeclaEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") fecharMenu();
    };
    if (menuAberto) {
      document.addEventListener("mousedown", lidarComCliqueFora);
      document.addEventListener("keydown", lidarComTeclaEsc);
    }
    return () => {
      document.removeEventListener("mousedown", lidarComCliqueFora);
      document.removeEventListener("keydown", lidarComTeclaEsc);
    };
  }, [menuAberto, fecharMenu]);

  const statusImpressora = impressora.status as StatusImpressora;
  const estaImprimindo = statusImpressora === StatusImpressora.IMPRIMINDO;

  // Lógica de Manutenção Preventiva
  const percentualVidaUtil = calcularPercentualVidaUtil(
    impressora.horimetroTotalMinutos || 0,
    impressora.intervaloRevisaoMinutos || 0,
  );
  const statusManutencaoUI = obterStatusManutencao(
    impressora.horimetroTotalMinutos || 0,
    impressora.intervaloRevisaoMinutos || 0,
  );
  const coresManutencao = obterCorStatusManutencao(statusManutencaoUI);

  // Configuração Visual baseada no Status
  const configStatus = useMemo(() => {
    switch (statusImpressora) {
      case StatusImpressora.IMPRIMINDO:
        return {
          cor: "#10b981",
          icone: PlayCircle,
          label: "Imprimindo",
          bg: "bg-emerald-500/10",
          texto: "text-emerald-500",
        };
      case StatusImpressora.MANUTENCAO:
        return { cor: "#f59e0b", icone: Wrench, label: "Manutenção", bg: "bg-amber-500/10", texto: "text-amber-500" };
      case StatusImpressora.LIVRE:
      default:
        return { cor: "#3b82f6", icone: CheckCircle2, label: "Livre", bg: "bg-sky-500/10", texto: "text-sky-500" };
    }
  }, [statusImpressora]);

  // Cor base do card respeita o status operacional OU o alerta de manutenção crítico
  const corDestaque = statusManutencaoUI === "critico" ? "#f43f5e" : configStatus.cor;

  const subtitulo = [impressora.marca].filter(Boolean).join(" | ") || impressora.tecnologia;
  const horasUsadas = Math.floor((impressora.horimetroTotalMinutos || 0) / 60);

  return (
    <motion.div
      layout
      onClick={() => aoDetalhes?.(impressora)}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative flex flex-col h-full rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] cursor-pointer bg-white dark:bg-card border border-gray-100 dark:border-white/5"
    >
      {/* Glossy Reflection Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/[0.02] dark:to-transparent pointer-events-none z-10" />

      {/* Badges Superiores */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 ${configStatus.bg} ${configStatus.texto} shadow-sm backdrop-blur-md`}
        >
          <configStatus.icone size={14} strokeWidth={3} className={estaImprimindo ? "animate-spin-slow" : ""} />
          <span className="text-[9px] font-black uppercase tracking-widest">{configStatus.label}</span>
        </div>
      </div>

      {/* Menu Contextual Premium */}
      <div className="absolute top-5 right-5 z-30" ref={referenciaMenu}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            definirMenuAberto(!menuAberto);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${menuAberto ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white" : "opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-white/5"}`}
        >
          <MoreVertical size={18} />
        </button>

        <AnimatePresence>
          {menuAberto && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#18181b]/95 border border-gray-100 dark:border-white/10 rounded-[1.5rem] shadow-2xl z-40 overflow-hidden origin-top-right backdrop-blur-xl"
            >
              <div className="p-2 space-y-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (aoManutencoes) aoManutencoes(impressora);
                    fecharMenu();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-600 dark:text-zinc-300 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 rounded-2xl transition-all group/item uppercase tracking-widest"
                >
                  <Wrench size={16} className="text-gray-400 group-hover/item:text-amber-500 transition-colors" />
                  Manutenções
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    aoEditar(impressora);
                    fecharMenu();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white rounded-2xl transition-all group/item uppercase tracking-widest"
                >
                  <Edit2
                    size={16}
                    className="text-gray-400 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors"
                  />
                  Editar Setup
                </button>

                <div className="h-px bg-gray-100 dark:bg-white/5 my-1 mx-2" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    aoAposentar(impressora);
                    fecharMenu();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-rose-600 hover:bg-rose-500/10 rounded-2xl transition-all group/item uppercase tracking-widest"
                >
                  <Archive size={16} className="text-rose-400 group-hover/item:text-rose-600 transition-colors" />
                  Aposentar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Imagem Central e Glow Dinâmico */}
      <div className="flex flex-col flex-1 items-center justify-center p-8 pt-20 pb-10 relative min-h-[200px]">
        <div
          className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[50px] dark:blur-[80px] z-0 pointer-events-none opacity-[0.25] dark:opacity-20 transition-all duration-1000 group-hover:scale-125"
          style={{ backgroundColor: corDestaque }}
        />

        <div className="relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-2 h-full flex items-center justify-center">
          {impressora.imagemUrl ? (
            <img
              src={impressora.imagemUrl}
              alt={impressora.nome}
              className="max-h-[180px] max-w-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <div className="w-24 h-24 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center bg-gray-50 dark:bg-white/5">
              <Activity size={32} className="text-gray-300 dark:text-white/10 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Rodapé e Métricas */}
      <div className="p-8 bg-gray-50/30 dark:bg-black/20 backdrop-blur-sm border-t border-gray-100 dark:border-white/5 relative z-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col min-w-0 pr-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500 mb-1.5 truncate">
              {subtitulo}
            </span>
            <div className="flex items-center gap-2">
              <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter truncate leading-none uppercase">
                {impressora.nome}
              </h4>
              {statusManutencaoUI === "critico" && (
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Atenção Crítica" />
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white flex items-baseline justify-end gap-1">
              {horasUsadas}
              <span className="text-xs font-bold text-gray-400 dark:text-zinc-600 uppercase">hrs</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-600">
              Total Operacional
            </span>
          </div>
        </div>

        {/* Progress Bar de Manutenção */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500 flex items-center gap-2">
              <Activity size={10} /> Vida Útil Sistema
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest ${coresManutencao.text}`}>
              {Math.round(percentualVidaUtil)}%
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-white/5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentualVidaUtil}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className={`h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] ${coresManutencao.bg}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
