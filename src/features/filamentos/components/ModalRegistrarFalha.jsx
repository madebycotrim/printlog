import React, { useState, useEffect } from 'react';
import { AlertOctagon, Plus, Trash2, X, Save, Layers, Loader2, AlertCircle } from 'lucide-react';
import { UnifiedInput } from '../../../components/UnifiedInput';
import { useFilamentStore } from '../logic/filaments';
import FormFeedback from '../../../components/FormFeedback';
import { useFormFeedback } from '../../../hooks/useFormFeedback';
import api from '../../../utils/api';

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

    const { filaments, fetchFilaments } = useFilamentStore();

    useEffect(() => {
        if (aberto) fetchFilaments();
    }, [aberto, fetchFilaments]);

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
            // Post directly or use callback
            await api.post('/failures', form);

            showSuccess('Falha registrada com sucesso!');
            if (aoSalvar) aoSalvar(); // Refresh stats callback

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
                cost = (pricePerGram * Number(weight)).toFixed(2);
            }
        }
        setForm(prev => ({ ...prev, weightWasted: weight, costWasted: cost }));
    };

    const filamentOptions = [
        { group: "Ações", items: [{ value: "manual", label: "Nenhum / Apenas Registrar" }] },
        {
            group: "Meus Filamentos",
            items: filaments.map(f => ({ value: String(f.id), label: f.nome, color: f.cor_hex }))
        }
    ];

    if (!aberto) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm modal-backdrop">
            <div className="absolute inset-0" onClick={aoFechar} />

            <div className="relative bg-zinc-950 border border-rose-500/30 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                <header className="p-6 border-b border-zinc-800/50 bg-zinc-950/40/10 flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-rose-500 flex items-center gap-2">
                            <AlertOctagon size={16} /> Nova Falha
                        </h3>
                        <p className="text-[10px] text-zinc-500 mt-1 max-w-[250px]">
                            Registre desperdícios para abater do lucro bruto mensal.
                        </p>
                    </div>
                    <button onClick={aoFechar} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </header>

                <div className="p-6 space-y-4">
                    <UnifiedInput
                        label="O que aconteceu?"
                        type="select"
                        options={[{ items: reasons.map(r => ({ value: r, label: r })) }]}
                        value={form.reason}
                        onChange={(v) => setForm({ ...form, reason: v })}
                    />

                    <div className="grid grid-cols-2 gap-3">
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

                    <div className="pt-2 border-t border-zinc-800/50">
                        <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 block">Filamento (Para descontar estoque)</label>
                        <UnifiedInput
                            type="select"
                            icon={Layers}
                            options={filamentOptions}
                            value={form.filamentId}
                            onChange={handleFilamentChange}
                        />
                    </div>
                </div>

                <footer className="p-6 pt-2 bg-zinc-950/40/10 flex flex-col gap-3">
                    <FormFeedback
                        type={feedback.type}
                        message={feedback.message}
                        show={feedback.show}
                        onClose={hideFeedback}
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !form.weightWasted}
                        className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-900/20"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Confirmar Prejuízo
                    </button>
                </footer>
            </div>
        </div>
    );
}
