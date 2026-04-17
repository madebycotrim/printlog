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
import { AcoesDescarte } from "@/compartilhado/componentes/AcoesDescarte";
import { Material } from "@/funcionalidades/producao/materiais/tipos";
import { registrar } from "@/compartilhado/utilitarios/registrador";

// --- ESQUEMA DE VALIDAÇÃO (ZOD) ---
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

const CORES_PREDEFINIDAS = [
  "#FFFFFF", "#F5DEB3", "#C0C0C0", "#FFFF00", "#FFD700", "#FFA500", "#FF4500", "#8B0000",
  "#800080", "#4B0082", "#00FFFF", "#00BFFF", "#0000FF", "#000080", "#8B4513", "#5D4037",
  "#808000", "#808080", "#708090", "#2F4F4F", "#000000", "#FA8072", "#FFC0CB", "#FF00FF",
  "#FF0000", "#32CD32", "#008000", "#006400",
];

interface PropriedadesFormularioMaterial {
  aberto: boolean;
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
    control,
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

  const tipoSelecionado = watch("tipo");
  const fabricanteSelecionado = watch("fabricante");
  const tipoMaterialSelecionado = watch("tipoMaterial");
  const corSelecionada = watch("cor");

  useEffect(() => {
    if (aberto) {
      if (materialEditando) {
        reset({
          tipo: materialEditando.tipo,
          fabricante: materialEditando.fabricante || "",
          tipoMaterial: materialEditando.tipoMaterial || "",
          nomePersonalizado: materialEditando.nome !== `${materialEditando.tipoMaterial} ${materialEditando.fabricante}` ? materialEditando.nome : "",
          cor: materialEditando.cor || "",
          preco: materialEditando.precoCentavos / 100,
          peso: materialEditando.pesoGramas,
          estoqueInicial: materialEditando.estoque,
          usarGramas: false,
        });
      } else {
        reset({
          tipo: "FDM", fabricante: "", tipoMaterial: "", nomePersonalizado: "", cor: "",
          preco: "" as unknown as number, peso: 1000, estoqueInicial: 1, usarGramas: false,
        });
      }
      definirConfirmarDescarte(false);
    }
  }, [aberto, materialEditando, reset]);

  const opcoesMaterialAtual = useMemo(() => (tipoSelecionado === "FDM" ? MATERIAIS_FDM : MATERIAIS_SLA), [tipoSelecionado]);

  const lidarComEnvioRHF = async (dados: FormValues) => {
    try {
      const corFinal = dados.cor || "#3b82f6";
      const nomeFinal = dados.nomePersonalizado || `${dados.tipoMaterial} ${dados.fabricante}`.trim();

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
      aoCancelar();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "FormularioMaterial" }, "Erro ao salvar material", erro);
    }
  };

  const lidarComTentativaFechamento = () => {
    const valores = control._formValues;
    const temConteudo = valores.fabricante || valores.tipoMaterial || valores.nomePersonalizado || (valores.preco > 0);

    if (isDirty && (estaEditando || temConteudo)) {
      definirConfirmarDescarte(true);
    } else {
      aoCancelar();
    }
  };

  return (
    <Dialogo aberto={aberto} aoFechar={lidarComTentativaFechamento} titulo={estaEditando ? "Refinar Insumo" : "Novo Material Maker"} larguraMax="max-w-5xl">
       <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[500px] bg-white dark:bg-[#18181b]">
          <div className="bg-zinc-50 dark:bg-black/20 border-r border-zinc-100 dark:border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-8 inset-x-8 flex bg-white/50 dark:bg-black/20 p-1.5 rounded-2xl border border-zinc-200 dark:border-white/5 z-20 backdrop-blur-md">
                <button type="button" onClick={() => setValue("tipo", "FDM", { shouldDirty: true })} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${tipoSelecionado === "FDM" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md" : "text-zinc-400"}`}>FILAMENTO</button>
                <button type="button" onClick={() => setValue("tipo", "SLA", { shouldDirty: true })} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${tipoSelecionado === "SLA" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-md" : "text-zinc-400"}`}>RESINA</button>
             </div>

             <div className="relative z-10 transition-transform duration-700 hover:scale-110">
                {tipoSelecionado === "FDM" ? <Carretel cor={corSelecionada || "#27272a"} tamanho={200} porcentagem={100} /> : <GarrafaResina cor={corSelecionada || "#27272a"} tamanho={160} porcentagem={100} />}
             </div>

             <div className="absolute bottom-8 flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-white/5 shadow-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: corSelecionada || "#27272a" }} />
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{corSelecionada || "Sem Cor"}</span>
             </div>
          </div>

          <form onSubmit={handleSubmit(lidarComEnvioRHF)} className="flex flex-col">
             <div className="flex-1 p-8 space-y-10">
                <section className="space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">O que vamos cadastrar?</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Fabricante</label>
                         <Combobox opcoes={FABRICANTES} valor={fabricanteSelecionado} aoAlterar={(val) => setValue("fabricante", val, { shouldDirty: true })} permitirNovo={true} icone={Building2} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Tipo de Material</label>
                         <Combobox opcoes={opcoesMaterialAtual} valor={tipoMaterialSelecionado} aoAlterar={(val) => setValue("tipoMaterial", val, { shouldDirty: true })} permitirNovo={true} icone={Layers} />
                      </div>
                      <div className="md:col-span-2">
                        <CampoTexto rotulo="Apelido / Nome Amigável" icone={Tag} placeholder="Ex: PLA Amarelo Ouro" {...register("nomePersonalizado")} />
                      </div>
                   </div>
                </section>

                <section className="space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Cor do Insumo</h4>
                   <div className="flex flex-wrap gap-2.5 p-4 bg-zinc-50 dark:bg-black/10 rounded-2xl border border-zinc-100 dark:border-white/5">
                      {CORES_PREDEFINIDAS.map(c => (
                        <button key={c} type="button" onClick={() => setValue("cor", c, { shouldDirty: true })} className={`w-8 h-8 rounded-xl border-2 transition-all ${corSelecionada === c ? "border-sky-500 scale-110 shadow-lg" : "border-white dark:border-zinc-800 hover:border-zinc-300"}`} style={{ backgroundColor: c }} />
                      ))}
                      <input type="color" onChange={(e) => setValue("cor", e.target.value, { shouldDirty: true })} className="w-8 h-8 rounded-xl cursor-pointer border-2 border-zinc-100 dark:border-zinc-800 bg-transparent" />
                   </div>
                </section>

                <section className="space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Preço e Quantidade</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <CampoMonetario rotulo="Preço do Rolo" erro={errors.preco?.message} {...register("preco", { setValueAs: (v: string) => parseFloat(String(v).replace(",", ".")) || 0 })} />
                      <CampoTexto rotulo={`Peso (${tipoSelecionado === "FDM" ? "G" : "ML"})`} type="number" icone={Weight} {...register("peso", { setValueAs: (v: string) => parseFloat(String(v).replace(",", ".")) || 0 })} />
                      <CampoTexto rotulo="Qtd. em Estoque" type="number" icone={BoxSelect} {...register("estoqueInicial", { setValueAs: (v: string) => parseFloat(String(v).replace(",", ".")) || 0 })} />
                   </div>
                </section>
             </div>

             <div className="p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-[#0e0e11]/50 flex flex-col items-end gap-3 rounded-br-[2rem]">
                {!confirmarDescarte ? (
                   <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                      <button type="button" onClick={lidarComTentativaFechamento} className="px-6 py-2.5 text-[11px] font-black uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">Cancelar</button>
                      <button type="submit" style={{ backgroundColor: "var(--cor-primaria)" }} className="px-8 py-3 flex-1 md:flex-none justify-center text-white text-[11px] font-black uppercase rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2">
                         <Save size={16} strokeWidth={3} />
                         {estaEditando ? "Salvar Alterações" : "Cadastrar Insumo"}
                      </button>
                   </div>
                ) : (
                   <AcoesDescarte
                      aoConfirmarDescarte={aoCancelar}
                      aoContinuarEditando={() => definirConfirmarDescarte(false)}
                   />
                )}
             </div>
          </form>
       </div>
    </Dialogo>
  );
}
