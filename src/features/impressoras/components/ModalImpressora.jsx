
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, Zap, Timer, DollarSign, Tag, Binary, Terminal, Cpu, Activity, Loader2, AlertCircle, Calendar, Trash2, Plus, PenTool, History } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { usePrinterStore } from "../logic/printer";
import { validateInput, schemas } from "../../../utils/validation";
import { useToastStore } from "../../../stores/toastStore";

/**
 * Utilitário de conversão numérica robusto
 */
const safeParse = (valor) => {
    if (typeof valor === 'number') return valor;
    if (!valor || valor === "") return 0;
    const limpo = String(valor).replace(/[R$\s.]/g, '').replace(',', '.');
    const resultado = parseFloat(limpo);
    return isNaN(resultado) ? 0 : resultado;
};

export default function PrinterModal({ aberto, aoFechar, aoSalvar, dadosIniciais }) {
    const { printerModels, fetchPrinterModels } = usePrinterStore();

    const [formulario, setFormulario] = useState({
        id: null, nome: "", marca: "", modelo: "", potencia: "", preco: "",
        status: "idle", horas_totais: "0", ultima_manutencao_hora: 0,
        intervalo_manutencao: "300", historico: []
    });

    const [entradaManual, setEntradaManual] = useState({ marca: false, modelo: false });
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (aberto) {
            fetchPrinterModels();
            setIsSaving(false);
            setIsDirty(false);

            if (dadosIniciais) {
                setFormulario({
                    id: dadosIniciais.id || null,
                    nome: dadosIniciais.nome || "",
                    marca: dadosIniciais.marca || "",
                    modelo: dadosIniciais.modelo || "",
                    potencia: String(dadosIniciais.potencia ?? ""),
                    preco: String(dadosIniciais.preco ?? ""),
                    status: dadosIniciais.status || "idle",
                    horas_totais: String(dadosIniciais.horas_totais ?? "0"),
                    ultima_manutencao_hora: dadosIniciais.ultima_manutencao_hora ?? 0,
                    intervalo_manutencao: String(dadosIniciais.intervalo_manutencao ?? "300"),
                    historico: dadosIniciais.historico || []
                });
            } else {
                setFormulario({
                    id: null, nome: "", marca: "", modelo: "", potencia: "", preco: "",
                    status: "idle", horas_totais: "0", ultima_manutencao_hora: 0,
                    intervalo_manutencao: "300", historico: []
                });
                setEntradaManual({ marca: false, modelo: false });
            }
        }
    }, [aberto, dadosIniciais, fetchPrinterModels]);

    const opcoesMarca = useMemo(() => {
        const marcasUnicas = [...new Set(printerModels.map(p => p.brand))].sort();
        return [{ group: "Fabricantes", items: marcasUnicas.map(b => ({ value: b, label: b })) }];
    }, [printerModels]);

    const opcoesModelo = useMemo(() => {
        if (!formulario.marca) return [];
        const modelosFiltrados = printerModels.filter(p => p.brand === formulario.marca);
        return [{
            group: `Modelos da ${formulario.marca} `,
            items: modelosFiltrados.map(m => ({ value: m.model, label: m.model, data: m }))
        }];
    }, [printerModels, formulario.marca]);

    const updateForm = (updates) => {
        setFormulario(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
    };

    const tratarMudancaModelo = (valor, item) => {
        const dadosTecnicos = item?.data;
        updateForm({
            modelo: valor,
            potencia: dadosTecnicos?.consumoKw ? (dadosTecnicos.consumoKw * 1000).toFixed(0) : formulario.potencia,
            nome: formulario.nome || `${formulario.marca} ${valor} `
        });
    };

    const handleTentativaFechar = useCallback(() => {
        if (isSaving) return;
        if (isDirty) {
            if (window.confirm("Você tem alterações não salvas. Deseja realmente sair?")) {
                aoFechar();
            }
        } else {
            aoFechar();
        }
    }, [isDirty, isSaving, aoFechar]);

    const handleSalvarInterno = async () => {
        if (isSaving) return;
        try {
            setIsSaving(true);
            const payload = {
                ...formulario,
                potencia: safeParse(formulario.potencia),
                preco: safeParse(formulario.preco),
                horas_totais: safeParse(formulario.horas_totais),
                intervalo_manutencao: safeParse(formulario.intervalo_manutencao)
            };

            const check = validateInput(payload, schemas.printer);
            if (!check.valid) {
                useToastStore.getState().addToast(check.errors[0], "error");
                setIsSaving(false);
                return;
            }

            await aoSalvar(payload);
        } catch (error) {
            console.error("Erro ao salvar impressora:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const custoDesgaste = useMemo(() => {
        const preco = safeParse(formulario.preco);
        const vidaUtilEstimada = 5000;
        if (preco <= 0) return "0,00";
        return (preco / vidaUtilEstimada).toFixed(2);
    }, [formulario.preco]);

    // Validação em tempo real
    const payloadValidacao = useMemo(() => {
        return {
            ...formulario,
            nome: formulario.nome?.trim(),
            marca: formulario.marca?.trim(),
            modelo: formulario.modelo?.trim(),
            potencia: safeParse(formulario.potencia),
            preco: safeParse(formulario.preco),
            horas_totais: safeParse(formulario.horas_totais),
            ultima_manutencao_hora: formulario.ultima_manutencao_hora || 0,
            intervalo_manutencao: safeParse(formulario.intervalo_manutencao),
            historico: formulario.historico || []
        };
    }, [formulario]);

    const validationResult = useMemo(() => validateInput(payloadValidacao, schemas.printer), [payloadValidacao]);
    const isValid = validationResult.valid;

    if (!aberto) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={handleTentativaFechar} />

            <div className={`relative bg - zinc - 950 border border - zinc - 800 / 80 rounded - [2rem] w - full max - w - 4xl shadow - 2xl overflow - hidden flex flex - col md: flex - row max - h - [90vh] transition - all duration - 300 ${isSaving ? 'opacity-90 grayscale-[0.3]' : ''} `}>

                {/* SIDEBAR DE PRÉVIA */}
                <div className="w-full md:w-[320px] bg-zinc-950/40/30 border-r border-zinc-800/50 p-10 flex flex-col justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-40 select-none">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `linear - gradient(to right, #27272a 1px, transparent 1px), linear - gradient(to bottom, #27272a 1px, transparent 1px)`,
                            backgroundSize: '40px 40px',
                            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                        }} />
                    </div>

                    <div className="space-y-10 relative z-10">
                        <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                            <div className="h-px w-4 bg-zinc-900/50" />
                            Prévia
                            <div className="h-px w-4 bg-zinc-900/50" />
                        </div>

                        <div className="relative group p-12 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm">
                            <Cpu size={64} className={`transition - colors duration - 500 ${isSaving ? 'text-zinc-800 animate-pulse' : 'text-zinc-600 group-hover:text-emerald-500/50'} `} strokeWidth={1.5} />
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-zinc-100 tracking-tight truncate leading-none">
                                {formulario.nome || "Nova Impressora"}
                            </h3>
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50">
                                {formulario.marca || "---"} • {formulario.modelo || "---"}
                            </span>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md relative z-10 shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={12} className="text-emerald-500/50" />
                            <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-wider">Desgaste Estimado</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-bold text-zinc-100 font-sans tracking-tighter">R$ {custoDesgaste}</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">/h</span>
                        </div>
                    </div>
                </div>

                {/* FORMULÁRIO PRINCIPAL */}
                <div className="flex-1 flex flex-col bg-zinc-950">
                    <header className="px-10 py-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-950/40/10">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-zinc-950/40 border border-zinc-800">
                                <Binary size={16} className="text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
                                    {dadosIniciais ? "Editar Impressora" : "Cadastrar Impressora"}
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-medium mt-1">
                                    {dadosIniciais ? "Ajuste os detalhes técnicos da sua impressora" : "Configure uma nova impressora para o sistema"}
                                </p>
                            </div>
                        </div>
                        <button disabled={isSaving} onClick={handleTentativaFechar} className="p-2 rounded-full hover:bg-zinc-950/40 text-zinc-500 transition-all disabled:opacity-20">
                            <X size={20} />
                        </button>
                    </header>

                    <div className={`p - 10 overflow - y - auto custom - scrollbar flex - 1 space - y - 8 ${isSaving ? 'pointer-events-none' : ''} `}>

                        {/* Seção 01 */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                <h4>[01] Identificação</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Quem é o fabricante?</label>
                                        <button onClick={() => setEntradaManual(p => ({ ...p, marca: !p.marca }))} className="text-[9px] text-sky-500/70 hover:text-sky-400 font-bold uppercase tracking-tighter">
                                            {entradaManual.marca ? "[ Lista ]" : "[ Manual ]"}
                                        </button>
                                    </div>
                                    <UnifiedInput
                                        type={entradaManual.marca ? "text" : "select"}
                                        options={opcoesMarca} value={formulario.marca}
                                        onChange={val => updateForm({ marca: entradaManual.marca ? val.target.value : val, modelo: "" })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Qual o modelo?</label>
                                        <button onClick={() => setEntradaManual(p => ({ ...p, modelo: !p.modelo }))} className="text-[9px] text-sky-500/70 hover:text-sky-400 font-bold uppercase tracking-tighter">
                                            {entradaManual.modelo ? "[ Lista ]" : "[ Manual ]"}
                                        </button>
                                    </div>
                                    <UnifiedInput
                                        type={entradaManual.modelo ? "text" : "select"}
                                        options={opcoesModelo}
                                        disabled={!formulario.marca && !entradaManual.modelo}
                                        value={formulario.modelo}
                                        onChange={(val, item) => entradaManual.modelo
                                            ? updateForm({ modelo: val.target.value })
                                            : tratarMudancaModelo(val, item)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Qual o apelido ou nome da impressora?</label>
                                <UnifiedInput icon={Tag} value={formulario.nome} placeholder="Ex: Ender 3 S1 - Lab 01" onChange={e => updateForm({ nome: e.target.value })} />
                            </div>
                        </div>

                        {/* Seção 02 e 03 */}
                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    <h4>[02] Operacional</h4>
                                    <div className="h-px bg-zinc-800/50 flex-1" />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Qual a potência? (Watts)</label>
                                        <UnifiedInput icon={Zap} suffix="W" value={formulario.potencia} onChange={e => updateForm({ potencia: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Quanto custou a impressora?</label>
                                        <UnifiedInput icon={DollarSign} suffix="BRL" value={formulario.preco} onChange={e => updateForm({ preco: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    <h4>[03] Manutenção</h4>
                                    <div className="h-px bg-zinc-800/50 flex-1" />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Qual o tempo de uso total? (Horas)</label>
                                        <UnifiedInput icon={Timer} suffix="Hrs" value={formulario.horas_totais} onChange={e => updateForm({ horas_totais: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">A cada quantas horas deve ser feita a manutenção?</label>
                                        <UnifiedInput icon={Activity} suffix="Hrs" value={formulario.intervalo_manutencao} onChange={e => updateForm({ intervalo_manutencao: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="p-8 border-t border-zinc-800/50 bg-zinc-950/40/10 flex gap-4">
                        {!isValid && isDirty && !isSaving && (
                            <div className="absolute top-[-35px] left-8 flex items-center gap-2 text-rose-500 animate-bounce">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Preencha os campos obrigatórios</span>
                            </div>
                        )}
                        <button disabled={isSaving} onClick={handleTentativaFechar} className="flex-1 py-3 text-[11px] font-bold uppercase text-zinc-400 border border-zinc-800 rounded-xl hover:bg-zinc-900/50 hover:text-zinc-100 transition-all disabled:opacity-20">
                            Cancelar
                        </button>
                        <button
                            disabled={!isValid || isSaving}
                            onClick={handleSalvarInterno}
                            className={`flex - [2] py - 3 text - [11px] font - bold uppercase rounded - xl flex items - center justify - center gap - 3 transition - all ${isValid && !isSaving ? "bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95 shadow-xl" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"} `}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                            {isSaving ? "Sincronizando..." : dadosIniciais ? "Salvar Alterações" : "Adicionar ao Sistema"}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}
