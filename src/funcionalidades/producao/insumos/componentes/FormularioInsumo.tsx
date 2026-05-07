import { useState } from "react";
import { Package, Database, Activity } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { CabecalhoModalPremium } from "@/compartilhado/componentes/CabecalhoModalPremium";
import { AbasModalPremium } from "@/compartilhado/componentes/AbasModalPremium";
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
 * 💎 Formulário de Cadastro/Edição de Insumos (Silent Premium Edition).
 */
export function FormularioInsumo({ aberto, insumoEditando, aoCancelar, aoSalvar }: PropriedadesFormularioInsumo) {
  const {
    estaEditando,
    confirmarDescarte,
    definirConfirmarDescarte,
    finalFormularioRef,
    register,
    control,
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

  const [abaAtiva, definirAbaAtiva] = useState("identificacao");

  if (!aberto) return null;

  const abas = [
    { id: "identificacao", rotulo: "Identificação", icone: Package },
    { id: "estoque", rotulo: "Estoque e Custos", icone: Database },
    { id: "tecnico", rotulo: "Rendimento", icone: Activity },
  ];

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      larguraMax="max-w-2xl"
    >
      <div className="bg-white dark:bg-[#0a0a0a] overflow-hidden rounded-2xl shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          
          <CabecalhoModalPremium 
            titulo={estaEditando ? "Editar Insumo" : "Novo Insumo"}
            subtitulo={
              estaEditando 
                ? <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{insumoEditando?.nome}</span>
                : <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Almoxarifado de Apoio Logístico</span>
            }
            icone={<Package className="text-sky-500" size={28} strokeWidth={2.5} />}
            aoFechar={lidarComTentativaFechamento}
            corTema="sky-500"
          />

          <AbasModalPremium 
            abas={abas}
            abaAtiva={abaAtiva}
            aoMudarAba={definirAbaAtiva}
            corTema="sky-500"
          />

          <div className="p-8 min-h-[400px]">
            {abaAtiva === "identificacao" && (
              <SecaoInformacoesBasicas 
                register={register}
                errors={errors}
                categoriaAtiva={categoriaAtiva || "Geral"}
                aoMudarCategoria={(cat) => setValue("categoria", cat, { shouldDirty: true })}
              />
            )}

            {abaAtiva === "estoque" && (
              <SecaoEstoquePreco 
                register={register}
                errors={errors}
                control={control}
                setValue={setValue}
                unidadeMedidaAtiva={unidadeMedidaAtiva}
              />
            )}

            {abaAtiva === "tecnico" && (
              <SecaoRendimentoFracionado 
                register={register}
                errors={errors}
                setValue={setValue}
                itemFracionavelAtivo={itemFracionavelAtivo || false}
                unidadeConsumoAtiva={unidadeConsumoAtiva || ""}
                custoEfetivo={custoEfetivo}
              />
            )}
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
