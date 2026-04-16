import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, User, Mail, Phone, ShieldCheck, Briefcase, FileText } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { Cliente, StatusComercial, BaseLegalLGPD } from "../tipos";
import { esquemaCliente, TipoDadosCliente } from "../esquemas";
import { registrar } from "@/compartilhado/utilitarios/registrador";

interface PropriedadesFormularioCliente {
  aberto: boolean;
  clienteEditando: Cliente | null;
  /**
   * @lgpd Base legal: Execução de contrato (Art. 7º, V) / Obrigao legal (Art. 7º, II)
   * @lgpd Finalidade: Gestão de orçamentos, pedidos e faturamento comercial
   * @lgpd Retenção: Dados fiscais retidos por 5 anos (Lei 9.430/1996)
   * @param dados Dados parciais do cliente
   */
  aoSalvar: (dados: Partial<Cliente>) => Promise<any>;
  aoCancelar: () => void;
}

export function FormularioCliente({ aberto, clienteEditando, aoSalvar, aoCancelar }: PropriedadesFormularioCliente) {
  const estaEditando = Boolean(clienteEditando);
  const [confirmarDescarte, definirConfirmarDescarte] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TipoDadosCliente>({
    resolver: zodResolver(esquemaCliente) as any,
    mode: "onChange",
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      statusComercial: StatusComercial.PROSPECT,
      baseLegal: BaseLegalLGPD.EXECUCAO_CONTRATO,
      finalidadeColeta: "Gestão de pedidos e orçamentos de impressão 3D.",
      prazoRetencaoMeses: 60,
    },
  });

  useEffect(() => {
    if (aberto) {
      if (clienteEditando) {
        reset({
          nome: clienteEditando.nome,
          email: clienteEditando.email,
          telefone: clienteEditando.telefone,
          statusComercial: clienteEditando.statusComercial,
          observacoesCRM: clienteEditando.observacoesCRM,
          baseLegal: clienteEditando.baseLegal,
          finalidadeColeta: clienteEditando.finalidadeColeta,
          prazoRetencaoMeses: clienteEditando.prazoRetencaoMeses,
        });
      } else {
        reset({
          nome: "",
          email: "",
          telefone: "",
          statusComercial: StatusComercial.PROSPECT,
          baseLegal: BaseLegalLGPD.EXECUCAO_CONTRATO,
          finalidadeColeta: "Gestão de pedidos e orçamentos de impressão 3D.",
          prazoRetencaoMeses: 60,
        });
      }
      definirConfirmarDescarte(false);
    }
  }, [aberto, clienteEditando, reset]);

  const lidarComEnvio = async (dados: TipoDadosCliente) => {
    try {
      await aoSalvar(dados as any);
      aoCancelar();
    } catch (erro) {
      registrar.error({ rastreioId: "sistema", servico: "FormularioCliente" }, "Erro ao salvar cliente", erro);
    }
  };

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

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      titulo={estaEditando ? "Refinar Registro de Cliente" : "Novo Cadastro Premium"}
      larguraMax="max-w-3xl"
    >
      <form onSubmit={handleSubmit(lidarComEnvio)} className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-6 md:p-8 space-y-10">
          {/* SEÇÃO 1: DADOS BÁSICOS */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <User size={16} />
              </span>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Identificação & Contato
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CampoTexto
                rotulo="Nome Completo / Razão Social"
                icone={User}
                placeholder="Ex: João Silva da Tecnologia"
                erro={errors.nome?.message}
                className="col-span-2"
                {...register("nome")}
              />

              <CampoTexto
                rotulo="Canal de E-mail"
                icone={Mail}
                type="email"
                placeholder="joao@exemplo.com"
                erro={errors.email?.message}
                {...register("email")}
              />

              <CampoTexto
                rotulo="Telefone / WhatsApp"
                icone={Phone}
                placeholder="(11) 99999-9999"
                erro={errors.telefone?.message}
                {...register("telefone")}
              />
            </div>
          </section>

          {/* SEÇÃO 2: CRM & ESTRATÉGIA COMERCIAL */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Briefcase size={16} />
              </span>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Inteligência CRM</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  Status Comercial
                </label>
                <select
                  {...register("statusComercial")}
                  className="w-full h-12 bg-gray-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                >
                  {Object.values(StatusComercial).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <CampoTexto
                rotulo="Observações Internas (Privado)"
                icone={FileText}
                placeholder="Notas sobre preferências, histórico ou negociações..."
                erro={errors.observacoesCRM?.message}
                {...register("observacoesCRM")}
              />
            </div>
          </section>

          {/* SEÇÃO 3: SEGURANÇA & PRIVACIDADE (LGPD) */}
          <section className="space-y-6 bg-emerald-500/[0.03] p-6 rounded-2xl border border-emerald-500/10">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <ShieldCheck size={16} />
              </span>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Conformidade LGPD (Regra 9.0)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  Base Legal de Tratamento
                </label>
                <select
                  {...register("baseLegal")}
                  className="w-full h-12 bg-white dark:bg-[#121214] border border-zinc-100 dark:border-white/5 rounded-xl px-4 text-xs font-bold outline-none"
                >
                  <option value={BaseLegalLGPD.EXECUCAO_CONTRATO}>Execução de Contrato (Art. 7º, V)</option>
                  <option value={BaseLegalLGPD.CONSENTIMENTO}>Consentimento (Art. 7º, I)</option>
                  <option value={BaseLegalLGPD.OBRIGACAO_LEGAL}>Obrigação Legal (Art. 7º, II)</option>
                  <option value={BaseLegalLGPD.INTERESSE_LEGITIMO}>Interesse Legítimo (Art. 7º, IX)</option>
                </select>
              </div>

              <CampoTexto
                rotulo="Finalidade Específica"
                icone={ShieldCheck}
                placeholder="Ex: Gestão de orçamentos e pedidos."
                erro={errors.finalidadeColeta?.message}
                {...register("finalidadeColeta")}
              />

              <div className="col-span-2">
                <p className="text-[9px] font-medium text-gray-400 dark:text-zinc-500 italic leading-relaxed">
                  Ao coletar dados, garantimos a retenção mínima de 60 meses por obrigação fiscal. Os dados poderão ser
                  anonimizados ou excluídos a pedido do titular via central de privacidade.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RODAPÉ PADRONIZADO v9.0 */}
        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col items-end gap-3 rounded-b-2xl min-h-[80px] justify-center">
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
                {estaEditando ? "Salvar Alterações CRM" : "Finalizar Cadastro Premium"}
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
            </div>
          )}
        </div>
      </form>
    </Dialogo>
  );
}
