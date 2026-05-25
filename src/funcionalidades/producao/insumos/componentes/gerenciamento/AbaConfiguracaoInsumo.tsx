import { useEffect } from "react";
import { Insumo, CategoriaInsumo } from "../../tipos";
import { useFormularioInsumo } from "../../hooks/useFormularioInsumo";
import { SecaoInformacoesBasicas } from "../formulario/SecaoInformacoesBasicas";
import { SecaoEstoquePreco } from "../formulario/SecaoEstoquePreco";
import { SecaoRendimentoFracionado } from "../formulario/SecaoRendimentoFracionado";
import { AcoesDescarte } from "@/compartilhado/componentes";

interface PropriedadesAbaConfiguracao {
  insumo: Insumo;
  aoSalvar: (dados: Partial<Insumo>) => Promise<any> | void;
  aoCancelar: () => void;
  corTema?: string;
  aoMudarCategoriaInterna?: (cat: CategoriaInsumo) => void;
}

export function AbaConfiguracaoInsumo({ 
  insumo, 
  aoSalvar, 
  aoCancelar, 
  corTema = "sky-500",
  aoMudarCategoriaInterna 
}: PropriedadesAbaConfiguracao) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    errors,
    onSubmit,
    categoriaAtiva,
    unidadeMedidaAtiva,
    itemFracionavelAtivo,
    unidadeConsumoAtiva,
    quantidadeAtualAtiva,
    custoEfetivo,
    confirmarDescarte,
    definirConfirmarDescarte,
    lidarComTentativaFechamento,
  } = useFormularioInsumo({ aberto: true, insumoEditando: insumo, aoSalvar, aoCancelar });

  // Notifica o modal sobre a mudança de categoria
  useEffect(() => {
    if (categoriaAtiva && aoMudarCategoriaInterna) {
      aoMudarCategoriaInterna(categoriaAtiva as CategoriaInsumo);
    }
  }, [categoriaAtiva, aoMudarCategoriaInterna]);

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        
        {/* IDENTIFICAÇÃO */}
        <div className="space-y-8">
          <SecaoInformacoesBasicas 
            register={register}
            errors={errors}
            categoriaAtiva={categoriaAtiva || "Geral"}
            aoMudarCategoria={(cat) => setValue("categoria", cat, { shouldDirty: true, shouldValidate: true, shouldTouch: true })}
          />
        </div>

        <div className="h-px bg-zinc-100 dark:bg-white/5" />

        {/* DADOS TÉCNICOS / ESTOQUE */}
        <div className="space-y-8">
          <SecaoEstoquePreco 
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            unidadeMedidaAtiva={unidadeMedidaAtiva}
            quantidadeAtual={quantidadeAtualAtiva}
            corTema={corTema}
          />
        </div>

        <div className="h-px bg-zinc-100 dark:bg-white/5" />

        {/* RENDIMENTO */}
        <div className="space-y-8">
          <SecaoRendimentoFracionado 
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            itemFracionavelAtivo={itemFracionavelAtivo || false}
            unidadeConsumoAtiva={unidadeConsumoAtiva || ""}
            custoEfetivo={custoEfetivo}
            corTema={corTema}
          />
        </div>

        {/* Rodapé Padronizado com Descarte */}
        <div className="pt-8 border-t border-zinc-100 dark:border-white/5">
           {!confirmarDescarte ? (
              <div className="flex items-center gap-4 justify-end">
                 <button 
                   type="button" 
                   onClick={lidarComTentativaFechamento} 
                   className="px-6 py-2.5 text-[11px] font-black uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                 >
                   Cancelar
                 </button>
                 <button
                   type="submit"
                   className={`h-12 px-10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl bg-${corTema} hover:brightness-110 shadow-${corTema}/20`}
                 >
                   Cadastrar Insumos 
                 </button>
              </div>
           ) : (
              <div className="flex justify-end">
                <AcoesDescarte
                   aoConfirmarDescarte={aoCancelar}
                   aoContinuarEditando={() => definirConfirmarDescarte(false)}
                />
              </div>
           )}
        </div>
      </form>
    </div>
  );
}
