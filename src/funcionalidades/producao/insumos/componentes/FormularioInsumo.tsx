import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { Insumo } from "@/funcionalidades/producao/insumos/tipos";
import { usarFormularioInsumo } from "../hooks/usarFormularioInsumo";
import { SecaoInformacoesBasicas } from "./formulario/SecaoInformacoesBasicas";
import { SecaoEstoquePreco } from "./formulario/SecaoEstoquePreco";
import { SecaoRendimentoFracionado } from "./formulario/SecaoRendimentoFracionado";
import { RodapeFormulario } from "./formulario/RodapeFormulario";

interface PropriedadesFormularioInsumo {
  aberto: boolean;
  insumoEditando: Insumo | null;
  aoCancelar: () => void;
  aoSalvar: (dados: Partial<Insumo>) => Promise<any> | void;
}

/**
 * Formulário de Cadastro/Edição de Insumos (Refatorado para Escalabilidade).
 * @lgpd Base legal: Execução de contrato (Art. 7º, V) - Gestão de insumos e suprimentos.
 */
export function FormularioInsumo({ aberto, insumoEditando, aoCancelar, aoSalvar }: PropriedadesFormularioInsumo) {
  const {
    estaEditando,
    confirmarDescarte,
    definirConfirmarDescarte,
    finalFormularioRef,
    register,
    handleSubmit,
    setValue,
    errors,
    isDirty,
    categoriaAtiva,
    unidadeMedidaAtiva,
    itemFracionavelAtivo,
    unidadeConsumoAtiva,
    custoEfetivo,
    lidarComTentativaFechamento,
    fecharModalRealmente,
    onSubmit,
  } = usarFormularioInsumo({ aberto, insumoEditando, aoSalvar, aoCancelar });

  if (!aberto) return null;

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      titulo={estaEditando ? "Editar Insumo" : "Novo Insumo"}
      larguraMax="max-w-2xl"
    >
      <div className="bg-white dark:bg-[#18181b]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col bg-white dark:bg-[#18181b]">
          <div className="p-6 space-y-10">
            
            <SecaoInformacoesBasicas 
              register={register}
              errors={errors}
              categoriaAtiva={categoriaAtiva || "Geral"}
              aoMudarCategoria={(cat) => setValue("categoria", cat, { shouldDirty: true })}
            />

            <SecaoEstoquePreco 
              register={register}
              errors={errors}
              setValue={setValue}
              unidadeMedidaAtiva={unidadeMedidaAtiva}
            />

            <SecaoRendimentoFracionado 
              register={register}
              errors={errors}
              setValue={setValue}
              itemFracionavelAtivo={itemFracionavelAtivo || false}
              unidadeConsumoAtiva={unidadeConsumoAtiva || ""}
              custoEfetivo={custoEfetivo}
            />

          </div>

          <RodapeFormulario 
            confirmarDescarte={confirmarDescarte}
            estaEditando={estaEditando}
            isDirty={isDirty}
            aoCancelar={lidarComTentativaFechamento}
            aoFecharRealmente={fecharModalRealmente}
            aoContinuarEditando={() => definirConfirmarDescarte(false)}
          />

          <div ref={finalFormularioRef} className="h-px" />
        </form>
      </div>
    </Dialogo>
  );
}
