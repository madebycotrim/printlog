import { Zap } from "lucide-react";
import { Controller } from "react-hook-form";
import { SecaoFormulario, GradeCampos } from "@/compartilhado/componentes";
import { CampoTexto } from "@/compartilhado/componentes";
import { CampoMonetario } from "@/compartilhado/componentes";

interface PropriedadesEspecificacoes {
  register: any;
  control: any;
  errors: any;
}

export function EspecificacoesTecnicas({ register, control, errors }: PropriedadesEspecificacoes) {
  return (
    <SecaoFormulario titulo="Especificações Técnicas">
      <GradeCampos colunas={3}>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Potência (W)
          </label>
          <CampoTexto
            icone={Zap}
            type="number"
            placeholder="0"
            erro={errors.potenciaWatts?.message}
            {...register("potenciaWatts")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Aquisição
          </label>
          <Controller
            name="valorCompraCentavos"
            control={control}
            render={({ field }) => (
              <CampoMonetario
                placeholder="0,00"
                erro={errors.valorCompraCentavos?.message}
                {...field}
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Taxa Hora (BRL/h)
          </label>
          <Controller
            name="taxaHoraCentavos"
            control={control}
            render={({ field }) => (
              <CampoMonetario
                placeholder="0,00"
                erro={errors.taxaHoraCentavos?.message}
                {...field}
              />
            )}
          />
        </div>
      </GradeCampos>
    </SecaoFormulario>
  );
}
