import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Wrench, Clock, CheckCircle2, AlertTriangle, Cpu, TrendingUp } from "lucide-react";
import { TipoManutencao, RegistrarManutencaoInput, PecaDesgaste } from "../../tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import { CampoAreaTexto } from "@/compartilhado/componentes/CampoAreaTexto";
import { motion } from "framer-motion";

const esquemaManutencao = z.object({
  tipo: z.nativeEnum(TipoManutencao),
  descricao: z.string().min(5, "Descreva o que foi feito"),
  custoCentavos: z.coerce.number().min(0),
  tempoParadaMinutos: z.coerce.number().min(0),
  pecasTrocadas: z.array(z.string()).default([]),
});

type ManutencaoFormData = z.infer<typeof esquemaManutencao>;

interface FormularioManutencaoProps {
  idImpressora: string;
  pecas: PecaDesgaste[];
  aoSalvar: (dados: RegistrarManutencaoInput) => Promise<void>;
  aoCancelar: () => void;
  aoAlterarDirty?: (sujo: boolean) => void;
}

export function FormularioManutencao({
  idImpressora,
  pecas,
  aoSalvar,
  aoCancelar,
  aoAlterarDirty,
}: FormularioManutencaoProps) {
  const [salvando, setSalvando] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<ManutencaoFormData>({
    resolver: zodResolver(esquemaManutencao) as any,
    defaultValues: {
      tipo: TipoManutencao.PREVENTIVA,
      descricao: "",
      custoCentavos: 0,
      tempoParadaMinutos: 0,
      pecasTrocadas: [],
    },
  });

  useEffect(() => {
    aoAlterarDirty?.(isDirty);
  }, [isDirty, aoAlterarDirty]);

  const tipoSelecionado = watch("tipo");
  const pecasTrocadasIds = watch("pecasTrocadas");

  const togglePeca = (id: string) => {
    const novos = pecasTrocadasIds.includes(id) ? pecasTrocadasIds.filter((i) => i !== id) : [...pecasTrocadasIds, id];
    setValue("pecasTrocadas", novos, { shouldDirty: true });
  };

  const aoSubmeter = async (dados: ManutencaoFormData) => {
    try {
      setSalvando(true);
      await aoSalvar({
        ...dados,
        idImpressora,
        // O CampoMonetario já retorna em centavos se configurado corretamente, 
        // ou multiplicamos por 100 se for float. Aqui mantemos a consistência do input.
        custoCentavos: Math.round(dados.custoCentavos * 100),
      });
    } catch (erro) {
      console.error(erro);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(aoSubmeter as any)} className="space-y-10 bg-transparent">
      
      {/* 1. Seleção de Tipo Estilizada */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Natureza da Intervenção</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: TipoManutencao.PREVENTIVA, rotulo: "Preventiva", icone: CheckCircle2, cor: "emerald", classes: "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10", iconeCor: "bg-emerald-500" },
            { id: TipoManutencao.CORRETIVA, rotulo: "Corretiva", icone: AlertTriangle, cor: "rose", classes: "border-rose-500 bg-rose-500/10 text-rose-500 shadow-rose-500/10", iconeCor: "bg-rose-500" },
            { id: TipoManutencao.MELHORIA, rotulo: "Upgrade", icone: TrendingUp, cor: "sky", classes: "border-sky-500 bg-sky-500/10 text-sky-500 shadow-sky-500/10", iconeCor: "bg-sky-500" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setValue("tipo", item.id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 group ${
                tipoSelecionado === item.id
                  ? `${item.classes} shadow-lg`
                  : "border-zinc-100 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] text-zinc-400 hover:border-zinc-200 dark:hover:border-white/10"
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${
                tipoSelecionado === item.id ? `${item.iconeCor} text-white` : "bg-zinc-100 dark:bg-white/5 text-zinc-400"
              }`}>
                <item.icone size={16} strokeWidth={3} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">{item.rotulo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Detalhes da Ação */}
      <div className="space-y-6">
        <CampoAreaTexto
          rotulo="Relatório Técnico"
          icone={Wrench}
          rows={3}
          placeholder="Descreva detalhadamente o que foi realizado nesta intervenção..."
          erro={errors.descricao?.message}
          {...register("descricao")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Investimento (BRL)</label>
            <Controller
              name="custoCentavos"
              control={control}
              render={({ field }) => (
                <CampoMonetario
                  placeholder="0,00"
                  erro={errors.custoCentavos?.message}
                  {...field}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Tempo de Inatividade</label>
            <div className="relative">
              <CampoTexto
                type="number"
                icone={Clock}
                placeholder="0"
                erro={errors.tempoParadaMinutos?.message}
                {...register("tempoParadaMinutos")}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-zinc-500 pointer-events-none">
                Minutos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Peças Trocadas */}
      {pecas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 ml-1">
             <Cpu size={14} className="text-zinc-500" />
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Substituição de Componentes</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pecas.map((peca) => (
              <button
                key={peca.id}
                type="button"
                onClick={() => togglePeca(peca.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                  pecasTrocadasIds.includes(peca.id)
                    ? "border-sky-500/50 bg-sky-500/10 text-sky-500 shadow-lg shadow-sky-500/5"
                    : "border-zinc-100 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:border-zinc-200 dark:hover:border-white/10"
                }`}
              >
                <div className="flex flex-col items-start">
                   <span className="text-[11px] font-bold uppercase tracking-tight">{peca.nome}</span>
                   <span className="text-[8px] font-medium opacity-50 uppercase tracking-widest">Resetar Horímetro</span>
                </div>
                {pecasTrocadasIds.includes(peca.id) ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-sky-500 text-white p-1 rounded-full">
                     <CheckCircle2 size={14} strokeWidth={3} />
                  </motion.div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-white/10" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Ações Finais */}
      <div className="flex flex-col md:flex-row items-center gap-4 pt-6 border-t border-zinc-100 dark:border-white/5">
        <button
          type="button"
          onClick={aoCancelar}
          className="w-full md:w-auto px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
        >
          Descartar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="w-full md:flex-1 py-4 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-sky-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Save size={18} strokeWidth={3} />
          {salvando ? "Processando..." : "Confirmar Registro Técnico"}
        </button>
      </div>
    </form>
  );
}
