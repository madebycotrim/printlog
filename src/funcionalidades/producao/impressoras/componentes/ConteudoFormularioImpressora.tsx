import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { useFormularioImpressora } from "../hooks/useFormularioImpressora";
import { IdentificacaoHardware } from "./formulario/IdentificacaoHardware";
import { EspecificacoesTecnicas } from "./formulario/EspecificacoesTecnicas";
import { ManutencaoPreventiva } from "./formulario/ManutencaoPreventiva";
import { RodapeImpressora } from "./formulario/RodapeImpressora";

interface PropriedadesConteudoFormulario {
  impressora: Impressora | null;
  aoSalvar: (impressora: Impressora) => Promise<any> | void;
  aoCancelar: () => void;
}

/**
 * Conteúdo isolado do formulário de impressoras para uso em modais e abas.
 */
export function ConteudoFormularioImpressora({
  impressora,
  aoSalvar,
  aoCancelar,
}: PropriedadesConteudoFormulario) {
  
  const {
    estaEditando,
    confirmarDescarte,
    definirConfirmarDescarte,
    register,
    handleSubmit,
    control,
    setValue,
    errors,
    isDirty,
    tecnologiaAtiva,
    marcaAtiva,
    modeloAtivo,
    opcoesFabricante,
    opcoesModelo,
    aoAlterarModelo,
    onSubmit,
  } = useFormularioImpressora({ aberto: true, impressoraEditando: impressora, aoSalvar, aoCancelar });

  return (
    <div className="bg-transparent animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-1 space-y-6 p-8 pt-8">
          
          <IdentificacaoHardware 
            tecnologiaAtiva={tecnologiaAtiva}
            marcaAtiva={marcaAtiva || ""}
            modeloAtivo={modeloAtivo || ""}
            opcoesFabricante={opcoesFabricante}
            opcoesModelo={opcoesModelo}
            errors={errors}
            register={register}
            setValue={setValue}
            aoAlterarModelo={aoAlterarModelo}
            esconderTecnologia={!!impressora}
          />

          <EspecificacoesTecnicas 
            register={register}
            control={control}
            errors={errors}
          />

          <ManutencaoPreventiva 
            register={register}
            errors={errors}
          />

        </div>

        <RodapeImpressora 
            confirmarDescarte={confirmarDescarte}
            estaEditando={estaEditando}
            isDirty={isDirty}
            aoCancelar={() => {
            if (isDirty && !confirmarDescarte) {
                definirConfirmarDescarte(true);
            } else {
                aoCancelar();
            }
            }}
            aoFecharRealmente={aoCancelar}
            aoContinuarEditando={() => definirConfirmarDescarte(false)}
        />
      </form>
    </div>
  );
}
