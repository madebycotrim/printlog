import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, User, Mail, Phone, FileText, Shield, Star, Award, Clock, Ban } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { CampoTexto } from "@/compartilhado/componentes/CampoTexto";
import { AcoesDescarte } from "@/compartilhado/componentes/AcoesDescarte";
import { Cliente, StatusComercial, BaseLegalLGPD } from "../tipos";
import { esquemaCliente, TipoDadosCliente } from "../esquemas";
import { registrar } from "@/compartilhado/utilitarios/registrador";

interface PropriedadesFormularioCliente {
  aberto: boolean;
  clienteEditando: Cliente | null;
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
    setValue,
    control,
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
      observacoesCRM: "",
    },
  });

  const statusAtual = useWatch({ control, name: "statusComercial" });

  useEffect(() => {
    if (aberto) {
      definirConfirmarDescarte(false);
      
      const valoresIniciais = clienteEditando ? {
        nome: clienteEditando.nome,
        email: clienteEditando.email,
        telefone: clienteEditando.telefone,
        statusComercial: clienteEditando.statusComercial,
        observacoesCRM: clienteEditando.observacoesCRM || "",
        baseLegal: clienteEditando.baseLegal || BaseLegalLGPD.EXECUCAO_CONTRATO,
        finalidadeColeta: clienteEditando.finalidadeColeta || "Gestão de pedidos e orçamentos de impressão 3D.",
        prazoRetencaoMeses: clienteEditando.prazoRetencaoMeses || 60,
      } : {
        nome: "",
        email: "",
        telefone: "",
        statusComercial: StatusComercial.PROSPECT,
        observacoesCRM: "",
        baseLegal: BaseLegalLGPD.EXECUCAO_CONTRATO,
        finalidadeColeta: "Gestão de pedidos e orçamentos de impressão 3D.",
        prazoRetencaoMeses: 60,
      };

      reset(valoresIniciais);
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

  const lidarComTentativaFechamento = () => {
    const valores = control._formValues;
    const temConteudoReal = valores.nome || valores.email || valores.telefone || valores.observacoesCRM;

    if (isDirty && (estaEditando || temConteudoReal)) {
      definirConfirmarDescarte(true);
    } else {
      aoCancelar();
    }
  };

  const statusOpcoes = [
    { valor: StatusComercial.PROSPECT, label: "Novo / Prospect", icone: Clock, cor: "amber" },
    { valor: StatusComercial.ATIVO, label: "Cliente Ativo", icone: Star, cor: "emerald" },
    { valor: StatusComercial.VIP, label: "Maker VIP", icone: Award, cor: "indigo" },
    { valor: StatusComercial.INATIVO, label: "Inativo", icone: Ban, cor: "gray" },
  ];

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={lidarComTentativaFechamento}
      titulo={estaEditando ? "Refinar Registro de Cliente" : "Novo Cadastro Maker"}
      larguraMax="max-w-3xl"
    >
      <form onSubmit={handleSubmit(lidarComEnvio)} className="flex flex-col bg-white dark:bg-[#18181b]">
        <div className="p-6 md:p-8 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <User size={16} />
              </span>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Identificação
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
                {...register("telefone")}
              />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Star size={16} />
              </span>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Nota e Status</h4>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  Estado do Relacionamento
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {statusOpcoes.map((opcao) => {
                    const ativo = statusAtual === opcao.valor;
                    return (
                      <button
                        key={opcao.valor}
                        type="button"
                        onClick={() => setValue("statusComercial", opcao.valor, { shouldDirty: true })}
                        className={`
                          flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all
                          ${ativo 
                            ? `bg-${opcao.cor}-500/10 border-${opcao.cor}-500 text-${opcao.cor}-600 dark:text-${opcao.cor}-400` 
                            : 'bg-transparent border-gray-100 dark:border-white/5 text-gray-400 dark:text-zinc-600 hover:border-gray-200 dark:hover:border-white/10'}
                        `}
                      >
                        <opcao.icone size={18} strokeWidth={ativo ? 3 : 2} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{opcao.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <CampoTexto
                rotulo="Notas do Perfil (Útil para o dia a dia)"
                icone={FileText}
                placeholder="Ex: Gosta de peças em resina, prefere retirada, costuma pedir brindes..."
                erro={errors.observacoesCRM?.message}
                {...register("observacoesCRM")}
              />
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0e0e11]/50 backdrop-blur-md flex flex-col gap-4 rounded-b-2xl">
          <div className="flex items-center gap-2 text-emerald-500">
             <Shield size={12} />
             <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
               Dados protegidos via LGPD • Retenção de 5 anos
             </span>
          </div>

          {!confirmarDescarte ? (
            <div className="flex items-center gap-3 w-full justify-between md:justify-end">
              <button
                type="button"
                onClick={lidarComTentativaFechamento}
                className="px-6 py-2.5 flex-1 md:flex-none text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ backgroundColor: "var(--cor-primaria)" }}
                className="px-8 py-2.5 flex-1 md:flex-none justify-center hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95"
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
    </Dialogo>
  );
}
