import React, { useState } from 'react';
import { AlertOctagon, Plus, Trash2, X, Save, Layers, Loader2 } from 'lucide-react';
import { UnifiedInput } from '../../../components/UnifiedInput';
import { useFilamentStore } from '../../filamentos/logic/filaments';

export default function FailureWidget({ stats, onRegisterFailure }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState({
        weightWasted: '',
        costWasted: '',
        reason: 'Falha de Aderência',
        filamentId: 'manual',
    });

    const { filaments } = useFilamentStore();

    const reasons = [
        "Falha de Aderência", "Entupimento de Bico", "Queda de Energia",
        "Erro no Fatiamento", "Fim de Filamento", "Warping (Empenamento)",
        "Layer Shift", "Outros"
    ];

    const handleSubmit = async () => {
        if (!form.weightWasted) return;
        setLoading(true);
        try {
            await onRegisterFailure(form);
            setIsExpanded(false);
            setForm({ weightWasted: '', costWasted: '', reason: 'Falha de Aderência', filamentId: 'manual' });
        } catch (error) {
            console.error(error);
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
        { group: "Ações", items: [{ value: "manual", label: "Não descontar estoque (Apenas registro)" }] },
        {
            group: "Descontar do Estoque",
            items: filaments.map(f => ({ value: String(f.id), label: f.nome, color: f.cor_hex }))
        }
    ];

    if (!isExpanded) {
        return (
            <div className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6 hover-lift flex flex-col justify-between group h-full">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                            Desperdício (30d)
                        </h3>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                            <AlertOctagon size={20} className="text-orange-500" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-3xl font-mono font-black text-zinc-200">
                            {stats?.totalWeight ? `${Number(stats.totalWeight).toFixed(0)}g` : '0g'}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium">
                            Perda estimada: <span className="text-orange-400">R$ {stats?.totalCost ? Number(stats.totalCost).toFixed(2) : '0.00'}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(true)}
                    className="mt-6 w-full py-3 rounded-xl bg-zinc-950/40 border border-zinc-800 text-[10px] font-black uppercase text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={14} /> Registrar Falha
                </button>
            </div>
        );
    }

    // EXPANDED MODE (FORM)
    return (
        <div className="bg-zinc-950 border border-orange-500/30 rounded-2xl p-6 relative animate-in zoom-in-95 duration-200 shadow-2xl h-full flex flex-col">
            <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
                disabled={loading}
            >
                <X size={16} />
            </button>

            <header className="mb-6">
                <h3 className="text-sm font-black uppercase tracking-wider text-orange-500 flex items-center gap-2">
                    <AlertOctagon size={16} /> Nova Falha
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1">Isso será deduzido do seu lucro bruto mensal.</p>
            </header>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
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
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Origem do Material (Opcional)</label>
                    <UnifiedInput
                        type="select"
                        icon={Layers}
                        options={filamentOptions}
                        value={form.filamentId}
                        onChange={handleFilamentChange}
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading || !form.weightWasted}
                className="mt-6 w-full py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Confirmar Prejuízo
            </button>
        </div>
    );
}
