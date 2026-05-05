import { MoreVertical, Edit2, Archive, Wrench, Activity } from "lucide-react";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calcularPercentualVidaUtil, obterStatusManutencao, obterCorStatusManutencao } from "../utilitarios/utilitariosManutencao";

interface PropriedadesCardImpressora {
  impressora: Impressora;
  aoEditar: (impressora: Impressora) => void;
  aoAposentar: (impressora: Impressora) => void;
  aoGerenciamento: (impressora: Impressora, aba?: "producao" | "manutencao" | "config") => void;
}

export function CardImpressora({
  impressora,
  aoEditar,
  aoAposentar,
  aoGerenciamento,
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

  const horasUsadas = Math.floor((impressora.horimetroTotalMinutos || 0) / 60);

  return (
    <motion.div
      layout
      onClick={() => aoGerenciamento(impressora, "producao")}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex flex-col h-full rounded-2xl bg-card border border-borda-sutil overflow-hidden transition-all duration-300 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] cursor-pointer"
    >
      {/* ═══════ HEADER: IDENTIDADE ═══════ */}
      <div className="p-5 flex justify-between items-start relative z-20">
        <div className="flex flex-col min-w-0 pr-4">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
            {impressora.marca || "Custom"} {impressora.modeloBase}
          </span>
          <h4 className="text-2xl font-black text-primary tracking-tighter leading-none uppercase">
            {impressora.nome}
          </h4>
        </div>
        
        <div className="flex items-center gap-3" ref={referenciaMenu}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              definirMenuAberto(!menuAberto);
            }}
            className={`p-2 rounded-xl transition-all ${menuAberto ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted/60"}`}
          >
            <MoreVertical size={18} />
          </button>
          
          <AnimatePresence>
            {menuAberto && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                 className="absolute right-0 top-12 w-52 bg-card border border-borda-sutil rounded-xl shadow-2xl z-50 p-1.5"
              >
                <button onClick={(e) => { e.stopPropagation(); aoGerenciamento(impressora, "manutencao"); fecharMenu(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black hover:bg-muted/60 rounded-lg transition-all uppercase tracking-widest text-muted-foreground">
                  <Wrench size={14} /> Manutenções
                </button>
                <button onClick={(e) => { e.stopPropagation(); aoGerenciamento(impressora, "config"); fecharMenu(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black hover:bg-muted/60 rounded-lg transition-all uppercase tracking-widest text-muted-foreground">
                  <Edit2 size={14} /> Editar Setup
                </button>
                <div className="h-px bg-borda-sutil/50 my-1" />
                <button onClick={(e) => { e.stopPropagation(); aoAposentar(impressora); fecharMenu(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all uppercase tracking-widest">
                  <Archive size={14} /> Desativar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════ CORPO: VISUAL ═══════ */}
      <div className="flex-1 relative flex items-center justify-center min-h-[240px]">
        <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
          {impressora.imagemUrl ? (
            <img src={impressora.imagemUrl} alt={impressora.nome} className="max-h-[220px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]" />
          ) : (
            <div className="w-24 h-24 rounded-full border border-dashed border-borda-sutil flex items-center justify-center bg-muted/20">
               <Activity size={24} className="text-muted-foreground opacity-30" />
            </div>
          )}
        </div>
      </div>

      {/* ═══════ FOOTER: MÉTRICAS TÉCNICAS ═══════ */}
      <div className="p-6 pt-0 space-y-6">
        <div className="flex items-end justify-between border-t border-borda-sutil pt-5">
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Produção Total
            </span>
            <div className="text-2xl font-black text-primary tracking-tighter tabular-nums leading-none">
              {horasUsadas}
              <span className="text-[10px] uppercase opacity-30 ml-1">hrs</span>
            </div>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Saúde do Ativo
            </span>
            <div className={`text-2xl font-black tracking-tighter tabular-nums leading-none ${coresManutencao.text}`}>
              {Math.max(0, Math.round(saudeSistema))}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-1.5 w-full bg-muted dark:bg-white/5 rounded-full overflow-hidden relative shadow-inner">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${Math.max(0, saudeSistema)}%` }} transition={{ duration: 1 }}
              className={`h-full rounded-full ${coresManutencao.bg} relative`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            </motion.div>
          </div>
          
          <div className="flex justify-between items-center opacity-50">
             <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">
               Status Nominal
             </span>
             <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">
               Revisão: {Math.max(0, (impressora.intervaloRevisaoMinutos || 0) - (impressora.horimetroTotalMinutos || 0))}m
             </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
