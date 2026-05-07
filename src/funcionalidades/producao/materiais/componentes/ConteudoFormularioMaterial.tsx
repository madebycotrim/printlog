import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Building2, Layers, Tag, Weight, BoxSelect, Sparkles } from "lucide-react";
import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Material } from "../tipos";
import { FABRICANTES, MATERIAIS_FDM, MATERIAIS_SLA, CORES_PREDEFINIDAS } from "@/funcionalidades/producao/materiais/constantes";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { CampoMonetario } from "@/compartilhado/componentes/CampoMonetario";
import { Combobox } from "@/compartilhado/componentes/Combobox";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";

const esquemaMaterial = z.object({
  tipo: z.enum(["FDM", "SLA"]),
  fabricante: z.string().min(1, "O fabricante é obrigatório."),
  tipoMaterial: z.string().min(1, "O tipo de material é obrigatório."),
  nomePersonalizado: z.string().optional(),
  cor: z.string().optional(),
  preco: z.number().positive(),
  peso: z.number().positive(),
  estoqueInicial: z.number().min(0),
});

type FormValues = z.infer<typeof esquemaMaterial>;

interface ConteudoFormularioMaterialProps {
  material: Material;
  aoSalvar: (dados: any) => Promise<void>;
  aoCancelar: () => void;
  corMaterial?: string;
  aoMudarCor?: (cor: string) => void;
}

export function ConteudoFormularioMaterial({ 
  material, 
  aoSalvar, 
  aoCancelar, 
  corMaterial = "#6366f1",
  aoMudarCor
}: ConteudoFormularioMaterialProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(esquemaMaterial),
    defaultValues: {
      tipo: material.tipo,
      fabricante: material.fabricante || "",
      tipoMaterial: material.tipoMaterial || "",
      nomePersonalizado: material.nome !== `${material.tipoMaterial} ${material.fabricante}` ? material.nome : "",
      cor: material.cor || "",
      preco: material.precoCentavos / 100,
      peso: material.pesoGramas,
      estoqueInicial: material.estoque,
    },
  });

  useEffect(() => {
    reset({
      tipo: material.tipo,
      fabricante: material.fabricante || "",
      tipoMaterial: material.tipoMaterial || "",
      nomePersonalizado: material.nome !== `${material.tipoMaterial} ${material.fabricante}` ? material.nome : "",
      cor: material.cor || "",
      preco: material.precoCentavos / 100,
      peso: material.pesoGramas,
      estoqueInicial: material.estoque,
    });
  }, [material, reset]);

  const tipoSelecionado = watch("tipo");
  const corSelecionada = watch("cor") || corMaterial;
  const opcoesMaterialAtual = useMemo(() => (tipoSelecionado === "FDM" ? MATERIAIS_FDM : MATERIAIS_SLA), [tipoSelecionado]);

  const enviar = async (dados: FormValues) => {
    const corFinal = dados.cor || corMaterial;
    const nomeFinal = dados.nomePersonalizado || `${dados.tipoMaterial} ${dados.fabricante}`.trim();

    await aoSalvar({
      ...material,
      tipo: dados.tipo,
      nome: nomeFinal,
      tipoMaterial: dados.tipoMaterial,
      fabricante: dados.fabricante,
      cor: corFinal,
      precoCentavos: Math.round(Number(dados.preco) * 100),
      pesoGramas: Number(dados.peso),
      estoque: dados.estoqueInicial,
    });
  };

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
      {/* Lado Esquerdo: Preview (Restaurado) */}
      <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-white/[0.02] rounded-2xl border border-zinc-100 dark:border-white/5 space-y-6">
        <motion.div 
          key={corSelecionada + tipoSelecionado}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 transition-transform duration-700 hover:scale-110"
        >
          {tipoSelecionado === "FDM" ? (
            <Carretel cor={corSelecionada} tamanho={160} porcentagem={100} />
          ) : (
            <GarrafaResina cor={corSelecionada} tamanho={140} porcentagem={100} />
          )}
        </motion.div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-white/5 shadow-sm">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: corSelecionada }} />
          <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest tabular-nums">{corSelecionada}</span>
        </div>
      </div>

      {/* Lado Direito: Formulário Fluido */}
      <div className="flex flex-col gap-8">
        {/* Identificação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Fabricante</label>
            <Combobox 
              opcoes={FABRICANTES} 
              valor={watch("fabricante")} 
              aoAlterar={(val) => setValue("fabricante", val, { shouldDirty: true })} 
              permitirNovo={true} 
              icone={Building2} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Material</label>
            <Combobox 
              opcoes={opcoesMaterialAtual} 
              valor={watch("tipoMaterial")} 
              aoAlterar={(val) => setValue("tipoMaterial", val, { shouldDirty: true })} 
              permitirNovo={true} 
              icone={Layers} 
            />
          </div>
          <div className="md:col-span-2">
            <CampoTexto 
              rotulo="Apelido / Identificação" 
              icone={Tag} 
              placeholder="Ex: PLA Vermelho Profissional" 
              {...register("nomePersonalizado")} 
            />
          </div>
        </div>

        {/* Paleta Maker */}
        <div className="space-y-4 p-6 bg-zinc-50 dark:bg-white/[0.01] rounded-2xl border border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: corSelecionada }} />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Paleta de Cores</h4>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-3">
            {CORES_PREDEFINIDAS.map((c: string) => (
              <motion.button 
                key={c} 
                type="button" 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setValue("cor", c, { shouldDirty: true });
                  aoMudarCor?.(c);
                }} 
                className={`aspect-square rounded-xl border-2 transition-all relative ${
                  corSelecionada === c ? "border-transparent" : "border-transparent dark:border-white/5"
                }`} 
                style={{ 
                  backgroundColor: c,
                  boxShadow: corSelecionada === c ? `0 0 15px ${c}66` : 'none',
                  borderColor: corSelecionada === c ? '#fff' : undefined
                }} 
              >
                {corSelecionada === c && (
                  <motion.div 
                    layoutId="paleta-ativo" 
                    className="absolute -inset-1.5 border-2 rounded-2xl pointer-events-none" 
                    style={{ borderColor: c }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CampoMonetario rotulo="Preço" erro={errors.preco?.message} {...register("preco", { setValueAs: Number })} />
          <CampoTexto rotulo={tipoSelecionado === "FDM" ? "Gramas" : "ML"} type="number" icone={Weight} {...register("peso", { setValueAs: Number })} />
          <CampoTexto rotulo="Estoque" type="number" icone={BoxSelect} {...register("estoqueInicial", { setValueAs: Number })} />
        </div>

        {/* Ações */}
        <div className="pt-6 mt-auto flex items-center gap-4 border-t border-zinc-100 dark:border-white/5">
          <button 
            type="button" 
            onClick={aoCancelar} 
            className="px-8 py-4 text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="flex-1 text-white py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl transition-all disabled:opacity-30"
            style={{ 
              backgroundColor: corSelecionada,
              boxShadow: `0 15px 30px -10px ${corSelecionada}66` 
            }}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-widest">Salvar Alterações</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </form>
  );
}
