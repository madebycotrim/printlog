import React, { useState, useMemo } from 'react';
import { AlertOctagon, Layers, Loader2, Save, Ban } from 'lucide-react';
import { UnifiedInput } from '../../../components/UnifiedInput';
import { useFilaments } from '../logic/filamentQueries';
import FormFeedback from '../../../components/FormFeedback';
import { useFormFeedback } from '../../../hooks/useFormFeedback';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import api from '../../../utils/api';
import { parseNumber } from "../../../utils/numbers";

export default function ModalRegistrarFalha({ aberto, aoFechar, aoSalvar }) {
    const [loading, setLoading] = useState(false);
    const { feedback, showSuccess, showError, hide: hideFeedback } = useFormFeedback();

    // Form State
    const [form, setForm] = useState({
        weightWasted: '',
        costWasted: '',
        reason: 'Falha de Aderência',
        filamentId: 'manual',
    });

    const { data: filaments = [] } = useFilaments();

    const reasons = [
        "Falha de Aderência", "Entupimento de Bico", "Queda de Energia",
        "Erro no Fatiamento", "Fim de Filamento", "Warping (Empenamento)",
        "Layer Shift", "Outros"
    ];

    const handleSubmit = async () => {
        if (!form.weightWasted) return;
        setLoading(true);
        hideFeedback();
        try {
            await api.post('/failures', form);

            showSuccess('Falha registrada com sucesso!');
            if (aoSalvar) aoSalvar();

            setTimeout(() => {
                aoFechar();
                setForm({ weightWasted: '', costWasted: '', reason: 'Falha de Aderência', filamentId: 'manual' });
                hideFeedback();
            }, 1500);
        } catch (error) {
            console.error(error);
            showError('Erro ao registrar falha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilamentChange = (id) => {
        const fil = filaments.find(f => String(f.id) === String(id));
        let cost = '';

        if (fil && form.weightWasted) {
            const pricePerGram = (Number(fil.preco) / Number(fil.peso_total));
            cost = (pricePerGram * Number(form.weightWasted)).toFixed(2);
        }
        setForm(prev => ({ ...prev, filamentId: id, costWasted: cost }));
    };

    const handleWeightChange = (val) => {
        const weight = val.replace(',', '.');
        let cost = form.costWasted;

        if (form.filamentId !== 'manual') {
            const fil = filaments.find(f => String(f.id) === String(form.filamentId));
            if (fil) {
                const pricePerGram = (Number(fil.preco) / Number(fil.peso_total));
                cost = (pricePerGram * parseNumber(weight)).toFixed(2);
            }
        }
        setForm(prev => ({ ...prev, weightWasted: weight, costWasted: cost }));
    };

    const filamentOptions = useMemo(() => [
        { group: "Ações", items: [{ value: "manual", label: "Nenhum / Apenas Registrar" }] },
        {
            group: "Meus Filamentos",
            items: filaments.map(f => ({ value: String(f.id), label: f.nome, color: f.cor_hex }))
        }
    ], [filaments]);

    // Sidebar Content
    const sidebarContent = (
        <div className="flex flex-col items-center w-full space-y-10 relative z-10 h-full justify-between">
            <div className="w-full">
                <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-10">
                    <div className="h-px w-4 bg-zinc-900/50" />
                    <span>Resumo</span>
                    <div className="h-px w-4 bg-zinc-900/50" />
                </div>

                <div className="relative group p-10 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 shadow-inner flex items-center justify-center backdrop-blur-sm mx-auto w-fit mb-10">
                    <AlertOctagon size={64} className="text-rose-500" strokeWidth={1.5} />
                </div>

                <div className="text-center space-y-3 w-full">
                    <h3 className="text-xl font-bold text-rose-500 tracking-tight truncate px-2 leading-tight">
                        {form.reason}
                    </h3>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50 inline-block">
                        {form.filamentId !== 'manual' ? (filaments.find(f => String(f.id) === String(form.filamentId))?.nome || 'Filamento Selecionado') : 'Entrada Manual'}
                    </span>
                </div>
            </div>

            <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-6 relative z-10 w-full">
                <div className="flex items-center gap-2 mb-2">
                    <Ban size={12} strokeWidth={2.5} className="text-rose-500/50" />
                    <span className="text-[10px] font-bold text-rose-500/60 uppercase tracking-wider">Prejuízo Estimado</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-rose-500 tracking-tighter">R$ {form.costWasted || '0.00'}</span>
                </div>
            </div>
        </div>
    );

    // Footer Content
    const footerContent = (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={hideFeedback} />

            <div className="flex gap-4">
                <button disabled={loading} onClick={aoFechar} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                    Cancelar
                </button>
                <button
                    disabled={loading || !form.weightWasted}
                    onClick={handleSubmit}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${!loading && form.weightWasted ? "bg-rose-500 text-white hover:bg-rose-400 active:scale-95 hover:shadow-xl shadow-lg shadow-rose-900/20" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {loading ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                    Confirmar Prejuízo
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={aoFechar}
            sidebar={sidebarContent}
            title="Registrar Falha"
            subtitle="Registre desperdícios para abater do lucro bruto mensal"
            footer={footerContent}
            isSaving={loading}
            maxWidth="max-w-4xl"
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <UnifiedInput
                        label="O que aconteceu?"
                        type="select"
                        options={[{ items: reasons.map(r => ({ value: r, label: r })) }]}
                        value={form.reason}
                        onChange={(v) => setForm({ ...form, reason: v })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <UnifiedInput
                            label="Peso Perdido"
                            suffix="g"
                            type="number"
                            placeholder="0"
                            value={form.weightWasted}
                            onChange={(e) => handleWeightChange(e.target.value)}
                        />
                        <UnifiedInput
                            label="Custo Est."
                            suffix="R$"
                            type="number"
                            placeholder="0.00"
                            value={form.costWasted}
                            onChange={(e) => setForm({ ...form, costWasted: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-800/50 space-y-4">
                    <div className="flex items-center gap-2 text-rose-500 mb-2">
                        <Layers size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Abater do Estoque?</span>
                    </div>
                    <UnifiedInput
                        type="select"
                        options={filamentOptions}
                        value={form.filamentId}
                        onChange={handleFilamentChange}
                    />
                </div>
            </div>
        </SideBySideModal>
    );
}
