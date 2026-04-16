import { useState, useMemo, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";
import { Save, Plus, Building2, Layers, Tag, Weight, BoxSelect, Beaker } from "lucide-react";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";

// --- ESQUEMA DE VALIDAO (ZOD) ---
const esquemaMaterial = z.object({
  tipo: z.enum(["FDM", "SLA"]),
  fabricante: z.string().min(1, "O fabricante é obrigatório."),
  tipoMaterial: z.string().min(1, "O tipo de material é obrigatório."),
  nomePersonalizado: z.string().optional(),
  cor: z.string().optional(),
  preco: z.number({ message: "Valor numérico obrigatório." }).positive("O valor deve ser maior que zero."),
  peso: z.number({ message: "Quantidade num. obrigatória." }).positive("A quantidade deve ser maior que zero."),
  estoqueInicial: z
    .number({ message: "Estoque num. obrigatório." })
    .int("Deixe sem casas decimais.")
    .min(0, "O estoque não pode ser negativo."),
  usarGramas: z.boolean(),
});

type FormValues = z.infer<typeof esquemaMaterial>;

// --- LISTAS DE SUGESTÃO ---
const FABRICANTES = [
  { valor: "Voolt3D", rotulo: "Voolt3D" },
  { valor: "3D Fila", rotulo: "3D Fila" },
  { valor: "Creality", rotulo: "Creality" },
  { valor: "Esun", rotulo: "Esun" },
  { valor: "Sunlu", rotulo: "Sunlu" },
  { valor: "Flashforge", rotulo: "Flashforge" },
  { valor: "Prusa", rotulo: "Prusa Research" },
  { valor: "GTMax", rotulo: "GTMax" },
  { valor: "Nacional", rotulo: "Genérico Nacional" },
  { valor: "Importado", rotulo: "Genérico Importado" },
];

const MATERIAIS_FDM = [
  { valor: "PLA", rotulo: "PLA (Ácido Polilático)" },
  { valor: "PLA Silk", rotulo: "PLA Silk (Acabamento Seda)" },
  { valor: "PLA Matte", rotulo: "PLA Matte (Fosco)" },
  { valor: "PETG", rotulo: "PETG (Polietileno Tereftalato Glicol)" },
  { valor: "ABS", rotulo: "ABS (Acrilonitrila Butadieno Estireno)" },
  { valor: "ASA", rotulo: "ASA (Resistente UV)" },
  { valor: "TPU", rotulo: "TPU (Flexível)" },
  { valor: "Nylon", rotulo: "Nylon (Poliamida - PA)" },
  { valor: "PC", rotulo: "PC (Policarbonato)" },
  { valor: "HIPS", rotulo: "HIPS (Suporte Solúvel em Limoneno)" },
  { valor: "Wood", rotulo: "PLA Wood (Composto com Madeira)" },
  { valor: "Carbon Fiber", rotulo: "Fibra de Carbono (PLA/PETG/Nylon CF)" },
];

const MATERIAIS_SLA = [
  { valor: "Standard", rotulo: "Resina Padrão" },
  { valor: "ABS-Like", rotulo: "Resina ABS-Like (Alta Resistência)" },
  { valor: "Water Washable", rotulo: "Resina Lavável em Água" },
  { valor: "Tough", rotulo: "Resina Tough (Alta Tenacidade)" },
  { valor: "Flexible", rotulo: "Resina Flexível" },
  { valor: "Castable", rotulo: "Resina Calcinável (Joias/Dental)" },
  { valor: "Dental", rotulo: "Resina Dental" },
  { valor: "High Temp", rotulo: "Resina Alta Temperatura" },
];

// --- PALETA DE CORES ---
const CORES_PREDEFINIDAS = [
  "#FFFFFF",
  "#F5DEB3",
  "#C0C0C0",
  "#FFFF00",
  "#FFD700",
  "#FFA500",
  "#FF4500",
  "#8B0000",
  "#800080",
  "#4B0082",
  "#00FFFF",
  "#00BFFF",
  "#0000FF",
  "#000080",
  "#8B4513",
  "#5D4037",
  "#808000",
  "#808080",
  "#708090",
  "#2F4F4F",
  "#000000",
  "#FA8072",
  "#FFC0CB",
  "#FF00FF",
  "#FF0000",
  "#32CD32",
  "#008000",
  "#006400",
];

interface PropriedadesFormularioMaterial {
  aberto: boolean;
  /**
   * @lgpd Base legal: Execução de contrato (Art. 7º, V)
   * @lgpd Finalidade: Gestão técnica de insumos de impressão 3D (estoque e custo)
   * @param dados Dados brutos do material
   */
  aoSalvar: (dados: any) => Promise<any> | void;
  aoCancelar: () => void;
  materialEditando?: Material | null;
}

export function FormularioMaterial({ aberto, aoSalvar, aoCancelar, materialEditando }: PropriedadesFormularioMaterial) {
  const estaEditando = Boolean(materialEditando);

  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);
  const inputCorRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(esquemaMaterial),
    mode: "onChange",
    defaultValues: {
      tipo: "FDM",
      fabricante: "",
      tipoMaterial: "",
      nomePersonalizado: "",
      cor: "",
      preco: "" as unknown as number,
      peso: 1000,
      estoqueInicial: 1,
      usarGramas: false,
    },
  });

  // Observar valores que precisam atualizar a UI
  const tipoSelecionado = watch("tipo");
  const fabricanteSelecionado = watch("fabricante");
  const tipoMaterialSelecionado = watch("tipoMaterial");

  const corSelecionada = watch("cor");
  const usarGramasSelecionado = watch("usarGramas");

  // Reseta o estado todo quando abre/fecha ou altera material editado
  useEffect(() => {
    if (aberto) {
      if (materialEditando) {
        const nomeFinalEsperado = `${materialEditando.tipoMaterial || ""} ${materialEditando.fabricante || ""}`.trim();
        const temNomeCustomizado =
          materialEditando.nome !== nomeFinalEsperado && materialEditando.nome !== materialEditando.tipoMaterial;

        reset({
          tipo: materialEditando.tipo,
          fabricante: materialEditando.fabricante || "",
          tipoMaterial: materialEditando.tipoMaterial || "",
          nomePersonalizado: temNomeCustomizado ? materialEditando.nome : "",
          cor: materialEditando.cor || "",
          preco: materialEditando.precoCentavos ? materialEditando.precoCentavos / 100 : 0,
          peso: materialEditando.pesoGramas,
          estoqueInicial: materialEditando.estoque,
          usarGramas: false,
        });
      } else {
        reset({
          tipo: "FDM",
          fabricante: "",
          tipoMaterial: "",
          nomePersonalizado: "",
          cor: "",
          preco: "" as unknown as number,
          peso: 1000,
          estoqueInicial: 1,
          usarGramas: false,
        });
      }
      definirConfirmarDescarte(false);
    }
  }, [aberto, materialEditando, reset]);

  const opcoesMaterialAtual = useMemo(
    () => (tipoSelecionado === "FDM" ? MATERIAIS_FDM : MATERIAIS_SLA),
    [tipoSelecionado],
  );

  const lidarComEnvioRHF = async (dados: FormValues) => {
    try {
      const corFinal = dados.cor || "#3b82f6";
      const nomeFinal =
        dados.nomePersonalizado || `${dados.tipoMaterial || "Material"} ${dados.fabricante || ""}`.trim();

      await aoSalvar({
        id: materialEditando?.id || crypto.randomUUID(),
        tipo: dados.tipo,
        nome: nomeFinal,
        tipoMaterial: dados.tipoMaterial,
        fabricante: dados.fabricante,
        cor: corFinal,
        precoCentavos: Math.round(Number(dados.preco) * 100),
        pesoGramas: Number(dados.peso),
        estoque: dados.estoqueInicial,
      });
      fecharModalRealmente();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "FormularioMaterial" }, "Erro ao salvar material", erro);
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
      titulo={estaEditando ? "Editar Material" : "Novo Material"}
      larguraMax="max-w-5xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[500px]">
        {/* --- COLUNA ESQUERDA: VISUALIZAÇÃO 3D --- */}
        <div className="bg-gray-50 dark:bg-black/20 border-r border-gray-200 dark:border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              backgroundPosition: "center center",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            }}
          />

          <div className="absolute top-8 inset-x-8 flex bg-white/50 dark:bg-black/20 p-1.5 rounded-xl border border-gray-200 dark:border-white/5 z-20 backdrop-blur-md shadow-inner">
            <button
              type="button"
              onClick={() => setValue("tipo", "FDM", { shouldValidate: true, shouldDirty: true })}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tipoSelecionado === "FDM" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-md ring-1 ring-gray-200 dark:ring-white/10 scale-105" : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
            >
              FILAMENTO
            </button>
            <button
              type="button"
              onClick={() => setValue("tipo", "SLA", { shouldValidate: true, shouldDirty: true })}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tipoSelecionado === "SLA" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-md ring-1 ring-gray-200 dark:ring-white/10 scale-105" : "text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300"}`}
            >
              RESINA
            </button>
          </div>

          <div className="relative z-10 my-auto py-12 transition-all duration-700 hover:scale-110">
            {tipoSelecionado === "FDM" ? (
              <Carretel
                cor={corSelecionada || "#27272a"}
                tamanho={220}
                porcentagem={corSelecionada ? 100 : 0}
                className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] filter contrast-125"
              />
            ) : (
              <GarrafaResina
                cor={corSelecionada || "#27272a"}
                tamanho={180}
                porcentagem={corSelecionada ? 100 : 0}
                className="drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] filter contrast-125"
              />
            )}
          </div>

          <div className="absolute bottom-8 text-center flex flex-col items-center gap-1">
            <div className="flex items-center gap-3 bg-white/80 dark:bg-black/40 px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 backdrop-blur-md shadow-sm">
              <div
                className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20 shadow-inner"
                style={{ backgroundColor: corSelecionada || "#27272a" }}
              />
              <span className="text-[11px] font-black text-gray-900 dark:text-white tracking-[0.2em] uppercase">
                {corSelecionada ? corSelecionada.toUpperCase() : "VAZIO"}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-gray-200/30 dark:from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* --- COLUNA DIREITA: FORMULÁRIO --- */}
        <form onSubmit={handleSubmit(lidarComEnvioRHF)} className="flex flex-col bg-transparent">
          <div className="flex-1 p-5 md:p-6 space-y-6">
            {/* SEÇÃO: IDENTIFICAÇÃO */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 text-gray-400 dark:text-zinc-500">
                IDENTIFICAÇÃO PRINCIPAL
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 px-1 mb-1">
                    Fabricante / Marca
                  </label>
                  <Combobox
                    opcoes={FABRICANTES}
                    valor={fabricanteSelecionado}
                    aoAlterar={(val) => setValue("fabricante", val, { shouldValidate: true, shouldDirty: true })}
                    placeholder="Selecione ou digite..."
                    permitirNovo={true}
                    icone={Building2}
                  />
                  {errors?.fabricante && (
                    <span className="text-[9px] font-black uppercase text-red-500 mt-2 block tracking-wider">
                      {errors.fabricante.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 px-1 mb-1">
                    Tipo de Material
                  </label>
                  <Combobox
                    opcoes={opcoesMaterialAtual}
                    valor={tipoMaterialSelecionado}
                    aoAlterar={(val) => setValue("tipoMaterial", val, { shouldValidate: true, shouldDirty: true })}
                    placeholder="Selecione ou digite..."
                    permitirNovo={true}
                    icone={Layers}
                  />
                  {errors?.tipoMaterial && (
                    <span className="text-[9px] font-black uppercase text-red-500 mt-2 block tracking-wider">
                      {errors.tipoMaterial.message}
                    </span>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 px-1 mb-1">
                    Apelido (Nome amigável)
                  </label>
                  <CampoTexto
                    icone={Tag}
                    placeholder={
                      tipoMaterialSelecionado && fabricanteSelecionado
                        ? `Ex: ${tipoMaterialSelecionado} Premium ${fabricanteSelecionado}`
                        : "Deixe em branco para auto-gerar o nome"
                    }
                    erro={errors.nomePersonalizado?.message}
                    {...register("nomePersonalizado")}
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO: CORES */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 text-gray-400 dark:text-zinc-500">
                APARÊNCIA VISUAL
              </h4>
              <div className="bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-inner">
                <div className="flex flex-wrap gap-3">
                  {CORES_PREDEFINIDAS.map((corPreset) => (
                    <button
                      key={corPreset}
                      type="button"
                      onClick={() => setValue("cor", corPreset, { shouldDirty: true })}
                      className={`
                        w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 active:scale-95 shadow-sm
                        ${corSelecionada === corPreset ? "border-sky-500 dark:border-sky-400 scale-110 shadow-lg ring-4 ring-sky-500/10" : "border-white dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20"}
                      `}
                      style={{ backgroundColor: corPreset }}
                      title={corPreset}
                    />
                  ))}

                  <div className="relative">
                    <input
                      ref={inputCorRef}
                      type="color"
                      value={corSelecionada || "#000000"}
                      onChange={(e) => setValue("cor", e.target.value, { shouldDirty: true })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <button
                      type="button"
                      className={`
                        w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all hover:scale-110 shadow-sm
                        bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 text-gray-400 dark:text-zinc-600
                        ${!CORES_PREDEFINIDAS.includes(corSelecionada || "") && corSelecionada ? "border-sky-500 dark:border-sky-400 shadow-lg scale-110 ring-4 ring-sky-500/10" : "border-white dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20"}
                      `}
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO: PRECIFICAÇÃO */}
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/5 pb-2 text-gray-400 dark:text-zinc-500">
                PRECIFICAÇÃO & INVENTÁRIO
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 px-1 mb-1">
                    Custo de Aquisição
                  </label>
                  <CampoMonetario
                    placeholder="Ex: 89,90"
                    erro={errors.preco?.message}
                    {...register("preco", { valueAsNumber: true })}
                  />
                </div>

                <div className="relative space-y-1.5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 px-1">
                      Peso / Volume
                    </label>
                    {tipoSelecionado === "SLA" && (
                      <button
                        type="button"
                        onClick={() => setValue("usarGramas", !usarGramasSelecionado)}
                        className="text-[9px] font-black text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 uppercase transition-colors tracking-widest"
                      >
                        {usarGramasSelecionado ? "Usar ML" : "Usar GR"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <CampoTexto
                      icone={tipoSelecionado === "SLA" && !usarGramasSelecionado ? Beaker : Weight}
                      type="number"
                      placeholder="1000"
                      erro={errors.peso?.message}
                      {...register("peso", { valueAsNumber: true })}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none tracking-widest uppercase">
                      {tipoSelecionado === "SLA" && !usarGramasSelecionado ? "ML" : "G"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 px-1 mb-1">
                    Estoque Inicial
                  </label>
                  <CampoTexto
                    icone={BoxSelect}
                    type="number"
                    placeholder="1"
                    erro={errors.estoqueInicial?.message}
                    {...register("estoqueInicial", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RODAPÉ */}
          <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col items-end gap-2 rounded-br-2xl min-h-[70px] justify-center">
            {!confirmarDescarte ? (
              <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                <button
                  type="button"
                  onClick={lidarComTentativaFechamento}
                  className="px-6 py-2.5 flex-1 md:flex-none text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: "var(--cor-primaria)" }}
                  className="px-8 py-2.5 flex-1 md:flex-none justify-center hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save size={16} strokeWidth={3} />
                  {estaEditando ? "Salvar Alterações" : "Cadastrar Material"}
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
