import { Dialogo } from "@/compartilhado/componentes";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { useFormularioImpressora } from "../hooks/useFormularioImpressora";
import { IdentificacaoHardware } from "./formulario/IdentificacaoHardware";
import { EspecificacoesTecnicas } from "./formulario/EspecificacoesTecnicas";
import { ManutencaoPreventiva } from "./formulario/ManutencaoPreventiva";
import { RodapeImpressora } from "./formulario/RodapeImpressora";

interface PropriedadesFormularioImpressora {
  aberto: boolean;
  impressoraEditando: Impressora | null;
  aoSalvar: (impressora: Impressora) => Promise<any> | void;
  aoCancelar: () => void;
}

/**
 * Formulário de Cadastro/Edição de Impressoras (Refatorado para Escalabilidade).
 * @lgpd Base legal: Execução de contrato (Art. 7º, V) - Gerenciamento de ativos produtivos.
 */
export function FormularioImpressora({
  aberto,
  impressoraEditando,
  aoSalvar,
  aoCancelar,
}: PropriedadesFormularioImpressora) {
  
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
  } = useFormularioImpressora({ aberto, impressoraEditando, aoSalvar, aoCancelar });

  if (!aberto) return null;

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoCancelar} // Usamos o cancelamento direto ou o interceptador se preferir
      titulo={estaEditando ? "Editar Impressora" : "Nova Impressora"}
      larguraMax="max-w-2xl"
    >
      <div className="bg-transparent">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 p-6 space-y-10">
            
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
    </Dialogo>
  );
}
