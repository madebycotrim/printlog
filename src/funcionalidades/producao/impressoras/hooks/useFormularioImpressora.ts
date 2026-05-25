import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { Impressora, PerfilImpressoraCatalogo } from "../tipos";
import { StatusImpressora } from "@/compartilhado/tipos/modelos";
import { LISTA_IMPRESSORAS } from "../constantes/impressoras";
import { useGerenciadorImpressoras } from "./useGerenciadorImpressoras";
import { ordenarOpcoesPorFrequencia } from "@/compartilhado/utilitarios/classificacao";

const esquemaImpressora = z.object({
  nome: z.string().min(2, "O apelido deve ter pelo menos 2 caracteres"),
  tecnologia: z.enum(["FDM", "SLA"] as const),
  marca: z.string().optional(),
  modeloBase: z.string().min(1, "O modelo é obrigatório."),
  imagemUrl: z.string().optional(),
  potenciaWatts: z.coerce.number().optional(),
  valorCompraCentavos: z.coerce.number().optional(),
  horimetroTotalMinutos: z.coerce.number().optional(),
  intervaloRevisaoMinutos: z.coerce.number().optional(),
  consumoKw: z.coerce.number().optional(),
  taxaHoraCentavos: z.coerce.number().optional(),
});

type ImpressoraFormData = z.infer<typeof esquemaImpressora>;

interface ConfigHookImpressora {
  aberto: boolean;
  impressoraEditando: Impressora | null;
  aoSalvar: (impressora: Impressora) => Promise<any> | void;
  aoCancelar: () => void;
}

export function useFormularioImpressora({ aberto, impressoraEditando, aoSalvar, aoCancelar }: ConfigHookImpressora) {
  const estaEditando = Boolean(impressoraEditando);
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);
  const [catalogo, definirCatalogo] = useState<PerfilImpressoraCatalogo[]>([]);
  
  const { estado: estadoImpressoras } = useGerenciadorImpressoras();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ImpressoraFormData>({
    resolver: zodResolver(esquemaImpressora) as any,
    mode: "onChange",
    defaultValues: {
      nome: "",
      tecnologia: "FDM",
      marca: "",
      modeloBase: "",
      imagemUrl: "",
      potenciaWatts: "" as unknown as number,
      valorCompraCentavos: "" as unknown as number,
      taxaHoraCentavos: "" as unknown as number,
      horimetroTotalMinutos: 0,
      intervaloRevisaoMinutos: 300,
    },
  });

  const tecnologiaAtiva = watch("tecnologia");
  const marcaAtiva = watch("marca");
  const modeloAtivo = watch("modeloBase");

  // Carregar catálogo de impressoras
  useEffect(() => {
    const dadosMapeados: PerfilImpressoraCatalogo[] = LISTA_IMPRESSORAS.map((item) => ({
      marca: item.brand,
      modelo: item.model,
      nome: item.name,
      consumoKw: item.consumoKw,
      tipo: item.type,
      imagem: item.img,
    }));
    definirCatalogo(dadosMapeados);
  }, []);

  // Sincronizar dados ao abrir/editar
  useEffect(() => {
    if (aberto) {
      if (impressoraEditando) {
        reset({
          nome: impressoraEditando.nome,
          tecnologia:
            impressoraEditando.tecnologia === "DLP" || impressoraEditando.tecnologia === "LCD"
              ? "SLA"
              : (impressoraEditando.tecnologia as "FDM" | "SLA"),
          marca: impressoraEditando.marca || "",
          modeloBase: impressoraEditando.modeloBase || "",
          imagemUrl: impressoraEditando.imagemUrl || "",
          potenciaWatts: impressoraEditando.potenciaWatts,
          valorCompraCentavos: impressoraEditando.valorCompraCentavos ? impressoraEditando.valorCompraCentavos / 100 : ("" as unknown as number),
          taxaHoraCentavos: impressoraEditando.taxaHoraCentavos ? impressoraEditando.taxaHoraCentavos / 100 : ("" as unknown as number),
          horimetroTotalMinutos: Math.floor((impressoraEditando.horimetroTotalMinutos || 0) / 60),
          intervaloRevisaoMinutos: Math.floor((impressoraEditando.intervaloRevisaoMinutos || 18000) / 60),
          consumoKw: impressoraEditando.consumoKw,
        });
      } else {
        reset({
          nome: "", tecnologia: "FDM", marca: "", modeloBase: "", imagemUrl: "",
          potenciaWatts: "" as unknown as number, valorCompraCentavos: "" as unknown as number,
          taxaHoraCentavos: "" as unknown as number, horimetroTotalMinutos: 0, intervaloRevisaoMinutos: 300,
        });
      }
      definirConfirmarDescarte(false);
    }
  }, [aberto, impressoraEditando, reset]);

  // Filtros de catálogo
  const tiposFDM = ["FDM", "FDM Profissional", "FDM Compacta", "FDM Nacional", "FDM (Kit)", "FDM Premium", "CoreXY", "CoreXY Profissional", "Bedslinger"];
  const tiposSLA = ["Resina", "SLA", "DLP", "LCD"];

  const catalogoFiltrado = useMemo(() => {
    const tiposPermitidos = tecnologiaAtiva === "FDM" ? tiposFDM : tiposSLA;
    return catalogo.filter((p) => tiposPermitidos.includes(p.tipo));
  }, [catalogo, tecnologiaAtiva]);

  const opcoesFabricante = useMemo(() => {
    const marcas = [...new Set(catalogoFiltrado.map((p) => p.marca))].sort();
    const opcoesBase = marcas.map((m) => ({ valor: m, rotulo: m }));
    const historicoMarcas = (estadoImpressoras.impressorasFiltradas || []).map(i => i.marca || "");
    return ordenarOpcoesPorFrequencia(opcoesBase, historicoMarcas, 3);
  }, [catalogoFiltrado, estadoImpressoras.impressorasFiltradas]);

  const opcoesModelo = useMemo(() => {
    const termoMarca = (marcaAtiva || "").toLowerCase().trim();
    const filtrados = termoMarca
      ? catalogoFiltrado.filter((p) => p.marca.toLowerCase() === termoMarca)
      : catalogoFiltrado;
    return filtrados.map((p) => ({ valor: p.modelo, rotulo: `${p.modelo}` }));
  }, [catalogoFiltrado, marcaAtiva]);

  const aoAlterarModelo = (modeloNome: string) => {
    setValue("modeloBase", modeloNome, { shouldValidate: true, shouldDirty: true });
    const perfil = catalogo.find((p) => p.modelo === modeloNome);
    if (perfil) {
      setValue("imagemUrl", perfil.imagem, { shouldDirty: true });
      setValue("consumoKw", perfil.consumoKw, { shouldDirty: true });
      if (!marcaAtiva) {
        setValue("marca", perfil.marca, { shouldValidate: true, shouldDirty: true });
      }
      const nomeAtual = watch("nome");
      if (!nomeAtual || nomeAtual.trim() === "") {
        setValue("nome", perfil.modelo, { shouldDirty: true });
      }
    }
  };

  const onSubmit = async (dados: ImpressoraFormData) => {
    try {
      const objetoFinal: Impressora = {
        ...(impressoraEditando || {}),
        nome: dados.nome,
        tecnologia: dados.tecnologia,
        status: impressoraEditando?.status || StatusImpressora.LIVRE,
        marca: dados.marca?.trim() || "Genérico",
        modeloBase: dados.modeloBase,
        imagemUrl: dados.imagemUrl,
        consumoKw: dados.consumoKw,
        potenciaWatts: dados.potenciaWatts,
        valorCompraCentavos: Math.round((dados.valorCompraCentavos || 0) * 100),
        taxaHoraCentavos: Math.round((dados.taxaHoraCentavos || 0) * 100),
        horimetroTotalMinutos: (dados.horimetroTotalMinutos || 0) * 60,
        intervaloRevisaoMinutos: (dados.intervaloRevisaoMinutos || 300) * 60,
        id: impressoraEditando?.id || "",
        dataCriacao: impressoraEditando?.dataCriacao || new Date(),
        dataAtualizacao: new Date(),
      };
      await aoSalvar(objetoFinal);
      aoCancelar();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "FormularioImpressora" }, "Erro ao salvar impressora", erro);
    }
  };

  return {
    estaEditando,
    confirmarDescarte,
    definirConfirmarDescarte,
    register,
    handleSubmit,
    watch,
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
  };
}
