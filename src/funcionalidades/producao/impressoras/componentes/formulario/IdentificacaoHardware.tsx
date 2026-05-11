import { Layers, Droplet, Building2, Tag } from "lucide-react";
import { SecaoFormulario, GradeCampos } from "@/compartilhado/componentes";
import { Combobox } from "@/compartilhado/componentes";
import { CampoTexto } from "@/compartilhado/componentes";

interface PropriedadesIdentificacao {
  tecnologiaAtiva: string;
  marcaAtiva: string;
  modeloAtivo: string;
  opcoesFabricante: any[];
  opcoesModelo: any[];
  errors: any;
  register: any;
  setValue: any;
  aoAlterarModelo: (val: string) => void;
  esconderTecnologia?: boolean;
}

export function IdentificacaoHardware({
  tecnologiaAtiva,
  marcaAtiva,
  modeloAtivo,
  opcoesFabricante,
  opcoesModelo,
  errors,
  register,
  setValue,
  aoAlterarModelo,
  esconderTecnologia = false,
}: PropriedadesIdentificacao) {
  return (
    <SecaoFormulario titulo="Identificação de Hardware">
      {!esconderTecnologia && (
        <div className="flex bg-gray-50 dark:bg-black/30 p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-inner w-full md:w-max mx-auto overflow-hidden mb-6">
          <button
            type="button"
            onClick={() => {
              setValue("tecnologia", "FDM", { shouldValidate: true, shouldDirty: true });
              setValue("marca", "", { shouldDirty: true });
              setValue("modeloBase", "", { shouldDirty: true });
              setValue("imagemUrl", "", { shouldDirty: true });
            }}
            className={`px-8 py-2.5 text-[10px] font-black rounded-xl transition-all duration-300 flex items-center gap-2 uppercase tracking-widest ${
              tecnologiaAtiva === "FDM"
                ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xl ring-1 ring-black/5 dark:ring-white/10"
                : "text-gray-400 dark:text-zinc-600 hover:text-gray-900 dark:hover:text-white"
            }`}
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
            className={`px-8 py-2.5 text-[10px] font-black rounded-xl transition-all duration-300 flex items-center gap-2 uppercase tracking-widest ${
              tecnologiaAtiva === "SLA"
                ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xl ring-1 ring-black/5 dark:ring-white/10"
                : "text-gray-400 dark:text-zinc-600 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Droplet size={14} strokeWidth={3} />
            RESINA (SLA)
          </button>
        </div>
      )}

      <GradeCampos colunas={2}>
        <div className="space-y-2">
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Marca
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

        <div className="space-y-2">
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Modelo
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
  );
}
