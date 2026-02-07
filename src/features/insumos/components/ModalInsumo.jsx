import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { validateInput, schemas } from '../../../utils/validation';
import { Loader2, Package, Box, AlertCircle, Layers, Link, Zap, Hammer, PackageSearch, DollarSign, CheckCircle2 } from 'lucide-react';
import { UnifiedInput } from '../../../components/UnifiedInput';
import { useSupplyStore } from '../logic/supplies';
import FormFeedback from '../../../components/FormFeedback';
import { useFormFeedback } from '../../../hooks/useFormFeedback';
import SideBySideModal from '../../../components/ui/SideBySideModal';


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
    brand: '',
    price: '',
    unit: 'un',
    minStock: '5',
    currentStock: '0',
    category: 'geral',
    purchaseLink: '',
    stockYield: '1',
    usageUnit: '',
    isFractionable: false
};

const CATEGORIES_CONFIG = [
    { id: 'geral', label: 'Geral', icon: Layers, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
    { id: 'embalagem', label: 'Embalagem', icon: Box, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'fixacao', label: 'Fixação', icon: Link, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { id: 'eletronica', label: 'Eletrônica', icon: Zap, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { id: 'acabamento', label: 'Acabamento', icon: Hammer, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { id: 'outros', label: 'Outros', icon: PackageSearch, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
];

export default function ModalInsumo({ isOpen, onClose, editingItem }) {
    const { saveSupply } = useSupplyStore();
    const { feedback, showSuccess, showError, hide } = useFormFeedback();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(INITIAL_STATE);
    const [mostrarErros, setMostrarErros] = useState(false);
    const [isDirty, setIsDirty] = useState(false);


    useEffect(() => {
        if (isOpen) {
            hide();
            setIsDirty(false);

            if (editingItem) {
                const stockYield = String(editingItem.rendimento_estoque ?? editingItem.stockYield ?? editingItem.stock_yield ?? 1);
                setForm({
                    ...editingItem,
                    name: editingItem.nome ?? editingItem.name ?? '',
                    brand: editingItem.marca ?? editingItem.brand ?? '',
                    price: String(editingItem.preco ?? editingItem.price ?? 0).replace('.', ','),
                    minStock: String(editingItem.estoque_minimo ?? editingItem.minStock ?? editingItem.min_stock ?? 0),
                    currentStock: String(editingItem.estoque_atual ?? editingItem.currentStock ?? editingItem.current_stock ?? 0),
                    category: (editingItem.categoria ?? editingItem.category ?? 'geral').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
                    unit: editingItem.unidade ?? editingItem.unit ?? 'un',
                    purchaseLink: editingItem.link_compra ?? editingItem.purchaseLink ?? editingItem.purchase_link ?? '',
                    stockYield: stockYield,
                    usageUnit: editingItem.unidade_uso ?? editingItem.usageUnit ?? editingItem.usage_unit ?? '',
                    isFractionable: Number(stockYield) > 1
                });
            } else {
                setForm(INITIAL_STATE);
            }
        }
    }, [isOpen, editingItem, hide]);

    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        if (mostrarErros) setMostrarErros(false);
    };

    const handleTentativaFechar = useCallback(() => {
        if (loading) return;
        setMostrarErros(false);
        onClose();
    }, [loading, onClose]);

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
            brand: form.brand?.trim(),

            // Inglês
            price: price,
            minStock: min,
            currentStock: stock,
            category: form.category,
            unit: form.unit,
            purchaseLink: form.purchaseLink?.trim(),

            // Português / Snake Case (Possíveis variações do Backend)
            preco: price,
            marca: form.brand?.trim(),
            estoque_minimo: min,
            min_stock: min,
            estoque_atual: stock,
            current_stock: stock,
            categoria: form.category,
            unidade: form.unit,
            link_compra: form.purchaseLink?.trim()
        };

        const check = validateInput(payload, schemas.supply);

        // MANUAL VALIDATION FOR MANDATORY FIELDS (that might pass schema if schema is loose)
        const isNameValid = !!form.name?.trim();
        // Allow price 0. Only check if it's a valid number. safeParse returns 0 for empty/invalid.
        // We might want to ensure it's not negative.
        const isPriceValid = safeParse(form.price) >= 0;

        if (!check.valid || !isNameValid || !isPriceValid) {
            setMostrarErros(true);
            return;
        }

        setLoading(true);
        hide();
        try {
            await saveSupply(payload);
            // showSuccess is not useful if we close immediately, but we keep the intent of "done"
            onClose();
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
        price: safeParse(form.price) || null, // Force null if 0 or empty to fail "required" check if schema demands it, or handle it manually
        minStock: safeParse(form.minStock),
        currentStock: safeParse(form.currentStock)
    }), [form]);

    const isValid = useMemo(() => validateInput(payloadValidacao, schemas.supply).valid, [payloadValidacao]);


    // Footer Content
    const footerContent = ({ onClose }) => (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={hide} />

            <div className="flex gap-4">
                <button
                    disabled={loading}
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.98]
                        ${!loading
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-900/20 hover:brightness-110 border border-blue-400/20"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"}`}
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : (editingItem ? <CheckCircle2 size={16} /> : <Package size={16} />)}
                    {loading ? "Salvando..." : editingItem ? "Salvar Alterações" : "Adicionar Insumo"}
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={isOpen}
            onClose={handleTentativaFechar}
            sidebar={null}
            header={{
                title: editingItem ? "Editar Insumo" : "Novo Insumo",
                subtitle: editingItem ? "Atualize as informações do material." : "Adicione um novo item ao seu estoque."
            }}
            footer={footerContent}
            isSaving={loading}
            isDirty={isDirty}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-8">

                {/* [01] IDENTIFICAÇÃO - Minimalist Clean */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50">
                        <PackageSearch size={14} className="text-zinc-500" />
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Identificação</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                        {/* Nome */}
                        <div className="space-y-1.5 md:col-span-1">
                            <label className={`text-[10px] font-bold uppercase tracking-wide px-1 ${mostrarErros && !form.name ? "text-rose-500" : "text-zinc-500"}`}>
                                Nome do Material {mostrarErros && !form.name && "*"}
                            </label>
                            <UnifiedInput
                                value={form.name}
                                onChange={e => updateForm('name', e.target.value)}
                                placeholder="Ex: Parafuso M3 x 10mm"
                                icon={Package}
                                error={mostrarErros && !form.name}
                            />
                        </div>

                        {/* Marca */}
                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Marca / Fabricante</label>
                            <UnifiedInput
                                value={form.brand}
                                onChange={e => updateForm('brand', e.target.value)}
                                placeholder="Ex: 3M, Vonder..."
                            />
                        </div>

                        {/* Categoria */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Categoria</label>
                            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
                                {CATEGORIES_CONFIG.map((cat) => {
                                    const isSelected = form.category === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => updateForm('category', cat.id)}
                                            className={`
                                                flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none whitespace-nowrap min-w-fit
                                                ${isSelected
                                                    ? "bg-zinc-800 border-zinc-600 text-zinc-100 shadow-sm"
                                                    : "bg-transparent border-zinc-800/60 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400 hover:bg-zinc-900/30"}
                                            `}
                                        >
                                            <cat.icon
                                                size={15}
                                                strokeWidth={2}
                                                className={`transition-colors duration-200 ${isSelected ? "text-zinc-100" : "text-zinc-500"}`}
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">
                                                {cat.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* [02] ESTOQUE & VALORES - Minimalist Clean */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50">
                        <Box size={14} className="text-zinc-500" />
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estoque & Custos</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">

                        {/* Estoque Atual */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Estoque Atual</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <UnifiedInput
                                        value={form.currentStock}
                                        onChange={e => updateForm('currentStock', e.target.value)}
                                        placeholder="0"
                                        inputMode="decimal"
                                        className="font-mono text-zinc-300"
                                    />
                                </div>
                                <div className="w-24">
                                    <UnifiedInput
                                        type="select"
                                        value={form.unit}
                                        onChange={v => updateForm('unit', v)}
                                        options={[{ items: ['un', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'folha', 'cx', 'pct'].map(u => ({ value: u, label: u })) }]}
                                        placeholder="Un"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Custo Unitário */}
                        <div className="space-y-1.5 md:col-span-1">
                            <label className={`text-[10px] font-bold uppercase tracking-wide px-1 ${mostrarErros && safeParse(form.price) < 0 ? "text-rose-500" : "text-zinc-500"}`}>
                                Custo Unitário
                            </label>
                            <UnifiedInput
                                value={form.price}
                                onChange={e => updateForm('price', e.target.value)}
                                placeholder="0,00"
                                suffix="BRL"
                                icon={DollarSign}
                                inputMode="decimal"
                                error={mostrarErros && safeParse(form.price) < 0}
                            />
                        </div>

                        {/* Mínimo & Compra */}
                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Estoque Mínimo</label>
                            <UnifiedInput
                                value={form.minStock}
                                onChange={e => updateForm('minStock', e.target.value)}
                                placeholder="5"
                                icon={AlertCircle}
                                inputMode="decimal"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Link de Compra</label>
                            <UnifiedInput
                                value={form.purchaseLink}
                                onChange={e => updateForm('purchaseLink', e.target.value)}
                                placeholder="https://..."
                                icon={Link}
                            />
                        </div>

                        {/* --- Toggle Fracionável Minimalist --- */}
                        <div className="md:col-span-2 pt-2">
                            <div
                                onClick={() => {
                                    const newState = !form.isFractionable;
                                    updateForm('isFractionable', newState);
                                    if (newState && (!form.stockYield || form.stockYield === '1')) {
                                        updateForm('stockYield', '30');
                                        updateForm('usageUnit', 'm');
                                    }
                                    if (!newState) {
                                        updateForm('stockYield', '1');
                                        updateForm('usageUnit', '');
                                    }
                                }}
                                className={`
                                    cursor-pointer rounded-lg border transition-all duration-200 p-3
                                    ${form.isFractionable
                                        ? "bg-zinc-900 border-zinc-700"
                                        : "bg-transparent border-zinc-800 hover:bg-zinc-900/50 hover:border-zinc-700"}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-4 h-4 rounded border flex items-center justify-center transition-all duration-200
                                        ${form.isFractionable ? 'bg-zinc-700 border-zinc-600' : 'border-zinc-700 bg-transparent'}
                                    `}>
                                        {form.isFractionable && <CheckCircle2 size={10} className="text-white" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-[11px] font-bold uppercase tracking-wide ${form.isFractionable ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                            Item Fracionável
                                        </span>
                                    </div>
                                </div>

                                {/* Campos Extras Minimalist */}
                                {form.isFractionable && (
                                    <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Rendimento Total</label>
                                            <UnifiedInput
                                                value={form.stockYield}
                                                onChange={e => updateForm('stockYield', e.target.value)}
                                                placeholder="30"
                                                suffix={form.usageUnit || 'un'}
                                                className="h-8 text-xs bg-zinc-900/20 box-border"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Un. de Consumo</label>
                                            <UnifiedInput
                                                value={form.usageUnit}
                                                onChange={e => updateForm('usageUnit', e.target.value)}
                                                placeholder="m, ml..."
                                                className="h-8 text-xs bg-zinc-900/20 box-border"
                                            />
                                        </div>

                                        <div className="col-span-2 flex items-center justify-between pt-1">
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">Custo Efetivo:</span>
                                            <span className="text-xs font-mono font-bold text-zinc-300">
                                                {((safeParse(form.price) / (safeParse(form.stockYield) || 1))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                <span className="text-zinc-600 ml-1">/ {form.usageUnit || 'un'}</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </SideBySideModal>
    );
}
