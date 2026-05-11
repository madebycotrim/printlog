import { Controller } from "react-hook-form";
import { Package, Ruler, AlertCircle, Link as LinkIcon } from "lucide-react";
import { CampoTexto } from "@/compartilhado/componentes";
import { CampoMonetario } from "@/compartilhado/componentes";
import { Combobox } from "@/compartilhado/componentes";
import { UNIDADES } from "../../constantes";
import { UnidadeInsumo } from "../../tipos";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesSecaoEstoque {
  register: any;
  control: any;
  errors: any;
  setValue: any;
  unidadeMedidaAtiva: UnidadeInsumo;
}

export function SecaoEstoquePreco({ register, control, errors, setValue, unidadeMedidaAtiva }: PropriedadesSecaoEstoque) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600 flex items-center gap-3">
          Precificação & Estoque
          <div className="flex-1 h-px bg-gradient-to-r from-zinc-100 to-transparent dark:from-white/5 dark:to-transparent" />
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Controller
          name="custoMedioUnidade"
          control={control}
          rules={{ required: "Obrigatório" }}
          render={({ field: { onChange, value, ref } }) => (
            <CampoMonetario
              ref={ref}
              rotulo="Valor Unitário"
              placeholder="0,00"
              erro={errors.custoMedioUnidade?.message}
              value={value ? (value / 100).toString().replace(".", ",") : ""}
              onChange={(e) => {
                const val = extrairValorNumerico(e.target.value);
                onChange(Math.round(val * 100));
              }}
            />
          )}
        />

        <CampoTexto
          rotulo="Estoque Atual"
          icone={Package}
          type="text"
          inputMode="decimal"
          placeholder="0"
          erro={errors.quantidadeAtual?.message}
          {...register("quantidadeAtual", { 
            required: "Obrigatório", 
            setValueAs: (v: any) => extrairValorNumerico(v) || 0 
          })}
        />

        <Combobox
          titulo="Unidade"
          opcoes={UNIDADES}
          valor={unidadeMedidaAtiva}
          aoAlterar={(val) => setValue("unidadeMedida", val, { shouldDirty: true, shouldValidate: true })}
          icone={Ruler}
          placeholder="Ex: UN, KG..."
          permitirNovo={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CampoTexto
          rotulo="Estoque Mínimo (Alerta)"
          icone={AlertCircle}
          type="text"
          inputMode="decimal"
          placeholder="5"
          erro={errors.quantidadeMinima?.message}
          {...register("quantidadeMinima", { 
            required: "Obrigatório", 
            setValueAs: (v: any) => extrairValorNumerico(v) || 0 
          })}
        />

        <CampoTexto
          rotulo="Link Reposição"
          icone={LinkIcon}
          placeholder="https://..."
          erro={errors.linkCompra?.message}
          {...register("linkCompra")}
        />
      </div>
    </div>
  );
}
