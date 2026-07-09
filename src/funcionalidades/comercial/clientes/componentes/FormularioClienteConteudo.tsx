import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, User, Mail, Phone, FileText, Star } from "lucide-react";
import { CampoTexto } from "@/compartilhado/componentes";
import { AcoesDescarte } from "@/compartilhado/componentes";
import { SecaoFormulario, GradeCampos } from "@/compartilhado/componentes";
import { Cliente } from "../tipos";
import { BaseLegalLGPD } from "@/compartilhado/tipos/modelos";
import { esquemaCliente, TipoDadosCliente } from "../esquemas";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { formatarTelefone } from "@/compartilhado/utilitarios/formatadores";

interface PropriedadesFormularioClienteConteudo {
  clienteEditando: Cliente | null;
  aoSalvar: (dados: Partial<Cliente>) => Promise<any>;
  aoCancelar: () => void;
}

export function FormularioClienteConteudo({ clienteEditando, aoSalvar, aoCancelar }: PropriedadesFormularioClienteConteudo) {
  const estaEditando = Boolean(clienteEditando);
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<TipoDadosCliente>({
    resolver: zodResolver(esquemaCliente),
    mode: "onChange",
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      tipo: "B2C",
      baseLegal: BaseLegalLGPD.EXECUCAO_CONTRATO,
      idConsentimento: crypto.randomUUID(),
      finalidadeColeta: "Gestão de pedidos e orçamentos de impressão 3D.",
      prazoRetencaoMeses: 60,
      observacoesCRM: "",
      fiel: false,
    },
  });

  useEffect(() => {
    const valoresIniciais = clienteEditando ? {
      nome: clienteEditando.nome || "",
      email: clienteEditando.email || "",
      telefone: clienteEditando.telefone || "",
      tipo: (clienteEditando.tipo || "B2C") as "B2B" | "B2C",
      observacoesCRM: clienteEditando.observacoesCRM || "",
      baseLegal: clienteEditando.baseLegal || BaseLegalLGPD.EXECUCAO_CONTRATO,
      finalidadeColeta: clienteEditando.finalidadeColeta || "Gestão de pedidos e orçamentos de impressão 3D.",
      prazoRetencaoMeses: clienteEditando.prazoRetencaoMeses || 60,
      fiel: clienteEditando.fiel || false,
    } : {
      nome: "",
      email: "",
      telefone: "",
      tipo: "B2C" as "B2B" | "B2C",
      observacoesCRM: "",
      baseLegal: BaseLegalLGPD.EXECUCAO_CONTRATO,
      finalidadeColeta: "Gestão de pedidos e orçamentos de impressão 3D.",
      prazoRetencaoMeses: 60,
      fiel: false,
    };

    reset(valoresIniciais);
  }, [clienteEditando, reset]);

  const lidarComEnvio = async (dados: TipoDadosCliente) => {
    try {
      await aoSalvar(dados as any);
      aoCancelar();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "FormularioClienteConteudo" }, "Erro ao salvar cliente", erro);
    }
  };

  const lidarComTentativaFechamento = () => {
    const valores = control._formValues;
    const temConteudoReal = valores.nome || valores.email || valores.telefone || valores.observacoesCRM;

    if (isDirty && (estaEditando || temConteudoReal)) {
      definirConfirmarDescarte(true);
    } else {
      aoCancelar();
    }
  };

  return (
    <form onSubmit={handleSubmit(lidarComEnvio)} className="flex flex-col bg-white dark:bg-[#121214] flex-1">
      <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
        <SecaoFormulario titulo="Dados de Identificação">
          <GradeCampos colunas={2}>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Perfil Comercial do Cliente</label>
              <div className="grid grid-cols-2 gap-1 bg-zinc-50 dark:bg-zinc-900/50 p-1 rounded-xl border border-borda-sutil">
                <button
                  type="button"
                  onClick={() => setValue("tipo", "B2C", { shouldDirty: true })}
                  className={`py-2 px-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    watch("tipo") === "B2C"
                      ? "bg-white dark:bg-zinc-800 text-sky-500 border border-borda-sutil dark:border-white/5 shadow-sm"
                      : "text-zinc-500 hover:text-primary dark:hover:text-white border border-transparent"
                  }`}
                >
                  <span>B2C (Consumidor)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("tipo", "B2B", { shouldDirty: true })}
                  className={`py-2 px-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    watch("tipo") === "B2B"
                      ? "bg-white dark:bg-zinc-800 text-indigo-500 border border-borda-sutil dark:border-white/5 shadow-sm"
                      : "text-zinc-500 hover:text-primary dark:hover:text-white border border-transparent"
                  }`}
                >
                  <span>B2B (Empresa)</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <CampoTexto
                rotulo="Nome Completo"
                icone={User}
                placeholder="Ex: João Silva"
                erro={errors.nome?.message}
                className="w-full"
                {...register("nome")}
              />
            </div>

            <CampoTexto
              rotulo="E-mail"
              icone={Mail}
              type="email"
              placeholder="joao@exemplo.com"
              erro={errors.email?.message}
              {...register("email")}
            />

            <CampoTexto
              rotulo="WhatsApp / Celular"
              icone={Phone}
              placeholder="(11) 99999-9999"
              erro={errors.telefone?.message}
              {...register("telefone", {
                onChange: (e) => {
                  const formatado = formatarTelefone(e.target.value);
                  setValue("telefone", formatado);
                }
              })}
            />
          </GradeCampos>
        </SecaoFormulario>

        <SecaoFormulario titulo="Notas e CRM">
          <div className="space-y-6">
            <CampoTexto
              rotulo="Notas do Perfil (Útil para o dia a dia)"
              icone={FileText}
              placeholder="Ex: Gosta de peças em resina, prefere retirada, costuma pedir brindes..."
              erro={errors.observacoesCRM?.message}
              {...register("observacoesCRM")}
            />

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Classificação de Fidelidade</label>
              <button
                type="button"
                onClick={() => setValue("fiel", !getValues("fiel"), { shouldDirty: true })}
                className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  watch("fiel")
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-md shadow-amber-500/5 scale-[1.01]"
                    : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 hover:text-primary dark:hover:text-white border-borda-sutil"
                }`}
              >
                <Star size={14} className={watch("fiel") ? "fill-amber-500 text-amber-500" : "text-zinc-500"} />
                <span>{watch("fiel") ? "Cliente VIP / Fiel Ativado" : "Marcar como Cliente VIP / Fiel"}</span>
              </button>
            </div>
          </div>
        </SecaoFormulario>
      </div>

      <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col gap-4">
        {!confirmarDescarte ? (
          <div className="flex items-center gap-3 w-full justify-between md:justify-end">
            <button
              type="button"
              onClick={lidarComTentativaFechamento}
              className="px-6 py-2.5 flex-1 md:flex-none text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 flex-1 md:flex-none justify-center hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg bg-indigo-600 shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Save size={16} strokeWidth={3} />
              {estaEditando ? "Salvar Alterações" : "Cadastrar Cliente"}
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
  );
}
