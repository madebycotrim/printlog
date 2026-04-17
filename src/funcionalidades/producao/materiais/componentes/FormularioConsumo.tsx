import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Info, Zap } from "lucide-react";
import { RegistroUso } from "../tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { motion } from "framer-motion";

const esquemaConsumo = z
  .object({
    nomePeca: z.string().min(3, "Informe o motivo ou peça"),
    quantidadeGastaGramas: z.coerce.number().positive("Quantidade deve ser maior que zero"),
    status: z.enum(["SUCESSO", "FALHA", "CANCELADO", "MANUAL"]),
  })
  .required();

type ConsumoFormData = {
  nomePeca: string;
  quantidadeGastaGramas: number;
  status: "SUCESSO" | "FALHA" | "CANCELADO" | "MANUAL";
};

interface PropriedadesFormularioConsumo {
  aoSalvar: (dados: Omit<RegistroUso, "id" | "data">) => Promise<void>;
  aoCancelar: () => void;
  pesoDisponivel: number;
}

const OPCOES_STATUS = [
  { valor: "MANUAL", rotulo: "Ajuste Manual" },
  { valor: "FALHA", rotulo: "Falha de Impressão" },
  { valor: "CANCELADO", rotulo: "Cancelamento" },
];

const VALORES_RAPIDOS = [10, 50, 100, 250];
const MOTIVOS_SUGERIDOS = [
  "Falha na Impressão",
  "Teste de Retração",
  "Purga de Material",
  "Ajuste de Fluxo",
  "Peça de Teste",
];

export function FormularioConsumo({ aoSalvar, aoCancelar, pesoDisponivel }: PropriedadesFormularioConsumo) {
  const [salvando, setSalvando] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConsumoFormData>({
    resolver: zodResolver(esquemaConsumo) as any,
    defaultValues: {
      status: "MANUAL",
      quantidadeGastaGramas: 0,
    },
  });

  const quantidadeGasta = watch("quantidadeGastaGramas") || 0;
  const excesso = quantidadeGasta > pesoDisponivel;
  const statusAtual = watch("status");
  const pesoFinal = Math.max(0, pesoDisponivel - (Number(quantidadeGasta) || 0));

  const aoSubmeter = async (dados: any) => {
    try {
      setSalvando(true);
      await aoSalvar(dados as ConsumoFormData);
      aoCancelar();
    } catch (erro) {
      // Erro tratado no hook
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(aoSubmeter)} className="space-y-10">
      {/* ═══════ CONTAINER IMERSIVO 3D ═══════ */}
      <div className="relative p-10 rounded-[3rem] bg-zinc-950 dark:bg-black border border-white/10 overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] group">
        
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-20 transition-opacity duration-1000 group-hover:opacity-30">
          <div className={`absolute -inset-[100%] animate-[spin_20s_linear_infinite] opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent`} />
          <div className={`absolute -inset-[100%] animate-[spin_15s_linear_infinite_reverse] opacity-50 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] ${excesso ? 'from-rose-500/20' : 'from-emerald-500/20'} via-transparent to-transparent`} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-8">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-2 block">Capacidade Atual</span>
            <div className="text-4xl font-black text-white/50 tracking-tighter tabular-nums">
              {pesoDisponivel}<small className="text-sm ml-1 opacity-30">G</small>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end scale-110 md:scale-125 origin-bottom">
            <span className={`text-[10px] font-black uppercase tracking-[0.5em] mb-3 transition-colors ${excesso ? 'text-rose-500' : 'text-emerald-400'}`}>Restante Previsto</span>
            <div className={`text-7xl font-black tabular-nums tracking-tighter transition-all duration-700 ${excesso ? 'text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]'}`}>
              {pesoFinal.toFixed(1)}
              <small className="text-xl ml-1 uppercase opacity-40">g</small>
            </div>
          </div>
        </div>

        {/* Liquid Progress Bar with Wave Effect */}
        <div className="mt-10 relative h-6 w-full bg-white/5 rounded-full border border-white/10 overflow-hidden backdrop-blur-xl">
           <motion.div 
            className={`absolute left-0 top-0 bottom-0 transition-colors duration-700 ${excesso ? 'bg-rose-500' : 'bg-emerald-500'}`}
            initial={false}
            animate={{ width: `${(pesoFinal / pesoDisponivel) * 100}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          >
            {/* Liquid Wave Overlay */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
              <svg className="h-full w-[200%] absolute animate-[wave_3s_linear_infinite]" viewBox="0 0 1000 100" preserveAspectRatio="none">
                <path d="M0,50 C150,20 350,80 500,50 C650,20 850,80 1000,50 L1000,100 L0,100 Z" fill="white" />
              </svg>
            </div>
            
            {/* Top Gloss */}
            <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
               {((pesoFinal / pesoDisponivel) * 100).toFixed(0)}% Utilizável
             </span>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Motivo com Grid de Cards Premium */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-400">
              <FileText size={20} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Qual o motivo?</label>
              <p className="text-xs font-bold text-zinc-400/60 tracking-tight">Selecione uma categoria ou descreva abaixo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {MOTIVOS_SUGERIDOS.map((motivo) => (
              <button
                key={motivo}
                type="button"
                onClick={() => setValue("nomePeca", motivo)}
                className="px-5 py-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] text-[10px] font-black text-zinc-500 dark:text-zinc-600 hover:border-indigo-500/40 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-white/[0.05] transition-all uppercase tracking-tight shadow-sm active:scale-95 text-left flex justify-between items-center group/btn"
              >
                {motivo}
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover/btn:bg-indigo-500 transition-colors" />
              </button>
            ))}
          </div>

          <CampoTexto
            placeholder="Nome da peça ou descrição personalizada..."
            erro={errors.nomePeca?.message}
            {...register("nomePeca")}
            className="h-16 text-lg bg-zinc-50/50 dark:bg-black/20 border-zinc-200 dark:border-white/5 focus:border-indigo-500/50 rounded-2xl px-6"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Slider/Input de Volume */}
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-2">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Gramatura</label>
              <span className="text-2xl font-black text-sky-500 tracking-tighter tabular-nums">{quantidadeGasta}g</span>
            </div>
            
            <div className="flex gap-2">
              {VALORES_RAPIDOS.map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setValue("quantidadeGastaGramas", valor)}
                  className="flex-1 py-3 rounded-xl bg-sky-500/5 border border-sky-500/10 text-[11px] font-black text-sky-500 hover:bg-sky-500 hover:text-white transition-all active:scale-95"
                >
                  {valor}
                </button>
              ))}
            </div>

            <CampoTexto
              type="number"
              step="0.1"
              placeholder="0.0"
              erro={errors.quantidadeGastaGramas?.message}
              {...register("quantidadeGastaGramas")}
              className={`bg-zinc-50/50 dark:bg-black/20 text-2xl font-black rounded-2xl h-20 text-center ${excesso ? "border-rose-500 text-rose-500 ring-4 ring-rose-500/10" : "border-zinc-200 dark:border-white/5"}`}
            />
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Status do Abatimento</label>
            <div className="p-1.5 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-3xl h-20 flex items-center">
              <Combobox
                titulo=""
                opcoes={OPCOES_STATUS}
                valor={statusAtual}
                aoAlterar={(val) => setValue("status", val as any)}
                icone={Info}
                placeholder="Origem..."
                className="border-none bg-transparent shadow-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 pt-10 border-t border-zinc-100 dark:border-white/5">
        <button
          type="button"
          onClick={aoCancelar}
          className="w-full md:w-auto px-12 py-5 text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          Descartar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className={`
            flex-1 w-full py-6 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.5em] shadow-2xl transition-all active:scale-95 disabled:scale-100 flex items-center justify-center gap-4 group/submit overflow-hidden relative
            ${salvando 
              ? 'bg-zinc-800 text-zinc-500' 
              : 'bg-zinc-900 border border-white/10 text-white hover:bg-black hover:border-white/20'
            }
          `}
        >
          {/* Progress fill on button hover? No, let's do a flare effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-emerald-600 opacity-0 group-hover/submit:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex items-center gap-4">
            {salvando ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap size={22} fill="currentColor" className="text-white group-hover/submit:animate-pulse" />
                <span>Confirmar & Sincronizar</span>
              </>
            )}
          </div>
        </button>
      </div>

      <style>{`
        @keyframes wave {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </form>
  );
}
