import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
    Save, User, FileText, Calendar, 
    Cpu, DollarSign, Box, Package, Settings, TrendingUp, MessageSquare, ChevronDown
} from "lucide-react";
import { registrar } from "@/compartilhado/utilitarios/registrador";
import { Dialogo, InputBancario } from "@/compartilhado/componentes";
import { Combobox } from "@/compartilhado/componentes";
import { CriarPedidoInput, Pedido } from "../tipos";
import { useGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/useGerenciadorClientes";
import { SeletorInsumosSecundarios } from "./SeletorInsumosSecundarios";
import { SeletorMateriaisPedido } from "./SeletorMateriaisPedido";
import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { ModalListagemPremium } from "@/compartilhado/componentes";



const esquemaPedido = z.object({
    idCliente: z.string().min(1, "Selecione um cliente"),
    descricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
    valorCentavos: z.number().min(0),
    prazoEntrega: z.string().optional(),
    material: z.string().optional(),
    pesoGramas: z.number().min(0).optional(),
    tempoMinutos: z.number().int().min(0).optional(),
    idImpressora: z.string().optional(),
    observacoes: z.string().optional(),
    insumosSecundarios: z.array(z.object({
        idInsumo: z.string(),
        nome: z.string(),
        quantidade: z.number().min(0),
        custoUnitarioCentavos: z.number().int().min(0),
    })).optional(),
    materiais: z.array(z.object({
        idMaterial: z.string(),
        nome: z.string(),
        quantidadeGasta: z.number().min(0),
    })).optional(),
});

type PedidoFormData = z.infer<typeof esquemaPedido>;

interface PropriedadesFormularioPedido {
    aberto: boolean;
    pedidoEdicao?: Pedido | null;
    aoSalvar: (dados: CriarPedidoInput) => Promise<void>;
    aoCancelar: () => void;
    ehPagina?: boolean;
}

export function FormularioPedido({ aberto, pedidoEdicao, aoSalvar, aoCancelar, ehPagina = false }: PropriedadesFormularioPedido) {
    const { estado, acoes } = useGerenciadorClientes();
    
    const [modalArmazemAberto, setModalArmazemAberto] = useState(false);
    const [modalInsumosAberto, setModalInsumosAberto] = useState(false);
    const [buscaMaterial, setBuscaMaterial] = useState("");
    const [buscaInsumo, setBuscaInsumo] = useState("");

    const { materiais } = useArmazemMateriais();
    const { insumos } = useArmazemInsumos();
    const { impressoras } = useArmazemImpressoras();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<PedidoFormData>({
        resolver: zodResolver(esquemaPedido) as any,
        mode: "onChange",
        defaultValues: {
            idCliente: "",
            descricao: "",
            valorCentavos: 0,
            prazoEntrega: "",
            material: "",
            pesoGramas: 0,
            tempoMinutos: 0,
            idImpressora: "",
            observacoes: "",
            insumosSecundarios: [],
            materiais: [],
        },
    });

    const materiaisSelecionados = watch("materiais") || [];
    const insumosSecundarios = watch("insumosSecundarios") || [];

    useEffect(() => {
        if (aberto) {
            if (pedidoEdicao) {
                reset({
                    idCliente: pedidoEdicao.idCliente,
                    descricao: pedidoEdicao.descricao,
                    valorCentavos: pedidoEdicao.valorCentavos / 100,
                    prazoEntrega: pedidoEdicao.prazoEntrega
                        ? new Date(pedidoEdicao.prazoEntrega).toISOString().split("T")[0]
                        : "",
                    material: pedidoEdicao.material || "",
                    pesoGramas: pedidoEdicao.pesoGramas || 0,
                    tempoMinutos: pedidoEdicao.tempoMinutos || 0,
                    idImpressora: pedidoEdicao.idImpressora || "",
                    observacoes: pedidoEdicao.observacoes || "",
                    insumosSecundarios: pedidoEdicao.insumosSecundarios || [],
                    materiais: pedidoEdicao.materiais || [],
                });
            } else {
                reset({
                    idCliente: "",
                    descricao: "",
                    valorCentavos: 0,
                    prazoEntrega: "",
                    material: "",
                    pesoGramas: 0,
                    tempoMinutos: 0,
                    idImpressora: "",
                    observacoes: "",
                    insumosSecundarios: [],
                    materiais: [],
                });
            }
        }
    }, [aberto, reset, pedidoEdicao]);

    const aoSubmeter = async (dados: PedidoFormData) => {
        try {
            await aoSalvar({
                idCliente: dados.idCliente,
                descricao: dados.descricao,
                valorCentavos: Math.round(dados.valorCentavos * 100),
                prazoEntrega: dados.prazoEntrega ? new Date(dados.prazoEntrega) : undefined,
                material: dados.material,
                pesoGramas: dados.pesoGramas,
                tempoMinutos: dados.tempoMinutos,
                idImpressora: dados.idImpressora,
                observacoes: dados.observacoes,
                insumosSecundarios: dados.insumosSecundarios,
                materiais: dados.materiais,
            });
            aoCancelar();
        } catch (erro) {
            registrar.error({ rastreioId: "sistema", servico: "FormularioPedido" }, "Erro ao salvar pedido", erro);
        }
    };

    const lidarComCriarCliente = async (nome: string) => {
        const novo = await acoes.salvarCliente({ nome, email: "", telefone: "" });
        setValue("idCliente", novo.id, { shouldDirty: true, shouldValidate: true });
        return novo.id;
    };

    const opcoesClientes = useMemo(() => estado.clientes.map(c => ({ valor: c.id, rotulo: c.nome })), [estado.clientes]);
    const opcoesImpressoras = useMemo(() => impressoras.map(i => ({ valor: i.id, rotulo: `${i.nome} (${i.modeloBase || 'FDM'})` })), [impressoras]);

    const materiaisFiltrados = materiais.filter(m => m.nome.toLowerCase().includes(buscaMaterial.toLowerCase()));
    const insumosFiltrados = insumos.filter(i => i.nome.toLowerCase().includes(buscaInsumo.toLowerCase()));

    const selecionarMaterial = (m: any) => {
        const novos = [...materiaisSelecionados, { idMaterial: m.id, nome: m.nome, quantidadeGasta: 0 }];
        setValue("materiais", novos, { shouldDirty: true });
        setValue("material", novos.map(item => item.nome).join(", "));
        setModalArmazemAberto(false);
    };

    const selecionarInsumo = (i: any) => {
        const novos = [...insumosSecundarios, { idInsumo: i.id, nome: i.nome, quantidade: 1, custoUnitarioCentavos: i.custoMedioUnidade }];
        setValue("insumosSecundarios", novos, { shouldDirty: true });
        setModalInsumosAberto(false);
    };

    const ConteudoFormulario = (
        <div className={`flex flex-col bg-card ${ehPagina ? 'min-h-screen' : 'min-h-[75vh] max-h-[85vh]'} overflow-hidden ${!ehPagina && 'rounded-b-3xl'}`}>
            <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-borda-sutil scrollbar-track-transparent">
                        
                        {/* 🚀 HEADER DE ESTADO (Discreto e Profissional) */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/[0.04] backdrop-blur-xl transition-all duration-300 hover:border-zinc-300 dark:hover:border-white/[0.08] shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-950">
                                    <Cpu size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
                                        {pedidoEdicao ? "Ajustar Parâmetros" : "Lançar Novo Projeto"}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                                        <span>
                                            {pedidoEdicao ? "Identificador Técnico:" : "Engenharia de Custos e Fila de Produção"}
                                        </span>
                                        {pedidoEdicao && (
                                            <code className="font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 dark:text-zinc-400 select-all">
                                                #{pedidoEdicao.id.slice(0, 12).toUpperCase()}
                                            </code>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-1.5 mt-4 md:mt-0">
                                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Valor de Mercado</span>
                                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-white/10 rounded-xl focus-within:border-zinc-400 dark:focus-within:border-white/20 focus-within:bg-white dark:focus-within:bg-zinc-950 transition-all duration-250 w-full md:w-auto">
                                    <DollarSign size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                                    <InputBancario 
                                        placeholder="0.00"
                                        className="bg-transparent text-sm font-bold text-zinc-800 dark:text-zinc-100 outline-none tabular-nums w-full md:w-28 text-left md:text-right font-mono"
                                        onChange={(e) => setValue("valorCentavos", Number(e.target.value), { shouldDirty: true })}
                                        value={watch("valorCentavos") || ""}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* 🛠️ LADO ESQUERDO: INFRAESTRUTURA */}
                            <div className="lg:col-span-7 space-y-8">
                                
                                {/* 1. IDENTIFICAÇÃO (Estilo CardIdentificacaoProjeto) */}
                                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#121214] border border-borda-sutil flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 overflow-hidden relative">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                                    
                                    <div className="relative z-10 flex items-center gap-3 border-b border-borda-sutil pb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30 bg-indigo-500/5">
                                            <User size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-wider text-primary dark:text-white">Identificação do Job</span>
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Vincule o cliente e os detalhes operacionais</span>
                                        </div>
                                    </div>

                                    <div className="relative z-10 space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Cliente do Projeto</label>
                                            <Combobox
                                                titulo=""
                                                opcoes={opcoesClientes}
                                                valor={watch("idCliente")}
                                                aoAlterar={(val) => setValue("idCliente", val, { shouldDirty: true })}
                                                aoCriarNovo={lidarComCriarCliente}
                                                placeholder="Buscar ou digitar cliente..."
                                                icone={User}
                                                erro={errors.idCliente?.message}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Nome / Descrição do Job</label>
                                            <div className="relative flex items-center bg-white dark:bg-zinc-950/60 border border-borda-sutil focus-within:border-indigo-500/40 rounded-xl h-12 transition-all">
                                                <FileText size={16} className="absolute left-4 text-zinc-600" />
                                                <input 
                                                    type="text"
                                                    placeholder="Ex: Protótipo de Engenharia Rev.02"
                                                    className="w-full h-full bg-transparent pl-12 pr-4 font-bold text-xs text-primary dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                                                    {...register("descricao")}
                                                />
                                            </div>
                                            {errors.descricao && <span className="text-[9px] font-black text-rose-500 uppercase ml-1">{errors.descricao.message}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. HARDWARE (Estilo CardProducao) */}
                                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#121214] border border-borda-sutil flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 relative">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                                    <div className="relative z-10 flex items-center gap-3 border-b border-borda-sutil pb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/30 bg-emerald-500/5">
                                            <Settings size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-wider text-primary dark:text-white">Hardware & Alocação</span>
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Defina o equipamento e o deadline técnico</span>
                                        </div>
                                    </div>

                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Equipamento Ativo</label>
                                            <div className="relative flex items-center bg-white dark:bg-zinc-950/60 border border-borda-sutil focus-within:border-emerald-500/40 rounded-xl h-12 transition-all">
                                                <Cpu size={16} className="absolute left-4 text-zinc-600" />
                                                <select 
                                                    className="w-full h-full bg-transparent pl-12 pr-4 font-bold text-xs text-primary dark:text-white outline-none appearance-none cursor-pointer" 
                                                    {...register("idImpressora")}
                                                >
                                                    <option value="" className="bg-zinc-900">AUTO-ALOCAÇÃO (SISTEMA)</option>
                                                    {opcoesImpressoras.map(o => <option key={o.valor} value={o.valor} className="bg-zinc-900">{o.rotulo}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-4 text-zinc-600 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Prazo de Entrega</label>
                                            <div className="relative flex items-center bg-white dark:bg-zinc-950/60 border border-borda-sutil focus-within:border-emerald-500/40 rounded-xl h-12 transition-all">
                                                <Calendar size={16} className="absolute left-4 text-zinc-600" />
                                                <input 
                                                    type="date" 
                                                    className="w-full h-full bg-transparent pl-12 pr-4 font-bold text-xs text-primary dark:text-white outline-none [color-scheme:light] dark:[color-scheme:dark]" 
                                                    {...register("prazoEntrega")} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🏗️ LADO DIREITO: MÉTRICAS E MATERIAIS */}
                            <div className="lg:col-span-5 space-y-8">
                                 
                                 {/* 3. PERFORMANCE (Métricas Técnicas) */}
                                 <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#121214] border border-borda-sutil flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 relative">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                                    <div className="relative z-10 flex items-center gap-3 border-b border-white/5 pb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/30 bg-amber-500/5">
                                            <TrendingUp size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-wider text-primary dark:text-white">Métricas de Performance</span>
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Tempo de máquina e massa total</span>
                                        </div>
                                    </div>

                                    <div className="relative z-10 grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2 p-5 rounded-2xl bg-white dark:bg-zinc-950/60 border border-borda-sutil group/time transition-all hover:border-amber-500/20">
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Tempo Estimado</span>
                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex-1 flex items-baseline gap-1">
                                                    <input 
                                                        type="number" 
                                                        className="bg-transparent text-2xl font-black text-primary dark:text-white outline-none tabular-nums w-full"
                                                        value={Math.floor((watch("tempoMinutos") || 0) / 60)}
                                                        onChange={(e) => {
                                                            const h = Math.max(0, parseInt(e.target.value) || 0);
                                                            const m = (watch("tempoMinutos") || 0) % 60;
                                                            setValue("tempoMinutos", (h * 60) + m, { shouldDirty: true });
                                                        }}
                                                    />
                                                    <span className="text-[10px] font-black text-amber-500 uppercase italic">H</span>
                                                </div>
                                                <div className="w-px h-6 bg-white/10" />
                                                <div className="flex-1 flex items-baseline gap-1">
                                                    <input 
                                                        type="number" 
                                                        max={59}
                                                        className="bg-transparent text-2xl font-black text-primary dark:text-white outline-none tabular-nums w-full"
                                                        value={(watch("tempoMinutos") || 0) % 60}
                                                        onChange={(e) => {
                                                            const h = Math.floor((watch("tempoMinutos") || 0) / 60);
                                                            const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                                                            setValue("tempoMinutos", (h * 60) + m, { shouldDirty: true });
                                                        }}
                                                    />
                                                    <span className="text-[10px] font-black text-amber-500 uppercase italic">Min</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 p-5 rounded-2xl bg-white dark:bg-zinc-950/60 border border-borda-sutil transition-all hover:border-white/10">
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Massa Total</span>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <input 
                                                    type="number" 
                                                    className="bg-transparent text-2xl font-black text-primary dark:text-white outline-none tabular-nums w-full" 
                                                    {...register("pesoGramas", { valueAsNumber: true })} 
                                                />
                                                <span className="text-[10px] font-black text-zinc-500 uppercase italic">G</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. MATERIAIS (Seletor Premium) */}
                                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#121214] border border-borda-sutil flex flex-col gap-6 shadow-2xl backdrop-blur-3xl group transition-all duration-500 relative">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

                                    <div className="relative z-10 flex items-center gap-3 border-b border-white/5 pb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/30 bg-sky-500/5">
                                            <Box size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-wider text-primary dark:text-white">Inventário de Suprimentos</span>
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Materiais e insumos secundários</span>
                                        </div>
                                    </div>

                                    <div className="relative z-10 space-y-6">
                                        <SeletorMateriaisPedido
                                            selecionados={materiaisSelecionados}
                                            aoAbrirArmazem={() => setModalArmazemAberto(true)}
                                            aoAlterar={(novos) => {
                                                setValue("materiais", novos, { shouldDirty: true });
                                                setValue("material", novos.map(m => m.nome).join(", "));
                                                setValue("pesoGramas", novos.reduce((acc, m) => acc + m.quantidadeGasta, 0));
                                            }}
                                        />
                                        <SeletorInsumosSecundarios
                                            selecionados={insumosSecundarios}
                                            aoAbrirArmazem={() => setModalInsumosAberto(true)}
                                            aoAlterar={(novos) => setValue("insumosSecundarios", novos, { shouldDirty: true })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 📝 OBSERVAÇÕES TÉCNICAS */}
                        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#121214] border border-borda-sutil shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 border border-white/10 bg-white/5">
                                    <MessageSquare size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase tracking-wider text-primary dark:text-white">Log de Operação / Notas</span>
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Instruções especiais para a produção</span>
                                </div>
                            </div>
                            <div className="relative bg-white dark:bg-zinc-950/60 border border-borda-sutil rounded-2xl p-4 focus-within:border-white/20 transition-all">
                                <textarea 
                                    className="w-full bg-transparent outline-none font-bold text-xs text-zinc-300 min-h-[100px] resize-none placeholder:text-zinc-700"
                                    placeholder="Ex: Reforçar paredes internas, acabamento com primer cinza..."
                                    {...register("observacoes")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 📑 FOOTER DE AÇÕES (Dashboard Style) */}
                    <footer className="px-12 py-8 bg-zinc-100 dark:bg-[#0a0a0c] border-t border-borda-sutil flex items-center justify-between">
                        <button 
                            type="button" 
                            onClick={aoCancelar} 
                            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-primary dark:hover:text-white transition-colors"
                        >
                            Abortar Alterações
                        </button>
                        
                        <button 
                            type="submit" 
                            className="group relative flex items-center gap-6 px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/10 overflow-hidden"
                        >
                            <Save size={18} strokeWidth={3} />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                                {pedidoEdicao ? "Atualizar Inteligência" : "Confirmar Workflow"}
                            </span>
                        </button>
                    </footer>
                </form>

                {/* Modais de Seleção (Mantendo lógica) */}
                <ModalListagemPremium aberto={modalArmazemAberto} aoFechar={() => setModalArmazemAberto(false)} titulo="Armazém de Materiais" iconeTitulo={Box} corDestaque="amber" termoBusca={buscaMaterial} aoMudarBusca={setBuscaMaterial} temResultados={materiaisFiltrados.length > 0} totalResultados={materiaisFiltrados.length}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {materiaisFiltrados.map(m => (
                            <button key={m.id} type="button" onClick={() => selecionarMaterial(m)} className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-amber-500/40 cursor-pointer transition-all flex items-center gap-4 group text-left w-full focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><Box size={24} /></div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase text-zinc-900 dark:text-white">{m.nome}</span>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{m.tipo} • {m.cor}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ModalListagemPremium>

                <ModalListagemPremium aberto={modalInsumosAberto} aoFechar={() => setModalInsumosAberto(false)} titulo="Armazém de Insumos" iconeTitulo={Package} corDestaque="sky" termoBusca={buscaInsumo} aoMudarBusca={setBuscaInsumo} temResultados={insumosFiltrados.length > 0} totalResultados={insumosFiltrados.length}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insumosFiltrados.map(i => (
                            <button key={i.id} type="button" onClick={() => selecionarInsumo(i)} className="p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-sky-500/40 cursor-pointer transition-all flex items-center gap-4 group text-left w-full focus:outline-none focus:ring-2 focus:ring-sky-500/50">
                                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform"><Package size={24} /></div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase text-zinc-900 dark:text-white">{i.nome}</span>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{i.categoria} • {i.unidadeMedida}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ModalListagemPremium>
            </div>
    );

    if (ehPagina) return ConteudoFormulario;

    return (
        <Dialogo aberto={aberto} aoFechar={aoCancelar} titulo={pedidoEdicao ? "Painel de Inteligência de Produção" : "Novo Workflow de Engenharia"} larguraMax="max-w-6xl">
            {ConteudoFormulario}
        </Dialogo>
    );
}
