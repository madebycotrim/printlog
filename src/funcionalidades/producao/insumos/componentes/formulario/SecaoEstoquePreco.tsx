import { Package, Ruler, AlertCircle, Link as LinkIcon } from "lucide-react";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { UNIDADES } from "../../constantes";
import { UnidadeInsumo } from "../../tipos";
import { extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesSecaoEstoque {
  register: any;
  errors: any;
  setValue: any;
  unidadeMedidaAtiva: UnidadeInsumo;
}

export function SecaoEstoquePreco({ register, errors, setValue, unidadeMedidaAtiva }: PropriedadesSecaoEstoque) {
  return (
    <div className="space-y-6">
      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 text-gray-400 dark:text-zinc-500">
        PRECIFICAÇÃO & ESTOQUE
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CampoMonetario
          rotulo="Valor Unitário"
          placeholder="0,00"
          erro={errors.custoMedioUnidade?.message}
          {...register("custoMedioUnidade", { 
            required: "Obrigatório", 
            setValueAs: (v: any) => Math.round(extrairValorNumerico(v) * 100) || 0 
          })}
        />

        <CampoTexto
          rotulo="Estoque Atual"
          icone={Package}
          type="text" // Mudado para text para aceitar vírgula e ser processado pelo extrairValorNumerico
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
