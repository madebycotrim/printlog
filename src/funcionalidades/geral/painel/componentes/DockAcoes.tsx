import { Calculator, Clock, UserPlus, Package, Box, Wrench, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";

/**
 * Interface para as propriedades do DockAcoes.
 */
interface PropriedadesDockAcoes {
  aoNavegar: (rota: string) => void;
  aoAbrirModalCliente: () => void;
  aoAbrirModalSelecaoMat: () => void;
  aoAbrirModalSelecaoIns: () => void;
  aoAbrirModalFinanceiro: () => void;
}

/**
 * Dock flutuante de ações rápidas com estética premium e interações fluidas.
 */
export function DockAcoes({
  aoNavegar,
  aoAbrirModalCliente,
  aoAbrirModalSelecaoMat,
  aoAbrirModalSelecaoIns,
  aoAbrirModalFinanceiro
}: PropriedadesDockAcoes) {
  const [aberto, definirAberto] = useState(false);

  const itens = [
    { label: "Novo Orçamento", icone: Calculator, cor: "amber", acao: () => aoNavegar("/calculadora") },
    { label: "Ver Fila de Produção", icone: Clock, cor: "sky", acao: () => aoNavegar("/producao?aba=fila") },
    { label: "Cadastrar Cliente", icone: UserPlus, cor: "indigo", acao: () => aoAbrirModalCliente() },
    { label: "Repor Material (Filamento)", icone: Package, cor: "emerald", acao: () => aoAbrirModalSelecaoMat() },
    { label: "Repor Insumo (Resina/Peças)", icone: Box, cor: "teal", acao: () => aoAbrirModalSelecaoIns() },
    { label: "Status das Máquinas", icone: Wrench, cor: "rose", acao: () => aoNavegar("/impressoras") },
    { label: "Registrar Lançamento", icone: Plus, cor: "violet", acao: () => aoAbrirModalFinanceiro() },
  ];

  const coresMap: Record<string, string> = {
    amber: "hover:bg-amber-500/10 hover:border-amber-500/30 text-amber-500",
    sky: "hover:bg-sky-500/10 hover:border-sky-500/30 text-sky-500",
    indigo: "hover:bg-indigo-500/10 hover:border-indigo-500/30 text-indigo-500",
    emerald: "hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-500",
    teal: "hover:bg-teal-500/10 hover:border-teal-500/30 text-teal-500",
    rose: "hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500",
    violet: "hover:bg-violet-500/10 hover:border-violet-500/30 text-violet-500",
  };

  const conteudoDock = (
    <>
      {/* Backdrop premium escurecido e desfocado que COBRE TODA A TELA (Portal) */}
      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => definirAberto(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9990] cursor-pointer"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 z-[9995]">
        <AnimatePresence>
          {aberto && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-full right-0 mb-6 flex flex-col gap-2.5 pb-4"
            >
              {itens.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (itens.length - index) * 0.05 }}
                  onClick={() => {
                    item.acao();
                    definirAberto(false);
                  }}
                  className={`flex items-center justify-between w-60 bg-card/95 backdrop-blur-2xl border border-white/10 p-3.5 rounded-2xl transition-all shadow-2xl group/btn ${coresMap[item.cor]}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover/btn:text-primary dark:group-hover/btn:text-white transition-colors">
                    {item.label}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-current/10 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-3`}>
                    <item.icone size={18} />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão de Disparo Principal */}
        <motion.button
          onClick={() => definirAberto(!aberto)}
          animate={{ scale: aberto ? 1.1 : 1 }}
          whileHover={{ scale: aberto ? 1.1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-4 rounded-[2rem] shadow-2xl border transition-all duration-500 relative group overflow-hidden cursor-pointer ${
            aberto 
              ? "bg-amber-500 border-amber-400 text-white" 
              : "bg-card/90 backdrop-blur-2xl border-white/10 text-amber-500 hover:border-amber-500/30"
          }`}
        >
          {!aberto && (
            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          )}
          
          <div className="relative z-10 flex items-center justify-center">
            <motion.div
              animate={{ rotate: aberto ? 135 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Plus size={28} strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.button>
      </div>
    </>
  );

  return typeof document !== "undefined" ? createPortal(conteudoDock, document.body) : null;
}
