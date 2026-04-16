import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Wrench, Clock, CheckSquare } from "lucide-react";
import { TipoManutencao, RegistrarManutencaoInput, PecaDesgaste } from "../tipos";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import { CampoAreaTexto } from "@/compartilhado/componentes/CampoAreaTexto";

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
        custoCentavos: Math.round(dados.custoCentavos * 100),
      });
      aoCancelar();
    } catch (erro) {
      // Erro já tratado no hook
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(aoSubmeter as any)} className="space-y-6 bg-white dark:bg-[#18181b]">
      <div className="space-y-6">
        {/* Seleção de Tipo */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-zinc-900/50 p-1 rounded-xl border border-gray-100 dark:border-white/5">
          {Object.values(TipoManutencao).map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setValue("tipo", tipo)}
              className={`py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${
                tipoSelecionado === tipo
                  ? "bg-white dark:bg-[#18181b] shadow-sm border border-gray-200 dark:border-white/10 text-sky-500"
                  : "text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>

        <CampoAreaTexto
          rotulo="O que foi feito?"
          icone={Wrench}
          rows={2}
          placeholder="Ex: Troca de bico 0.4 e calibração da mesa"
          erro={errors.descricao?.message}
          {...register("descricao")}
        />

        <div className="grid grid-cols-2 gap-5">
          <CampoMonetario
            rotulo="Custo Estimado"
            placeholder="0,00"
            erro={errors.custoCentavos?.message}
            {...register("custoCentavos")}
          />

          <div className="relative">
            <CampoTexto
              type="number"
              rotulo="Tempo de Parada"
              icone={Clock}
              placeholder="0"
              erro={errors.tempoParadaMinutos?.message}
              {...register("tempoParadaMinutos")}
            />
            <span className="absolute right-0 top-[38px] text-[10px] uppercase font-black text-gray-400 dark:text-zinc-600">
              Minutos
            </span>
          </div>
        </div>

        {pecas.length > 0 && (
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-zinc-500 tracking-widest">
              Peças Trocadas (Resetar Contador)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {pecas.map((peca) => (
                <button
                  key={peca.id}
                  type="button"
                  onClick={() => togglePeca(peca.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                    pecasTrocadasIds.includes(peca.id)
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-500/5 text-sky-700 dark:text-sky-400 shadow-sm"
                      : "border-gray-100 dark:border-white/5 bg-transparent hover:border-gray-200 dark:hover:border-white/10"
                  }`}
                >
                  <span className="text-xs font-bold">{peca.nome}</span>
                  {pecasTrocadasIds.includes(peca.id) ? (
                    <CheckSquare size={16} className="text-sky-500" />
                  ) : (
                    <div className="w-4 h-4 rounded border-2 border-gray-200 dark:border-white/10" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={aoCancelar}
          className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          style={{ backgroundColor: "var(--cor-primaria)" }}
          className="flex-[2] py-3 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Save size={18} />
          {salvando ? "Processando..." : "Registrar Manutenção"}
        </button>
      </div>
    </form>
  );
}
