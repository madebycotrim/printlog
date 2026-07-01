import { useEffect, useState } from "react";
import { Insumo, CategoriaInsumo } from "../../tipos";
import { useFormularioInsumo } from "../../hooks/useFormularioInsumo";
import { SecaoInformacoesBasicas } from "../formulario/SecaoInformacoesBasicas";
import { SecaoEstoquePreco } from "../formulario/SecaoEstoquePreco";
import { SecaoRendimentoFracionado } from "../formulario/SecaoRendimentoFracionado";
import { AcoesDescarte } from "@/compartilhado/componentes";
import { IndicadorEtapas } from "@/compartilhado/componentes/ui";

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
  const [etapaAtual, setEtapaAtual] = useState(1);
  const ETAPAS = [
    { id: 1, titulo: "Informações Básicas" },
    { id: 2, titulo: "Precificação & Estoque" },
    { id: 3, titulo: "Rendimento & Fracionamento" },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    errors,
    onSubmit,
    categoriaAtiva,
    iconeAtivo,
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

  const avancarEtapa = async () => {
    let camposValidos = false;
    
    if (etapaAtual === 1) {
      camposValidos = await trigger(["nome", "categoria", "marca"]);
    } else if (etapaAtual === 2) {
      camposValidos = await trigger(["quantidadeAtual", "custoMedioUnidade", "unidadeMedida", "quantidadeMinima"]);
    } else {
      camposValidos = true;
    }

    if (camposValidos) {
      setEtapaAtual((prev) => Math.min(prev + 1, 3));
    }
  };

  const voltarEtapa = () => {
    setEtapaAtual((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex flex-col gap-8">
      <IndicadorEtapas etapas={ETAPAS} etapaAtual={etapaAtual} corTema={corTema} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        
        {/* CONTEÚDO DA ETAPA ATUAL */}
        <div className="min-h-[300px]">
          {etapaAtual === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <SecaoInformacoesBasicas 
                register={register}
                errors={errors}
                categoriaAtiva={categoriaAtiva || "Geral"}
                aoMudarCategoria={(cat) => setValue("categoria", cat, { shouldDirty: true, shouldValidate: true, shouldTouch: true })}
                iconeAtivo={iconeAtivo}
                aoMudarIcone={(icone) => setValue("icone", icone, { shouldDirty: true, shouldValidate: true })}
                corTema={corTema}
              />
            </div>
          )}

          {etapaAtual === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
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
          )}

          {etapaAtual === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
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
          )}
        </div>

        {/* Rodapé Padronizado com Descarte */}
        <div className="pt-8 border-t border-zinc-100 dark:border-white/5">
           {!confirmarDescarte ? (
              <div className="flex items-center justify-between">
                 <div>
                   {etapaAtual > 1 && (
                     <button 
                       type="button" 
                       onClick={voltarEtapa} 
                       className="px-6 py-2.5 text-[11px] font-black uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                     >
                       Voltar
                     </button>
                   )}
                 </div>
                 
                 <div className="flex items-center gap-4">
                   <button 
                     type="button" 
                     onClick={lidarComTentativaFechamento} 
                     className="px-6 py-2.5 text-[11px] font-black uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                   >
                     Cancelar
                   </button>
                   
                   {etapaAtual < 3 ? (
                     <button
                       type="button"
                       onClick={avancarEtapa}
                       className={`h-12 px-10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl bg-${corTema} hover:brightness-110 shadow-${corTema}/20`}
                     >
                       Próxima
                     </button>
                   ) : (
                     <button
                       type="submit"
                       className={`h-12 px-10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl bg-${corTema} hover:brightness-110 shadow-${corTema}/20`}
                     >
                       Cadastrar Insumos 
                     </button>
                   )}
                 </div>
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
