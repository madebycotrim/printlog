
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Zap, Timer, DollarSign, Tag, Binary, Terminal, Cpu, Activity, Loader2, AlertCircle } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { usePrinterStore } from "../logic/printer";
import { validateInput, schemas } from "../../../utils/validation";
import SideBySideModal from "../../../components/ui/SideBySideModal";
import FormFeedback from "../../../components/FormFeedback";
import { useFormFeedback } from "../../../hooks/useFormFeedback";

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

    // Feedback Hook
    const { feedback, showSuccess, showError, hide: hideFeedback } = useFormFeedback();


    useEffect(() => {
        if (aberto) {
            fetchPrinterModels();
            setIsSaving(false);
            setIsDirty(false);
            hideFeedback();

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
    }, [aberto, dadosIniciais, fetchPrinterModels, hideFeedback]);

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
                showError(check.errors[0]);
                setIsSaving(false);
                return;
            }

            hideFeedback();
            await aoSalvar(payload);
            showSuccess(dadosIniciais ? "Impressora atualizada!" : "Impressora cadastrada!");
            setTimeout(() => {
                aoFechar();
            }, 1000);

        } catch (error) {
            console.error("Erro ao salvar impressora:", error);
            showError("Erro ao salvar impressora.");
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

    // Sidebar Content
    const sidebarContent = (
        <div className="flex flex-col items-center w-full space-y-10 relative z-10 h-full justify-between">
            <div className="w-full">
                <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-10">
                    <div className="h-px w-4 bg-zinc-900/50" />
                    Prévia
                    <div className="h-px w-4 bg-zinc-900/50" />
                </div>

                <div className="relative group p-12 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm mx-auto w-fit mb-10">
                    <Cpu size={64} className={`transition-colors duration-500 ${isSaving ? 'text-zinc-800 animate-pulse' : 'text-zinc-600 group-hover:text-emerald-500/50'}`} strokeWidth={1.5} />
                </div>

                <div className="text-center space-y-2 w-full">
                    <h3 className="text-xl font-bold text-zinc-100 tracking-tight truncate leading-none">
                        {formulario.nome || "Nova Impressora"}
                    </h3>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50 inline-block">
                        {formulario.marca || "---"} • {formulario.modelo || "---"}
                    </span>
                </div>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md relative z-10 shadow-xl w-full">
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
    );

    // Footer Content
    const footerContent = (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback
                type={feedback.type}
                message={feedback.message}
                show={feedback.show}
                onClose={hideFeedback}
            />

            {!isValid && isDirty && !isSaving && (
                <div className="flex items-center gap-2 text-rose-500 animate-shake mb-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Preencha os campos obrigatórios</span>
                </div>
            )}

            <div className="flex gap-4">
                <button disabled={isSaving} onClick={handleTentativaFechar} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                    Cancelar
                </button>
                <button
                    disabled={!isValid || isSaving}
                    onClick={handleSalvarInterno}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${isValid && !isSaving ? "bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95 shadow-xl" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                    {isSaving ? "Sincronizando..." : dadosIniciais ? "Salvar Alterações" : "Adicionar ao Sistema"}
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={handleTentativaFechar}
            sidebar={sidebarContent}
            title={dadosIniciais ? "Editar Impressora" : "Cadastrar Impressora"}
            subtitle={dadosIniciais ? "Ajuste os detalhes técnicos da sua impressora" : "Configure uma nova impressora para o sistema"}
            footer={footerContent}
            isSaving={isSaving}
        >
            <div className="space-y-8">
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
        </SideBySideModal>
    );
}
