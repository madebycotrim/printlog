import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { validateInput, schemas } from '../../../utils/validation';
import { Loader2, Package, Box, AlertCircle, Terminal, Activity, Layers, Link, Zap, Hammer, PackageSearch, DollarSign, BarChart3, CheckCircle2 } from 'lucide-react';
import { UnifiedInput } from '../../../components/UnifiedInput';
import { useSupplyStore } from '../logic/supplies';
import FormFeedback from '../../../components/FormFeedback';
import { useFormFeedback } from '../../../hooks/useFormFeedback';
import Modal from '../../../components/ui/Modal'; // Switched back to standard Modal
import { SupplyCard } from './SupplyCard';

// Utilitário de formatação de valores melhorado
const safeParse = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;

    // Converte virgula para ponto para suportar decimais brasileiros
    const stringVal = String(val).replace(',', '.');
    const parsed = parseFloat(stringVal);

    return isNaN(parsed) ? 0 : parsed;
};

const INITIAL_STATE = {
    name: '',
    price: '',
    unit: 'un',
    minStock: '5',
    currentStock: '0',
    category: 'geral',
    description: ''
};

const CATEGORIES_CONFIG = [
    { id: 'geral', label: 'Geral', icon: Layers, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
    { id: 'embalagem', label: 'Embalagem', icon: Box, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'fixacao', label: 'Fixação', icon: Link, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { id: 'eletronica', label: 'Eletrônica', icon: Zap, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { id: 'acabamento', label: 'Acabamento', icon: Hammer, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { id: 'outros', label: 'Outros', icon: PackageSearch, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
];

export default function ModalInsumo({ isOpen, onClose, editingItem }) {
    const { saveSupply } = useSupplyStore();
    const { feedback, showSuccess, showError, hide } = useFormFeedback();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(INITIAL_STATE);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (isOpen) {
            hide();
            setIsDirty(false);
            if (editingItem) {
                setForm({
                    ...editingItem,
                    price: String(editingItem.price || editingItem.preco || 0).replace('.', ','),
                    minStock: String(editingItem.minStock || editingItem.estoque_minimo || 0),
                    currentStock: String(editingItem.currentStock || editingItem.estoque_atual || 0),
                    category: (editingItem.category || editingItem.categoria || 'geral').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
                    description: editingItem.description || editingItem.descricao || '',
                    unit: editingItem.unit || editingItem.unidade || 'un'
                });
            } else {
                setForm(INITIAL_STATE);
            }
        }
    }, [isOpen, editingItem, hide]);

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
        // Garantir que os valores numéricos sejam processados corretamente
        const stock = safeParse(form.currentStock);
        const min = safeParse(form.minStock);
        const price = safeParse(form.price);

        // PAYLOAD HÍBRIDO (Bilingue)
        // Envia chaves em Inglês e Português para garantir compatibilidade com Backend misto
        const payload = {
            id: editingItem?.id,
            ...form,
            name: form.name?.trim(),

            // Inglês
            price: price,
            minStock: min,
            currentStock: stock,
            category: form.category,
            unit: form.unit,

            // Português / Snake Case (Possíveis variações do Backend)
            preco: price,
            estoque_minimo: min,
            min_stock: min,
            estoque_atual: stock,
            current_stock: stock,
            categoria: form.category,
            unidade: form.unit,
            descricao: form.description
        };

        const check = validateInput(payload, schemas.supply);
        // Note: validation checking only English keys in schema, which is fine since we include them.
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
    // Validação
    const payloadValidacao = useMemo(() => ({
        ...form,
        name: form.name?.trim(),
        // Validamos sobre os valores brutos ou processados? 
        // schemas.supply provavelmente espera numeros.
        price: safeParse(form.price),
        minStock: safeParse(form.minStock),
        currentStock: safeParse(form.currentStock)
    }), [form]);

    const isValid = useMemo(() => validateInput(payloadValidacao, schemas.supply).valid, [payloadValidacao]);


    // Footer Content
    const footerContent = (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={hide} />

            <div className="flex gap-4">
                <button
                    disabled={loading}
                    onClick={handleTentativaFechar}
                    className="flex-1 py-3 px-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    disabled={!isValid || loading}
                    onClick={handleSubmit}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.98]
                        ${isValid && !loading
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-900/20 hover:brightness-110 border border-orange-400/20"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"}`}
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : (editingItem ? <CheckCircle2 size={16} /> : <Package size={16} />)}
                    {loading ? "Salvando..." : editingItem ? "Salvar Alterações" : "Adicionar Insumo"}
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleTentativaFechar}
            title={editingItem ? "Editar Insumo" : "Novo Insumo"}
            subtitle={editingItem ? "Atualize as informações do material." : "Adicione um novo item ao seu estoque."}
            icon={Package}
            footer={footerContent}
            isLoading={loading}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-10">
                {/* 1. SELEÇÃO DE CATEGORIA (VISUAL) */}
                <section className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers size={14} className="text-zinc-400" />
                        Categoria
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {CATEGORIES_CONFIG.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => updateForm('category', cat.id)}
                                className={`
                                    relative p-2 rounded-lg border flex items-center gap-3 transition-all duration-300 group
                                    ${form.category === cat.id
                                        ? `${cat.bg} ${cat.border} ring-1 ring-white/10`
                                        : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'}
                                `}
                            >
                                <div className={`
                                    p-1.5 rounded-md transition-colors
                                    ${form.category === cat.id ? 'bg-white/10' : 'bg-transparent'}
                                `}>
                                    <cat.icon
                                        size={16}
                                        className={`transition-colors duration-300 ${form.category === cat.id ? cat.color : 'text-zinc-500 group-hover:text-zinc-300'}`}
                                    />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${form.category === cat.id ? 'text-zinc-100' : 'text-zinc-500'}`}>
                                    {cat.label}
                                </span>

                                {form.category === cat.id && (
                                    <div className={`absolute inset-0 rounded-lg bg-current opacity-5 pointer-events-none ${cat.color}`} />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="h-px bg-white/5" />

                {/* 2. DADOS BÁSICOS */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Activity size={14} className="text-zinc-400" />
                            Informações Básicas
                        </h4>
                        <UnifiedInput
                            label="Nome do Insumo"
                            placeholder="Ex: Filamento PLA, Parafuso M3..."
                            value={form.name}
                            onChange={e => updateForm('name', e.target.value)}
                        />
                    </div>

                    <UnifiedInput
                        label="Descrição (Opcional)"
                        placeholder="Detalhes adicionais..."
                        value={form.description}
                        onChange={e => updateForm('description', e.target.value)}
                    />

                    {/* Preço Unitário */}
                    <UnifiedInput
                        label="Custo Unitário"
                        placeholder="0,00"
                        suffix="R$"
                        icon={DollarSign}
                        value={form.price}
                        onChange={e => updateForm('price', e.target.value)}
                    />
                </section>

                <div className="h-px bg-white/5" />

                {/* 3. ESTOQUE & CONTROLE */}
                <section className="space-y-4">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <BarChart3 size={14} className="text-zinc-400" />
                        Estoque e Unidade
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <UnifiedInput
                            label="Estoque Atual"
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

                        <UnifiedInput
                            label="Mínimo (Alerta)"
                            type="number"
                            value={form.minStock}
                            onChange={e => updateForm('minStock', e.target.value)}
                            tip="Quantidade para alerta de reposição"
                        />
                    </div>
                </section>
            </div>
        </Modal>
    );
}
