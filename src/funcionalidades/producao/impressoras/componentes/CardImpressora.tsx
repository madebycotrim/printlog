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

  // Lógica de Saúde do Sistema (Reversa da Vida Útil)
  const saudeSistema = 100 - calcularPercentualVidaUtil(
    impressora.horimetroTotalMinutos || 0,
    impressora.intervaloRevisaoMinutos || 0,
  );
  
  const statusManutencaoUI = obterStatusManutencao(
    impressora.horimetroTotalMinutos || 0,
    impressora.intervaloRevisaoMinutos || 0,
  );
  const coresManutencao = obterCorStatusManutencao(statusManutencaoUI);

  const configStatus = useMemo(() => {
    switch (statusImpressora) {
      case StatusImpressora.IMPRIMINDO:
        return {
          cor: "#10b981",
          icone: PlayCircle,
          label: "Imprimindo",
          sub: "Job em progresso...",
          bg: "bg-emerald-500",
          texto: "text-emerald-500",
        };
      case StatusImpressora.MANUTENCAO:
        return { 
          cor: "#f59e0b", 
          icone: Wrench, 
          label: "Manutenção", 
          sub: "Indisponível",
          bg: "bg-amber-500",
          texto: "text-amber-500",
        };
      case StatusImpressora.LIVRE:
      default:
        return { 
          cor: "#3b82f6", 
          icone: CheckCircle2, 
          label: "Disponível", 
          sub: "Pronta",
          bg: "bg-sky-500",
          texto: "text-sky-500",
        };
    }
  }, [statusImpressora]);

  const corDestaque = statusManutencaoUI === "critico" ? "#f43f5e" : configStatus.cor;
  const horasUsadas = Math.floor((impressora.horimetroTotalMinutos || 0) / 60);

  return (
    <motion.div
      layout
      onClick={() => aoDetalhes?.(impressora)}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative flex flex-col h-full rounded-[2.5rem] bg-white dark:bg-[#0c0c0e] border border-zinc-100 dark:border-white/5 overflow-hidden transition-all duration-300 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] cursor-pointer"
    >
      {/* ═══════ CABEÇALHO DE IDENTIDADE ═══════ */}
      <div className="p-8 pb-4 flex justify-between items-start relative z-20">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
            {impressora.marca || "Industrial"} // {impressora.tecnologia}
          </span>
          <h4 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none uppercase">
            {impressora.nome}
          </h4>
        </div>
        
        <div className="flex items-center gap-3" ref={referenciaMenu}>
          <div className={`w-2.5 h-2.5 rounded-full ${statusManutencaoUI === "critico" ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 opacity-20'}`} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              definirMenuAberto(!menuAberto);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 text-zinc-400 hover:text-indigo-500 transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          
          <AnimatePresence>
            {menuAberto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-8 top-20 w-56 bg-white dark:bg-[#161618] border border-zinc-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-1.5 backdrop-blur-xl"
              >
                <button onClick={(e) => { e.stopPropagation(); aoManutencoes?.(impressora); fecharMenu(); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  <Wrench size={14} /> Manutenções
                </button>
                <button onClick={(e) => { e.stopPropagation(); aoEditar(impressora); fecharMenu(); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black hover:bg-zinc-50 dark:hover:bg-white/5 rounded-xl transition-all uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  <Edit2 size={14} /> Editar Setup
                </button>
                <div className="h-px bg-zinc-100 dark:bg-white/5 my-1 mx-2" />
                <button onClick={(e) => { e.stopPropagation(); aoAposentar(impressora); fecharMenu(); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all uppercase tracking-widest">
                  <Archive size={14} /> Desativar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════ VISUALIZAÇÃO CENTRAL ═══════ */}
      <div className="flex-1 relative flex items-center justify-center p-6 min-h-[220px]">
        {/* Glow de Status Distribuído */}
        <div 
          className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-32 blur-[80px] opacity-20 pointer-events-none transition-all duration-1000 group-hover:opacity-30"
          style={{ backgroundColor: corDestaque }}
        />

        <div className="relative z-10 transition-transform duration-700 group-hover:scale-110">
          {impressora.imagemUrl ? (
            <img src={impressora.imagemUrl} alt={impressora.nome} className="max-h-[180px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
          ) : (
            <div className="w-40 h-40 rounded-full border border-zinc-100 dark:border-white/5 flex items-center justify-center bg-zinc-50/50 dark:bg-white/[0.02] relative">
               <div className="absolute inset-2 border border-dashed border-zinc-200 dark:border-white/10 rounded-full animate-spin-slow opacity-20" />
               <Activity size={40} className="text-zinc-200 dark:text-zinc-800" />
            </div>
          )}
        </div>
      </div>

      {/* ═══════ MÓDULOS DE INFORMAÇÃO ═══════ */}
      <div className="px-8 pb-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-50/50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.05]">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 block mb-2">Operacional</span>
            <div className={`flex items-center gap-2 text-sm font-black uppercase tracking-tight ${configStatus.texto}`}>
              <configStatus.icone size={14} strokeWidth={3} className={estaImprimindo ? "animate-spin-slow" : ""} />
              {configStatus.sub}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-50/50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.05] text-right">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 block mb-1">Horímetro</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter tabular-nums">
              {horasUsadas}<small className="text-[10px] ml-1 uppercase opacity-30">hrs</small>
            </div>
          </div>
        </div>

        {/* ═══════ BARRA DE SAÚDE INTEGRADA ═══════ */}
        <div className="relative pt-4">
          <div className="flex justify-between items-center mb-3">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500 flex items-center gap-2">
              SAÚDE DO SISTEMA
            </label>
            <span className={`text-xs font-black tracking-tighter ${coresManutencao.text}`}>
              {Math.max(0, Math.round(saudeSistema))}%
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${Math.max(0, saudeSistema)}%` }} transition={{ duration: 1 }}
              className={`h-full rounded-full ${coresManutencao.bg} relative shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
            </motion.div>
          </div>
          <p className="text-[7px] font-bold text-zinc-400 dark:text-zinc-700 text-center uppercase tracking-[0.2em] mt-3">
             PRÓXIMA REVISÃO EM {Math.max(0, (impressora.intervaloRevisaoMinutos || 0) - (impressora.horimetroTotalMinutos || 0))} MIN
          </p>
        </div>
      </div>
    </motion.div>
  );
}
