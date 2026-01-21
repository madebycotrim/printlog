import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { validateInput, schemas } from '../../../utils/validation';
import { Loader2, Package, Box, AlertCircle, Terminal, Activity } from 'lucide-react';
import { UnifiedInput } from '../../../components/UnifiedInput';
import { useSupplyStore } from '../logic/supplies';
import FormFeedback from '../../../components/FormFeedback';
import { useFormFeedback } from '../../../hooks/useFormFeedback';
import SideBySideModal from '../../../components/ui/SideBySideModal';

// Utilitário de formatação de valores
const safeParse = (val) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    if (typeof val === 'object') return 0; // Prevent [object Object] crashes
    const parsed = parseFloat(String(val).replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
};

const INITIAL_STATE = {
    name: '',
    price: '',
    unit: 'un',
    minStock: '5',
    currentStock: '0',

    category: 'Outros',
    description: ''
};

export default function ModalInsumo({ isOpen, onClose, editingItem }) {
    const { saveSupply } = useSupplyStore();
    const { feedback, showSuccess, showError, hide } = useFormFeedback();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(INITIAL_STATE);
    const [isDirty, setIsDirty] = useState(false);

    const categoryOptions = useMemo(() => [
        { items: ['Embalagem', 'Fixação', 'Eletrônica', 'Acabamento', 'Outros', 'Geral'].map(c => ({ value: c, label: c })) }
    ], []);

    useEffect(() => {
        if (isOpen) {
            hide();
            setIsDirty(false);
            if (editingItem) {
                setForm({
                    ...editingItem,
                    price: String(editingItem.price).replace('.', ','),
                    minStock: String(editingItem.minStock || 0),
                    currentStock: String(editingItem.currentStock || 0),
                    category: editingItem.category || 'Outros',
                    description: editingItem.description || ''
                });
            } else {
                setForm(INITIAL_STATE);
            }
        }
    }, [isOpen, editingItem]); // Remove 'hide' from deps

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleTentativaFechar = useCallback(() => {
        if (loading) return;
        if (isDirty) {
            if (window.confirm("Você tem alterações não salvas. Deseja realmente sair?")) {
                onClose();
            }
        } else {
            onClose();
        }
    }, [loading, isDirty, onClose]);

    const handleSubmit = async () => {
        const payload = {
            id: editingItem?.id,
            ...form,
            name: form.name?.trim(),
            price: safeParse(form.price),
            minStock: safeParse(form.minStock),
            currentStock: safeParse(form.currentStock)
        };

        const check = validateInput(payload, schemas.supply);
        if (!check.valid) {
            showError(check.errors[0]);
            return;
        }

        setLoading(true);
        hide();
        try {
            await saveSupply(payload);
            showSuccess(editingItem ? 'Insumo atualizado!' : 'Insumo cadastrado!');
            setTimeout(onClose, 1000);
        } catch (_error) {
            showError('Erro ao salvar insumo.');
        } finally {
            setLoading(false);
        }
    };

    // Validação robusta
    const payloadValidacao = useMemo(() => ({
        ...form,
        name: form.name?.trim(),
        price: safeParse(form.price),
        minStock: safeParse(form.minStock),
        currentStock: safeParse(form.currentStock)
    }), [form]);

    const validationResult = useMemo(() => validateInput(payloadValidacao, schemas.supply), [payloadValidacao]);
    const isValid = validationResult.valid;

    // Sidebar Content
    const sidebarContent = (
        <div className="flex flex-col items-center w-full space-y-10 relative z-10 h-full justify-between">
            <div className="w-full">
                {/* Header da Prévia */}
                <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-10">
                    <div className="h-px w-4 bg-zinc-900/50" />
                    <span>Prévia</span>
                    <div className="h-px w-4 bg-zinc-900/50" />
                </div>

                {/* Card do Ícone (Hero) */}
                <div className="relative group p-10 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm w-fit mx-auto mb-10">
                    <div className="relative scale-150">
                        <div className="w-24 h-24 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_50px_rgba(249,115,22,0.15)] relative">
                            <Box size={48} className="text-orange-500" strokeWidth={1.5} />

                            {/* Badge decorativa */}
                            <div className="absolute -bottom-3 -right-3 bg-zinc-900 rounded-lg px-2.5 py-1.5 border border-zinc-800 flex items-center gap-2 shadow-xl z-20">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-wider">BOX</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informações Principais */}
                <div className="text-center space-y-3 w-full">
                    <h3 className="text-xl font-bold text-zinc-100 tracking-tight truncate px-2 leading-tight">
                        {form.name || "Novo Insumo"}
                    </h3>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50 inline-block">
                        {form.unit} • Estoque: {form.currentStock}
                    </span>
                </div>
            </div>

            {/* Card de Valor (Bottom) */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 relative z-10 w-full">
                <div className="flex items-center gap-2 mb-2">
                    <Activity size={12} className="text-orange-500/50" />
                    <span className="text-[10px] font-bold text-orange-500/60 uppercase tracking-wider">Valor em Estoque</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-zinc-100 tracking-tighter">
                        R$ {(safeParse(form.price) * safeParse(form.currentStock)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>
        </div>
    );

    // Footer Content
    const footerContent = (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={hide} />

            {!isValid && isDirty && !loading && (
                <div className="flex items-center gap-2 text-rose-500 animate-shake mb-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Preencha os campos obrigatórios</span>
                </div>
            )}

            <div className="flex gap-4">
                <button disabled={loading} onClick={handleTentativaFechar} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                    Cancelar
                </button>
                <button
                    disabled={!isValid || loading}
                    onClick={handleSubmit}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${isValid && !loading ? "bg-orange-500 text-zinc-950 hover:bg-orange-400 active:scale-95 hover:shadow-xl shadow-lg shadow-orange-900/20" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                    {loading ? "Processando..." : editingItem ? "Salvar Alterações" : "Adicionar Insumo"}
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={isOpen}
            onClose={handleTentativaFechar}
            sidebar={sidebarContent}
            title={editingItem ? "Editar Insumo" : "Cadastrar Insumo"}
            subtitle={editingItem ? "Atualize os dados do material" : "Adicione um novo material extra ao inventário"}
            footer={footerContent}
            isSaving={loading}
        >
            <div className={`space-y-8 ${loading ? 'pointer-events-none' : ''}`}>
                {/* Seção 01 */}
                <section className="space-y-5">
                    <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[01] Detalhes Básicos</h4>
                        <div className="h-px bg-zinc-800/50 flex-1" />
                    </div>
                    <div className="grid grid-cols-1 gap-5">
                        <UnifiedInput
                            label="Nome do Insumo"
                            placeholder="Ex: Caixa de Papelão, Cola, Lixa..."
                            value={form.name}
                            onChange={e => updateForm('name', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <UnifiedInput
                            label="Categoria"
                            type="select"
                            options={categoryOptions}
                            value={form.category}
                            onChange={v => updateForm('category', v)}
                        />
                        <UnifiedInput
                            label="Descrição (Opcional)"
                            placeholder="Detalhes adicionais..."
                            value={form.description}
                            onChange={e => updateForm('description', e.target.value)}
                        />
                    </div>
                </section>

                {/* Seção 02 */}
                <section className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">[02] Financeiro</h4>
                        <UnifiedInput
                            label="Preço Unitário"
                            placeholder="0,00"
                            suffix="R$"
                            value={form.price}
                            onChange={e => updateForm('price', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">[03] Estoque</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <UnifiedInput
                                label="Atual"
                                type="number"
                                value={form.currentStock}
                                onChange={e => updateForm('currentStock', e.target.value)}
                            />
                            <UnifiedInput
                                label="Unidade"
                                type="select"
                                options={[{ items: ['un', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'folha'].map(u => ({ value: u, label: u })) }]}
                                value={form.unit}
                                onChange={v => updateForm('unit', v)}
                            />
                        </div>
                    </div>
                </section>

                {/* Seção 03 */}
                <section className="space-y-5">
                    <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[04] Controle</h4>
                        <div className="h-px bg-zinc-800/50 flex-1" />
                    </div>
                    <div className="w-1/2 pr-6">
                        <UnifiedInput
                            label="Estoque Mínimo (Alerta)"
                            type="number"
                            value={form.minStock}
                            onChange={e => updateForm('minStock', e.target.value)}
                        />
                    </div>
                </section>
            </div>
        </SideBySideModal>
    );
}
