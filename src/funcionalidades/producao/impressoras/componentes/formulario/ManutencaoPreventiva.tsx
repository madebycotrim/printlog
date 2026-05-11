import { Clock, Wrench } from "lucide-react";
import { SecaoFormulario, GradeCampos } from "@/compartilhado/componentes";
import { CampoTexto } from "@/compartilhado/componentes";

interface PropriedadesManutencao {
  register: any;
  errors: any;
}

export function ManutencaoPreventiva({ register, errors }: PropriedadesManutencao) {
  return (
    <SecaoFormulario titulo="Manutenção Preventiva">
      <GradeCampos colunas={2}>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Horímetro Total (h)
          </label>
          <CampoTexto
            icone={Clock}
            type="number"
            placeholder="0"
            erro={errors.horimetroTotalMinutos?.message}
            {...register("horimetroTotalMinutos")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Ciclo de Revisão (h)
          </label>
          <CampoTexto
            icone={Wrench}
            type="number"
            placeholder="300"
            erro={errors.intervaloRevisaoMinutos?.message}
            {...register("intervaloRevisaoMinutos")}
          />
        </div>
      </GradeCampos>
    </SecaoFormulario>
  );
}
