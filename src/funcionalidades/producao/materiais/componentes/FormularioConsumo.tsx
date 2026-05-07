import { useState, useMemo } from "react";
import { Scale, Check, MinusCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PropriedadesFormularioConsumo {
  aoSalvar: (dados: { quantidade: number; motivo: string }) => Promise<void>;
  aoCancelar: () => void;
  pesoDisponivel: number;
  tipo?: "FDM" | "SLA";
  corMaterial?: string;
}

type ModoAbatimento = "PERDA" | "BALANCA";

export function FormularioConsumo({ aoSalvar, aoCancelar, pesoDisponivel, tipo, corMaterial = "#6366f1" }: PropriedadesFormularioConsumo) {
  const [modo, setModo] = useState<ModoAbatimento>("PERDA");
  const [valorInput, setValorInput] = useState<string>("0");
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const unidade = tipo === "SLA" ? "ml" : "g";
  
  const quantidadeAbatida = useMemo(() => {
    const num = parseFloat(valorInput.replace(",", ".")) || 0;
    if (modo === "BALANCA") {
      return Math.max(0, pesoDisponivel - num);
    }
    return num;
  }, [valorInput, modo, pesoDisponivel]);

  const saldoFinalReal = modo === "PERDA" ? pesoDisponivel - quantidadeAbatida : parseFloat(valorInput.replace(",", ".")) || 0;
  const eAbatimentoTotal = quantidadeAbatida >= pesoDisponivel && pesoDisponivel > 0;

  const lidarComEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantidadeAbatida <= 0 && modo === "PERDA") return;
    
    setSalvando(true);
    try {
      await aoSalvar({
        quantidade: quantidadeAbatida,
        motivo: motivo || "Abatimento manual"
      });
    } finally {
      setSalvando(false);
    }
  };

  const trocarModo = (novoModo: ModoAbatimento) => {
    setModo(novoModo);
    setValorInput(novoModo === "BALANCA" ? pesoDisponivel.toString() : "0");
  };

  const adicionarValor = (v: number) => {
    const atual = parseFloat(valorInput) || 0;
    setValorInput((atual + v).toString());
  };

  return (
    <form onSubmit={lidarComEnvio} className="flex flex-col gap-5 max-w-xl mx-auto">
      
      {/* 1. Painel de Resultado (Claro e Objetivo) */}
      <div 
        className="relative overflow-hidden rounded-[1.5rem] p-5 text-center border transition-all duration-300"
        style={{ 
          backgroundColor: eAbatimentoTotal ? 'rgba(244, 63, 94, 0.05)' : (corMaterial + '08'), 
          borderColor: eAbatimentoTotal ? 'rgba(244, 63, 94, 0.2)' : (corMaterial + '15')
        }}
      >
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1 block">Saldo que restará no rolo</span>
        <div className="flex items-baseline justify-center gap-1.5">
          <motion.span 
            key={saldoFinalReal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-black tracking-tighter tabular-nums" 
            style={{ color: eAbatimentoTotal ? '#f43f5e' : corMaterial }}
          >
            {Math.max(0, saldoFinalReal).toFixed(0)}
          </motion.span>
          <span className="text-sm font-bold opacity-40 uppercase" style={{ color: eAbatimentoTotal ? '#f43f5e' : corMaterial }}>{unidade}</span>
        </div>
        
        <AnimatePresence>
          {quantidadeAbatida > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase"
              style={{ color: eAbatimentoTotal ? '#f43f5e' : '#94a3b8' }}
            >
              {eAbatimentoTotal ? <AlertCircle size={12} /> : <MinusCircle size={12} />}
              {eAbatimentoTotal ? "O rolo será zerado" : `Removendo ${quantidadeAbatida.toFixed(1)}${unidade}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Controle de Entrada com Nomes Claros */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
             <label className="text-[10px] font-black uppercase text-zinc-900 dark:text-white tracking-widest">
               {modo === "PERDA" ? "Quanto saiu?" : "Quanto tem agora?"}
             </label>
             <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">
               {modo === "PERDA" ? "Digite apenas o peso da perda/falha" : "Coloque o rolo na balança e digite o total"}
             </span>
          </div>
          
          <button 
            type="button"
            onClick={() => trocarModo(modo === "PERDA" ? "BALANCA" : "PERDA")}
            className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest py-2 px-4 rounded-full border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all shadow-sm"
            style={{ color: corMaterial }}
          >
            {modo === "PERDA" ? <Scale size={10} /> : <MinusCircle size={10} />}
            Mudar para Modo {modo === "PERDA" ? "Balança" : "Gasto"}
          </button>
        </div>

        <div className="relative group">
          <input
            type="number"
            step="0.1"
            value={valorInput}
            onChange={(e) => setValorInput(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-black/20 border-2 border-transparent rounded-2xl px-6 py-4 text-4xl font-black text-center focus:outline-none transition-all tabular-nums"
            style={{ 
              borderColor: (modo === "PERDA" && valorInput !== "0") || (modo === "BALANCA" && parseFloat(valorInput) !== pesoDisponivel) ? (corMaterial + '33') : undefined,
              color: (modo === "PERDA" && valorInput !== "0") || (modo === "BALANCA" && parseFloat(valorInput) !== pesoDisponivel) ? corMaterial : undefined 
            }}
          />
          <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-10 group-focus-within:opacity-100 transition-opacity" style={{ color: corMaterial }}>
            {modo === "PERDA" ? <MinusCircle size={24} /> : <Scale size={24} />}
          </div>
        </div>

        {/* Atalhos */}
        {modo === "PERDA" && (
          <div className="grid grid-cols-4 gap-2">
            {[10, 50, 100, 250].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => adicionarValor(v)}
                className="py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 text-[10px] font-black uppercase text-zinc-500 border border-transparent hover:border-zinc-200 dark:hover:border-white/10 transition-all"
              >
                +{v}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Motivo Compacto */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {["Falha", "Teste", "Purga", "Ajuste"].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMotivo(m)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${
                motivo.includes(m) 
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white" 
                  : "bg-transparent text-zinc-400 border-zinc-100 dark:border-white/5"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Opcional: Por que?"
          className="w-full bg-transparent border-b border-zinc-100 dark:border-white/10 py-2 text-center text-xs focus:outline-none transition-all"
          style={{ borderBottomColor: motivo ? corMaterial : undefined }}
        />
      </div>

      {/* 4. Ação Final */}
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={aoCancelar}
          className="px-6 py-3 text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={(quantidadeAbatida <= 0 && modo === "PERDA") || salvando}
          className="flex-1 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] disabled:opacity-20"
          style={{ backgroundColor: eAbatimentoTotal ? '#f43f5e' : corMaterial }}
        >
          {salvando ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check size={16} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {eAbatimentoTotal ? "Zerar Insumo" : "Gravar Lançamento"}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
