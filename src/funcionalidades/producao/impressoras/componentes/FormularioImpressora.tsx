import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Zap, Clock, Wrench, Tag, Building2, Layers, Droplet } from "lucide-react";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import { Impressora, PerfilImpressoraCatalogo } from "@/funcionalidades/producao/impressoras/tipos";
import { StatusImpressora } from "@/compartilhado/tipos/modelos";
import { SecaoFormulario, GradeCampos } from "@/compartilhado/componentes/FormularioLayout";

const esquemaImpressora = z.object({
  nome: z.string().min(2, "O apelido deve ter pelo menos 2 caracteres"),
  tecnologia: z.enum(["FDM", "SLA"] as const),
  marca: z.string().min(1, "O fabricante é obrigatório."),
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

interface PropriedadesFormularioImpressora {
  aberto: boolean;
  impressoraEditando: Impressora | null;
  /**
   * @param impressora Dados da impressora para salvar.
   * @returns Promise (Justificativa: tipagem flexível para persistência mock)
   */
  aoSalvar: (impressora: Impressora) => Promise<any> | void;
  aoCancelar: () => void;
}

/**
 * Formulário de Cadastro/Edição de Impressoras.
 * @lgpd Base legal: Execução de contrato (Art. 7º, V) - Gerenciamento de ativos produtivos.
 */
export function FormularioImpressora({
  aberto,
  impressoraEditando,
  aoSalvar,
  aoCancelar,
}: PropriedadesFormularioImpressora) {
  const estaEditando = Boolean(impressoraEditando);
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);
  const [catalogo, definirCatalogo] = useState<PerfilImpressoraCatalogo[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
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
      taxaHoraCentavos: 15,
      horimetroTotalMinutos: 0,
      intervaloRevisaoMinutos: 300,
    },
  });

  const tecnologiaAtiva = watch("tecnologia");
  const marcaAtiva = watch("marca");
  const modeloAtivo = watch("modeloBase");

  useEffect(() => {
    fetch("/impressoras.json")
      .then((res) => res.json())
      .then((dados: any[]) => {
        const dadosMapeados: PerfilImpressoraCatalogo[] = dados.map((item) => ({
          marca: item.brand,
          modelo: item.model,
          nome: item.name,
          consumoKw: item.consumoKw,
          tipo: item.type,
          imagem: item.img,
        }));
        definirCatalogo(dadosMapeados);
      })
      .catch((erro) =>
        registrar.error({ rastreioId: "sistema", servico: "FormularioImpressora" }, "Erro ao carregar catálogo", erro),
      );
  }, []);

  useEffect(() => {
    if (aberto) {
      if (impressoraEditando) {
        reset({
          nome: impressoraEditando.nome,
          tecnologia:
            impressoraEditando.tecnologia === "DLP" || impressoraEditando.tecnologia === "LCD"
              ? "SLA"
              : impressoraEditando.tecnologia,
          marca: impressoraEditando.marca || "",
          modeloBase: impressoraEditando.modeloBase || "",
          imagemUrl: impressoraEditando.imagemUrl || "",
          potenciaWatts: impressoraEditando.potenciaWatts,
          valorCompraCentavos: (impressoraEditando.valorCompraCentavos || 0) / 100,
          taxaHoraCentavos: (impressoraEditando.taxaHoraCentavos || 1500) / 100,
          horimetroTotalMinutos: Math.floor((impressoraEditando.horimetroTotalMinutos || 0) / 60),
          intervaloRevisaoMinutos: Math.floor((impressoraEditando.intervaloRevisaoMinutos || 18000) / 60),
          consumoKw: impressoraEditando.consumoKw,
        });
      } else {
        reset({
          nome: "",
          tecnologia: "FDM",
          marca: "",
          modeloBase: "",
          imagemUrl: "",
          potenciaWatts: "" as unknown as number,
          valorCompraCentavos: "" as unknown as number,
          taxaHoraCentavos: 15,
          horimetroTotalMinutos: 0,
          intervaloRevisaoMinutos: 300,
        });
      }
      definirConfirmarDescarte(false);
    }
  }, [aberto, impressoraEditando, reset]);

  // --- Fabricantes e modelos filtrados por tecnologia ---
  const tiposFDM = [
    "FDM",
    "FDM Profissional",
    "FDM Compacta",
    "FDM Nacional",
    "FDM (Kit)",
    "FDM Premium",
    "CoreXY",
    "CoreXY Profissional",
    "Bedslinger",
  ];
  const tiposSLA = ["Resina", "SLA", "DLP", "LCD"];

  const catalogoFiltrado = useMemo(() => {
    const tiposPermitidos = tecnologiaAtiva === "FDM" ? tiposFDM : tiposSLA;
    return catalogo.filter((p) => tiposPermitidos.includes(p.tipo));
  }, [catalogo, tecnologiaAtiva]);

  const opcoesFabricante = useMemo(() => {
    const marcas = [...new Set(catalogoFiltrado.map((p) => p.marca))].sort();
    return marcas.map((m) => ({ valor: m, rotulo: m }));
  }, [catalogoFiltrado]);

  const opcoesModelo = useMemo(() => {
    const termoMarca = (marcaAtiva || "").toLowerCase().trim();
    const filtrados = termoMarca
      ? catalogoFiltrado.filter((p) => p.marca.toLowerCase() === termoMarca)
      : catalogoFiltrado;
    return filtrados.map((p) => ({ valor: p.modelo, rotulo: `${p.nome}` }));
  }, [catalogoFiltrado, marcaAtiva]);

  /** Ao selecionar modelo, autopreenche imagem + consumo + apelido */
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

  const lidarComEnvio = async (dados: ImpressoraFormData) => {
    try {
      const objetoFinal: Impressora = {
        ...(impressoraEditando || {}),
        nome: dados.nome,
        tecnologia: dados.tecnologia,
        status: impressoraEditando?.status || StatusImpressora.LIVRE,
        marca: dados.marca,
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
      fecharModalRealmente();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "FormularioImpressora" }, "Erro ao salvar impressora", erro);
    }
  };

  const lidarComTentativaFechamento = () => {
    if (isDirty && !confirmarDescarte) {
      definirConfirmarDescarte(true);
    } else {
      fecharModalRealmente();
    }
  };

  const fecharModalRealmente = () => {
    aoCancelar();
  };

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      titulo={estaEditando ? "Editar Impressora" : "Nova Impressora"}
      larguraMax="max-w-2xl"
    >
      <div className="bg-transparent">
        <form onSubmit={handleSubmit(lidarComEnvio)} className="flex flex-col h-full">
          <div className="flex-1 p-6 space-y-10">
            {/* ═══════ SEÇÃO 1: IDENTIFICAÇÃO DE HARDWARE ═══════ */}
            <SecaoFormulario titulo="Identificação de Hardware">
              <div className="flex bg-gray-50 dark:bg-black/30 p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner w-full md:w-max mx-auto overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setValue("tecnologia", "FDM", { shouldValidate: true, shouldDirty: true });
                    setValue("marca", "", { shouldDirty: true });
                    setValue("modeloBase", "", { shouldDirty: true });
                    setValue("imagemUrl", "", { shouldDirty: true });
                  }}
                  className={`px-8 py-2.5 text-[10px] font-black rounded-xl transition-all duration-300 flex items-center gap-2 uppercase tracking-widest ${tecnologiaAtiva === "FDM" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xl ring-1 ring-black/5 dark:ring-white/10" : "text-gray-400 dark:text-zinc-600 hover:text-gray-900 dark:hover:text-white"}`}
                >
                  <Layers size={14} strokeWidth={3} />
                  FILAMENTO (FDM)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue("tecnologia", "SLA", { shouldValidate: true, shouldDirty: true });
                    setValue("marca", "", { shouldDirty: true });
                    setValue("modeloBase", "", { shouldDirty: true });
                    setValue("imagemUrl", "", { shouldDirty: true });
                  }}
                  className={`px-8 py-2.5 text-[10px] font-black rounded-xl transition-all duration-300 flex items-center gap-2 uppercase tracking-widest ${tecnologiaAtiva === "SLA" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xl ring-1 ring-black/5 dark:ring-white/10" : "text-gray-400 dark:text-zinc-600 hover:text-gray-900 dark:hover:text-white"}`}
                >
                  <Droplet size={14} strokeWidth={3} />
                  RESINA (SLA)
                </button>
              </div>

              <GradeCampos colunas={2}>
                {/* FABRICANTE */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    Fabricante / Marca
                  </label>
                  <Combobox
                    opcoes={opcoesFabricante}
                    valor={marcaAtiva || ""}
                    aoAlterar={(val) => {
                      setValue("marca", val, { shouldValidate: true, shouldDirty: true });
                      setValue("modeloBase", "", { shouldDirty: true });
                      setValue("imagemUrl", "", { shouldDirty: true });
                    }}
                    placeholder="Selecione..."
                    permitirNovo={true}
                    icone={Building2}
                  />
                  {errors.marca && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block tracking-tight">
                      {errors.marca.message}
                    </span>
                  )}
                </div>

                {/* MODELO */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    Modelo Base
                  </label>
                  <Combobox
                    opcoes={opcoesModelo}
                    valor={modeloAtivo || ""}
                    aoAlterar={aoAlterarModelo}
                    placeholder="Selecione..."
                    permitirNovo={true}
                    icone={Layers}
                  />
                  {errors.modeloBase && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block tracking-tight">
                      {errors.modeloBase.message}
                    </span>
                  )}
                </div>

                <CampoTexto
                  rotulo="Apelido da Máquina"
                  icone={Tag}
                  placeholder={modeloAtivo && marcaAtiva ? `Ex: ${modeloAtivo} #01` : "Ex: Minha Ender 3"}
                  erro={errors.nome?.message}
                  className="col-span-1 md:col-span-2"
                  {...register("nome")}
                />
              </GradeCampos>
            </SecaoFormulario>

            {/* ═══════ SEÇÃO 2: ESPECIFICAÇÕES TÉCNICAS 🎉 ═══════ */}
            <SecaoFormulario titulo="Especificações Técnicas">
              <GradeCampos colunas={3}>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    Potência (W)
                  </label>
                  <CampoTexto
                    icone={Zap}
                    type="number"
                    placeholder="0"
                    erro={errors.potenciaWatts?.message}
                    {...register("potenciaWatts")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    Aquisição
                  </label>
                  <CampoMonetario
                    placeholder="0,00"
                    erro={errors.valorCompraCentavos?.message}
                    {...register("valorCompraCentavos")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    Taxa Hora (BRL/h)
                  </label>
                  <CampoMonetario
                    placeholder="15,00"
                    erro={errors.taxaHoraCentavos?.message}
                    {...register("taxaHoraCentavos")}
                  />
                </div>
              </GradeCampos>
            </SecaoFormulario>

            {/* ═══════ SEÇÃO 3: MANUTENÇÃO PREVENTIVA 🛠️ ═══════ */}
            <SecaoFormulario titulo="Manutenção Preventiva">
              <GradeCampos colunas={2}>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    Horímetro Total (h)
                  </label>
                  <CampoTexto
                    icone={Clock}
                    type="number"
                    placeholder="0"
                    erro={errors.horimetroTotalMinutos?.message}
                    {...register("horimetroTotalMinutos")}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    Ciclo de Revisão (h)
                  </label>
                  <CampoTexto
                    icone={Wrench}
                    type="number"
                    placeholder="300"
                    erro={errors.intervaloRevisaoMinutos?.message}
                    {...register("intervaloRevisaoMinutos")}
                  />
                </div>
              </GradeCampos>
            </SecaoFormulario>
          </div>

          {/* ═══════ FOOTER ═══════ */}
          <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col items-end gap-3 rounded-b-2xl min-h-[80px] justify-center">
            {!confirmarDescarte ? (
              <div className="flex items-center gap-4 w-full justify-between md:justify-end">
                <button
                  type="button"
                  onClick={lidarComTentativaFechamento}
                  className="px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: "var(--cor-primaria)" }}
                  className="px-8 py-2.5 flex-1 md:flex-none justify-center hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save size={16} strokeWidth={3} />
                  {estaEditando ? "Salvar Alterações" : "Cadastrar Máquina"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-2 w-full animate-in slide-in-from-bottom-2 fade-in duration-300">
                <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                  <button
                    type="button"
                    onClick={fecharModalRealmente}
                    className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    Descartar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => definirConfirmarDescarte(false)}
                    className="px-8 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg"
                  >
                    Continuar Editando
                  </button>
                </div>
                {isDirty && (
                  <span className="text-[9px] font-black text-red-600/70 dark:text-red-500/50 uppercase tracking-[0.2em] mr-2">
                    Há alterações não salvas que serão perdidas
                  </span>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </Dialogo>
  );
}
