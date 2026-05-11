import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes";
import { Save, Building2, Layers, Tag, Weight, BoxSelect } from "lucide-react";
import { Combobox } from "@/compartilhado/componentes";
import { Dialogo } from "@/compartilhado/componentes";
import { CampoTexto } from "@/compartilhado/componentes";
import { CampoMonetario } from "@/compartilhado/componentes";
import { AcoesDescarte } from "@/compartilhado/componentes";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { FABRICANTES, MATERIAIS_FDM, MATERIAIS_SLA, CORES_PREDEFINIDAS } from "../constantes";

// --- ESQUEMA DE VALIDAÇÃO (ZOD) ---
const esquemaMaterial = z.object({
  tipo: z.enum(["FDM", "SLA"]),
  fabricante: z.string().min(1, "O fabricante é obrigatório."),
  tipoMaterial: z.string().min(1, "O tipo de material é obrigatório."),
  nomePersonalizado: z.string().optional(),
  cor: z.string().optional(),
  preco: z.number().positive("O valor deve ser maior que zero."),
  peso: z.number().positive("A quantidade deve ser maior que zero."),
  estoqueInicial: z
    .number()
    .int("Deixe sem casas decimais.")
    .min(0, "O estoque não pode ser negativo."),
});

type FormValues = z.infer<typeof esquemaMaterial>;

interface PropriedadesFormularioMaterial {
  aberto: boolean;
  aoSalvar: (dados: any) => Promise<any> | void;
  aoCancelar: () => void;
}

export function FormularioMaterial({ aberto, aoSalvar, aoCancelar }: PropriedadesFormularioMaterial) {
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);

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
    },
  });

  const tipoSelecionado = watch("tipo");
  const fabricanteSelecionado = watch("fabricante");
  const tipoMaterialSelecionado = watch("tipoMaterial");
  const corSelecionada = watch("cor");

  // Sempre reseta para valores vazios quando o modal de cadastro abre
  useEffect(() => {
    if (aberto) {
      reset({
        tipo: "FDM", fabricante: "", tipoMaterial: "", nomePersonalizado: "", cor: "",
        preco: "" as unknown as number, peso: 1000, estoqueInicial: 1,
      });
      definirConfirmarDescarte(false);
    }
  }, [aberto, reset]);

  const opcoesMaterialAtual = useMemo(() => (tipoSelecionado === "FDM" ? MATERIAIS_FDM : MATERIAIS_SLA), [tipoSelecionado]);

  const lidarComEnvioRHF = async (dados: FormValues) => {
    try {
      const corFinal = dados.cor || "#3b82f6";
      const nomeFinal = dados.nomePersonalizado || `${dados.tipoMaterial} ${dados.fabricante}`.trim();

      await aoSalvar({
        id: crypto.randomUUID(),
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

    if (isDirty && temConteudo) {
      definirConfirmarDescarte(true);
    } else {
      aoCancelar();
    }
  };

  const termoMaterial = tipoSelecionado === "FDM" ? "Filamento" : "Resina";
  const unidadeMedida = tipoSelecionado === "FDM" ? "G" : "ML";

  return (
    <Dialogo aberto={aberto} aoFechar={lidarComTentativaFechamento} titulo="Novo Material Maker" larguraMax="max-w-5xl">
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
                        <CampoTexto 
                           rotulo="Apelido / Nome Amigável" 
                           icone={Tag} 
                           placeholder={tipoSelecionado === "FDM" ? "Ex: PLA Amarelo Ouro" : "Ex: Resina Cinza Padrão"} 
                           {...register("nomePersonalizado")} 
                        />
                      </div>
                   </div>
                </section>

                <section className="space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Cor do {termoMaterial}</h4>
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
                      <Controller
                        control={control}
                        name="preco"
                        render={({ field: { onChange, value, onBlur, ref } }) => (
                          <CampoMonetario 
                            ref={ref}
                            rotulo={`Preço ${tipoSelecionado === "FDM" ? "do Rolo" : "da Garrafa"}`} 
                            erro={errors.preco?.message}
                            value={value ?? ""}
                            onChange={(e) => {
                              const v = e.target.value.replace(",", ".");
                              const num = parseFloat(v);
                              onChange(isNaN(num) ? "" : num);
                            }}
                            onBlur={onBlur}
                          />
                        )}
                      />
                      <CampoTexto rotulo={`${tipoSelecionado === "FDM" ? "Peso" : "Volume"} (${unidadeMedida})`} type="number" icone={Weight} {...register("peso", { valueAsNumber: true })} />
                      <CampoTexto rotulo="Qtd. em Estoque" type="number" icone={BoxSelect} {...register("estoqueInicial", { valueAsNumber: true })} />
                   </div>
                </section>
             </div>

             <div className="p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-[#0e0e11]/50 flex flex-col items-end gap-3 rounded-br-[2rem]">
                {!confirmarDescarte ? (
                   <div className="flex items-center gap-3 w-full justify-between md:justify-end">
                      <button type="button" onClick={lidarComTentativaFechamento} className="px-6 py-2.5 text-[11px] font-black uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">Cancelar</button>
                      <button type="submit" style={{ backgroundColor: "var(--cor-primaria)" }} className="px-8 py-3 flex-1 md:flex-none justify-center text-white text-[11px] font-black uppercase rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2">
                         <Save size={16} strokeWidth={3} />
                         Cadastrar {termoMaterial}
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
