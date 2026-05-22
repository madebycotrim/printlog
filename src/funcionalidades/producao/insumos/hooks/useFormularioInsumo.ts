import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Insumo } from "../tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";

interface ConfigHookInsumo {
  aberto: boolean;
  insumoEditando: Insumo | null;
  aoSalvar: (dados: Partial<Insumo>) => Promise<any> | void;
  aoCancelar: () => void;
}

export function useFormularioInsumo({ aberto, insumoEditando, aoSalvar, aoCancelar }: ConfigHookInsumo) {
  const estaEditando = Boolean(insumoEditando);
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);
  const finalFormularioRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<Partial<Insumo>>({
    mode: "onChange",
    defaultValues: {
      nome: "",
      marca: "",
      categoria: "Geral",
      unidadeMedida: "un",
      quantidadeAtual: 0,
      custoMedioUnidade: 0,
      quantidadeMinima: 5,
      linkCompra: "",
      itemFracionavel: false,
      rendimentoTotal: undefined,
      unidadeConsumo: "",
    },
  });

  const categoriaAtiva = watch("categoria");
  const unidadeMedidaAtiva = watch("unidadeMedida") || "un";
  const itemFracionavelAtivo = watch("itemFracionavel");
  const custoMedioAtivo = watch("custoMedioUnidade") || 0;
  const rendimentoAtivo = watch("rendimentoTotal") || 0;
  const unidadeConsumoAtiva = watch("unidadeConsumo") || "";

  // Cálculo de custo efetivo (unidade de consumo)
  const custoEfetivo =
    itemFracionavelAtivo && rendimentoAtivo > 0
      ? ((custoMedioAtivo / 100) / rendimentoAtivo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";

  // Efeito para scroll automático quando habilita fracionamento
  useEffect(() => {
    if (itemFracionavelAtivo) {
      setTimeout(() => {
        finalFormularioRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [itemFracionavelAtivo]);

  // Sincronização de dados ao abrir/editar
  useEffect(() => {
    if (aberto) {
      const valoresPadrao = {
        nome: "",
        marca: "",
        categoria: "Geral" as const,
        unidadeMedida: "un" as const,
        quantidadeAtual: 0,
        custoMedioUnidade: 0,
        quantidadeMinima: 5,
        linkCompra: "",
        itemFracionavel: false,
        rendimentoTotal: undefined,
        unidadeConsumo: "",
      };

      if (insumoEditando) {
        reset({
          ...valoresPadrao,
          ...insumoEditando,
          linkCompra: insumoEditando.linkCompra || "",
          marca: insumoEditando.marca || "",
          unidadeConsumo: insumoEditando.unidadeConsumo || "",
        });
      } else {
        reset(valoresPadrao);
      }
      definirConfirmarDescarte(false);
    }
  }, [aberto, insumoEditando, reset]);

  const fecharModalRealmente = () => {
    definirConfirmarDescarte(false);
    aoCancelar();
  };

  const lidarComTentativaFechamento = () => {
    if (isDirty && !confirmarDescarte) {
      definirConfirmarDescarte(true);
    } else {
      fecharModalRealmente();
    }
  };

  const onSubmit = async (data: Partial<Insumo>) => {
    try {
      const payload = {
        ...data,
        marca: data.marca?.trim() || "Genérico",
        quantidadeAtual: Number(data.quantidadeAtual) || 0,
        quantidadeMinima: Number(data.quantidadeMinima) || 0,
        custoMedioUnidade: Number(data.custoMedioUnidade) || 0,
        rendimentoTotal: data.itemFracionavel ? Number(data.rendimentoTotal) || 0 : undefined,
      };
      await aoSalvar(payload);
      fecharModalRealmente();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "FormularioInsumo" }, "Erro ao salvar insumo", erro);
    }
  };

  return {
    estaEditando,
    confirmarDescarte,
    definirConfirmarDescarte,
    finalFormularioRef,
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    errors,
    isDirty,
    categoriaAtiva,
    unidadeMedidaAtiva,
    itemFracionavelAtivo,
    custoMedioAtivo,
    rendimentoAtivo,
    unidadeConsumoAtiva,
    custoEfetivo,
    lidarComTentativaFechamento,
    fecharModalRealmente,
    onSubmit,
  };
}
