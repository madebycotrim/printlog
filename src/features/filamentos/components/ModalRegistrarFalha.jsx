import React, { useState, useMemo } from 'react';
import { AlertOctagon, Layers, Loader2, Save, Ban } from 'lucide-react';
import SpoolVectorView from './Carretel';
import { UnifiedInput } from '../../../components/UnifiedInput';
import { useFilaments } from '../logic/filamentQueries';
import FormFeedback from '../../../components/FormFeedback';
import { useFormFeedback } from '../../../hooks/useFormFeedback';
import SideBySideModal from '../../../components/ui/SideBySideModal';
import api from '../../../utils/api';
import { parseNumber } from "../../../utils/numbers";

export default function ModalRegistrarFalha({ aberto, aoFechar, aoSalvar }) {
    const [loading, setLoading] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
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
        if (!form.weightWasted) {
            setShowErrors(true);
            return;
        }
        setLoading(true);
        hideFeedback();
        try {
            await api.post('/failures', form);

            showSuccess('Falha registrada com sucesso!');
            if (aoSalvar) aoSalvar();

            setTimeout(() => {
                aoFechar();
                setForm({ weightWasted: '', costWasted: '', reason: 'Falha de Aderência', filamentId: 'manual' });
                setShowErrors(false);
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

    // Sidebar Content match ModalFilamento aesthetic
    const sidebarContent = (
        <div className="flex flex-col items-center w-full h-full relative z-10 justify-between py-6">
            {/* Contextual Header */}
            <div className="w-full flex justify-between items-center px-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Alerta</span>
                </div>
                <div className="text-[10px] font-mono font-bold text-zinc-700">
                    FALHA
                </div>
            </div>

            {/* Central Icon Visualization */}
            <div className="relative group w-full flex-1 flex items-center justify-center select-none">
                {/* Dynamic Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full opacity-20 blur-[60px] bg-rose-500 transition-all duration-700 pointer-events-none" />

                {/* Icon Container or Spool View */}
                <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-105 pointer-events-none drop-shadow-2xl">
                    {form.filamentId !== 'manual' && filaments.find(f => String(f.id) === String(form.filamentId)) ? (
                        <SpoolVectorView
                            color={filaments.find(f => String(f.id) === String(form.filamentId)).cor_hex}
                            size={200}
                            percent={80} // Fixed visual for failure mode
                        />
                    ) : (
                        <div className="w-48 h-48 rounded-full bg-zinc-900/50 border border-rose-500/20 flex items-center justify-center backdrop-blur-sm shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                            <AlertOctagon size={80} className="text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" strokeWidth={1.5} />
                        </div>
                    )}
                </div>

                {/* Info Overlay */}
                <div className="absolute inset-x-0 bottom-6 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <p className="text-[9px] font-bold text-rose-500/80 uppercase tracking-widest mb-1">Motivo</p>
                    <h3 className="text-xl font-bold text-white drop-shadow-lg leading-tight px-4 line-clamp-2">
                        {form.reason}
                    </h3>
                </div>
            </div>

            {/* Prejuízo Card */}
            <div className="w-full px-6 pb-2">
                <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-5 rounded-3xl flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Material Afetado</span>
                            <span className="text-xs font-bold text-zinc-300 truncate max-w-[180px]">
                                {form.filamentId !== 'manual' ? (filaments.find(f => String(f.id) === String(form.filamentId))?.nome || 'Selecionando...') : 'Registro Manual'}
                            </span>
                        </div>
                    </div>

                    <div className="h-px w-full bg-zinc-800/50" />

                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Prejuízo Estimado</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-mono text-zinc-500">R$</span>
                            <span className="text-2xl font-bold font-mono text-rose-400 tracking-tighter shadow-rose-500/10 drop-shadow-md">
                                {form.costWasted || '0.00'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Footer Content
    const footerContent = ({ onClose }) => (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={hideFeedback} />

            <div className="flex gap-4">
                <button disabled={loading} onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                    Cancelar
                </button>
                <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${!loading ? "bg-rose-500 text-white hover:bg-rose-400 active:scale-95 hover:shadow-xl shadow-lg shadow-rose-900/20" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
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
            header={{ title: "Registrar Falha", subtitle: "Registre desperdícios para abater do lucro bruto mensal" }}
            footer={footerContent}
            isSaving={loading}
            isDirty={!!form.weightWasted}
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
                            error={showErrors && !form.weightWasted}
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
