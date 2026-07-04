import { motion, AnimatePresence } from "framer-motion";
import { PenTool } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { InputBancario } from "@/compartilhado/componentes/ui";

interface CardModelagemProps {
  tempoModelagem: number; // minutos
  setTempoModelagem: (v: number) => void;
  valorHoraModelagem: number; // centavos
  setValorHoraModelagem: (v: number) => void;
}

export const CardModelagem = memo(function CardModelagem({
  tempoModelagem,
  setTempoModelagem,
  valorHoraModelagem,
  setValorHoraModelagem
}: CardModelagemProps) {
  const temValor = tempoModelagem > 0;
  const [mostrar, setMostrar] = useState(temValor);
  const [tempHora, setTempHora] = useState<string | undefined>(undefined);
  const [tempMinuto, setTempMinuto] = useState<string | undefined>(undefined);

  // Mantém o painel aberto caso haja valor configurado via load/snapshot
  useEffect(() => {
    if (tempoModelagem > 0) {
      setMostrar(true);
    }
  }, [tempoModelagem]);

  return (
    <div className={`p-6 rounded-3xl bg-card border border-borda-sutil relative flex flex-col gap-6 shadow-2xl backdrop-blur-3xl transition-all duration-500 overflow-hidden ${!mostrar ? 'opacity-60' : ''}`}>
      {/* Efeito Glow Ciano de Fundo */}
      <div className="absolute -top-24 -right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none transition-all duration-700" />
      
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-borda-sutil">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${mostrar ? 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10' : 'text-zinc-500 border-borda-sutil bg-muted/20'}`}>
            <PenTool size={18} className={mostrar && tempoModelagem > 0 ? "animate-pulse" : ""} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-primary">Modelagem e CAD 3D</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Design, adequações e criação de modelos 3D</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const novoEstado = !mostrar;
            setMostrar(novoEstado);
            if (!novoEstado) {
              setTempoModelagem(0);
              setValorHoraModelagem(8000); // Reset para default
            }
          }}
          className={`relative w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
            mostrar ? 'bg-cyan-500' : 'bg-muted dark:bg-zinc-700'
          }`}
          aria-label="Cobrar Modelagem 3D"
        >
          <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-300 ${
            mostrar ? 'translate-x-4' : 'translate-x-0'
          }`} />
        </button>
      </div>

      <AnimatePresence>
        {mostrar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col md:flex-row gap-6 relative z-10"
          >
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Tempo de Projeto</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-black/20 border border-borda-sutil focus-within:border-cyan-500/40 transition-all shadow-inner">
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={tempHora !== undefined ? tempHora : (Math.floor(tempoModelagem / 60) === 0 ? "" : (Math.floor(tempoModelagem / 60) || ""))} 
                        onBlur={() => setTempHora(undefined)}
                        onChange={(e) => {
                          const v = e.target.value;
                          setTempHora(v);
                          setTempoModelagem((v === "" ? 0 : Number(v)) * 60 + (tempoModelagem % 60));
                        }} 
                        className="w-full h-11 pl-4 pr-10 bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                      />
                      <span className="absolute right-3 text-[9px] font-black text-muted-foreground uppercase pointer-events-none">H</span>
                    </div>

                    <div className="relative flex items-center h-11 rounded-xl bg-muted/40 dark:bg-black/20 border border-borda-sutil focus-within:border-cyan-500/40 transition-all shadow-inner">
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={tempMinuto !== undefined ? tempMinuto : ((tempoModelagem % 60) === 0 ? "" : ((tempoModelagem % 60) || ""))} 
                        onBlur={() => setTempMinuto(undefined)}
                        onChange={(e) => {
                          const v = e.target.value;
                          setTempMinuto(v);
                          setTempoModelagem(Math.floor(tempoModelagem / 60) * 60 + (v === "" ? 0 : Number(v)));
                        }} 
                        className="w-full h-11 pl-4 pr-10 bg-transparent outline-none font-black text-sm text-center text-primary dark:text-white" 
                      />
                      <span className="absolute right-3 text-[9px] font-black text-muted-foreground uppercase pointer-events-none">Min</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider ml-1">Valor da Hora CAD</label>
                  <div className="relative flex items-center bg-muted/40 dark:bg-black/20 rounded-xl border border-borda-sutil focus-within:border-cyan-500/40 shadow-inner">
                    <span className="absolute left-4 text-[10px] font-black text-muted-foreground">R$</span>
                    <InputBancario
                      placeholder="0,00"
                      value={valorHoraModelagem ? (valorHoraModelagem / 100) : ""}
                      onChange={(e) => setValorHoraModelagem(Math.round(Number(e.target.value) * 100))}
                      className="w-full h-11 bg-transparent pl-10 pr-4 font-black text-xs text-primary dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex flex-col justify-center gap-1">
              <span className="text-[9px] font-black uppercase text-cyan-600 dark:text-cyan-500/80 tracking-wider">Custo de Modelagem:</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  {Math.floor(tempoModelagem / 60)}h {(tempoModelagem % 60)}min x R$ {(valorHoraModelagem / 100).toFixed(2)}
                </span>
                <span className="text-lg font-black text-cyan-500 tracking-tight">
                  R$ {((tempoModelagem / 60) * (valorHoraModelagem / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
