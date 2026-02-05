import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, ChevronDown } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { UnifiedInput } from '../../../components/UnifiedInput';
import Button from '../../../components/ui/Button';
import { useSupplyStore } from '../logic/supplies';
import { useToastStore } from '../../../stores/toastStore';

export default function ModalConsumoRapido({ isOpen, onClose, item }) {
    const { quickUpdateStock } = useSupplyStore();
    const { addToast } = useToastStore();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    // Fractional Logic
    const stockYield = Number(item?.stockYield || 1);
    const usageUnit = item?.usageUnit || '';
    const isFractional = stockYield > 1 && !!usageUnit;

    // Base Unit Determination
    const baseUnit = (isFractional ? usageUnit : item?.unit || '').toUpperCase();

    // Unit Conversion Logic
    const UNIT_MAP = {
        'M': { options: ['M', 'CM', 'MM'], factors: { 'M': 1, 'CM': 0.01, 'MM': 0.001 } },
        'KG': { options: ['KG', 'G'], factors: { 'KG': 1, 'G': 0.001 } },
        'L': { options: ['L', 'ML'], factors: { 'L': 1, 'ML': 0.001 } }
    };

    const availableUnits = UNIT_MAP[baseUnit] || { options: [baseUnit], factors: { [baseUnit]: 1 } };
    const [selectedUnit, setSelectedUnit] = useState(baseUnit);

    useEffect(() => {
        if (isOpen && item) {
            setAmount('');
            setShowErrors(false);
            const unit = (isFractional ? usageUnit : item.unit || '').toUpperCase();
            setSelectedUnit(unit);
        }
    }, [isOpen, item, isFractional, usageUnit]);

    if (!item) return null;

    // Current Stock Calculations (Always in Base Unit for visualization)
    const currentStock = Number(item.currentStock || 0);
    const effectiveStock = currentStock * stockYield; // Total in Base Unit (e.g., Total Meters)

    // Display Logic
    const currentDisplayVal = isFractional ? effectiveStock : currentStock;
    const conversionFactor = availableUnits.factors[selectedUnit] || 1;

    // Prediction Logic:
    // Input is in `selectedUnit`. Convert to `baseUnit` to subtract from Total.
    const parsedAmount = Number(amount.replace(',', '.')) || 0;
    const normalizedAmount = parsedAmount * conversionFactor; // e.g. 50 CM * 0.01 = 0.5 M

    const finalDisplayVal = Math.max(0, currentDisplayVal - normalizedAmount);

    // Formatting helper
    const fmt = (n) => typeof n === 'number' ? n.toFixed(isFractional ? 1 : 0).replace('.0', '') : n;

    const handleConfirm = async () => {
        const val = Number(amount.replace(',', '.'));

        if (!val || val <= 0) {
            setShowErrors(true);
            return;
        }

        setLoading(true);
        try {
            // 1. Convert Input (Selected Unit) -> Base Unit (Usage Unit)
            // e.g. User input 50 CM. baseUnit is M. normalized = 0.5 M.
            const amountInBaseUnit = val * conversionFactor;

            // 2. Convert Base Unit -> Stock Unit (e.g. Un)
            // If fractional (1 Un = 5 M), then deductionInStock = 0.5 / 5 = 0.1 Un.
            // If not fractional, deductionInStock = amountInBaseUnit.
            let deductionInStockUnits = amountInBaseUnit;
            if (isFractional) {
                deductionInStockUnits = amountInBaseUnit / stockYield;
            }

            const newStock = Math.max(0, currentStock - deductionInStockUnits);

            // Call Store
            const success = await quickUpdateStock(item.id, newStock);
            if (success) {
                addToast(`Consumo de ${val} ${selectedUnit} registrado!`, "success");
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Uso"
            subtitle="Lançar consumo de material do estoque"
            isDirty={amount !== '' && amount !== '0'}
            footer={({ onClose }) => (
                <div className="flex gap-4 w-full">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-14 text-[11px] font-bold tracking-widest uppercase border border-zinc-800"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-[2] h-14 bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 text-[11px] font-bold tracking-widest uppercase"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Confirmar Uso"}
                    </Button>
                </div>
            )}
        >
            <div className="space-y-6">

                {/* Item Header & Stats */}
                <div className="relative overflow-hidden rounded-2xl bg-[#09090b] border border-white/5 p-6 text-center group">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent opacity-20" />

                    <div className="relative z-10">
                        <h3 className="font-black text-white text-xl tracking-tight leading-none uppercase drop-shadow-lg mb-6">
                            {item.name}
                        </h3>

                        {/* Stats Prediction Bar */}
                        <div className="flex items-center justify-between bg-zinc-900/50 rounded-xl p-4 border border-white/5 relative">
                            {/* Current */}
                            <div className="flex flex-col items-start relative z-10">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Atual</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-white tracking-tighter">
                                        {fmt(currentDisplayVal)}
                                    </span>
                                    <span className="text-xs font-bold text-zinc-600 uppercase">{baseUnit}</span>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="text-zinc-700">
                                <ArrowRight size={20} />
                            </div>

                            {/* Final */}
                            <div className="flex flex-col items-end relative z-10">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Final</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-black tracking-tighter ${finalDisplayVal === 0 ? 'text-rose-500' : 'text-sky-500'}`}>
                                        {fmt(finalDisplayVal)}
                                    </span>
                                    <span className={`text-xs font-bold uppercase ${finalDisplayVal === 0 ? 'text-rose-500/50' : 'text-sky-500/50'}`}>{baseUnit}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input with Unit Selector */}
                <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                        <div className="flex-1">
                            <UnifiedInput
                                label="Quantidade a debitar *"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    if (showErrors && e.target.value) setShowErrors(false);
                                }}
                                placeholder="0"
                                type="text"
                                inputMode="decimal"
                                min="0"
                                autoFocus
                                variant="default"
                                error={showErrors && (!amount || Number(amount.replace(',', '.')) <= 0)}
                            />
                        </div>

                        {/* Unit Selector */}
                        <div className="w-28 shrink-0 relative">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block tracking-wider">Unidade</label>
                            <div className="relative">
                                <select
                                    value={selectedUnit}
                                    onChange={(e) => setSelectedUnit(e.target.value)}
                                    className="w-full h-10 pl-3 pr-8 bg-black/20 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-200 uppercase focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 appearance-none cursor-pointer hover:bg-black/40 transition-colors"
                                >
                                    {availableUnits.options.map(u => (
                                        <option key={u} value={u} className="bg-zinc-900 text-zinc-300">{u}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Add Presets */}
                    <div className="grid grid-cols-4 gap-2">
                        {(() => {
                            // Calculate sensible presets based on current Unit/Stock
                            // Since amount is in `selectedUnit`, presets should be too.
                            // But `maxVal` (Stock) is in `baseUnit`.
                            // So we need to show presets that make sense for the SELECTED unit.

                            // Heuristic: If Base=M and Selected=CM, stock might be 5M = 500CM. Presets should be 10, 50, 100 CM.
                            // If Selected=Base, standard presets.

                            const maxValInSelectedUnit = (isFractional ? effectiveStock : currentStock) / conversionFactor;

                            let presets = [];
                            if (maxValInSelectedUnit <= 10) presets = [1, 2, 3, 5];
                            else if (maxValInSelectedUnit <= 50) presets = [5, 10, 20];
                            else if (maxValInSelectedUnit <= 500) presets = [10, 50, 100];
                            else presets = [50, 100, 200];

                            // Filter valid and slice
                            const validPresets = presets.filter(n => n < maxValInSelectedUnit).slice(0, 3);

                            return validPresets.map((val) => (
                                <button
                                    key={val}
                                    onClick={() => {
                                        const current = Number(Math.max(0, parseFloat((String(amount || 0)).replace(',', '.'))));
                                        setAmount((current + val).toString());
                                    }}
                                    className="py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-[11px] font-bold text-zinc-400 uppercase hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all active:scale-95"
                                >
                                    +{val} {selectedUnit}
                                </button>
                            ));
                        })()}
                        <button
                            onClick={() => {
                                // "All" means Total Stock -> Converted to Selected Unit
                                const allInSelected = (isFractional ? effectiveStock : currentStock) / conversionFactor;
                                setAmount(fmt(allInSelected).toString());
                            }}
                            className="py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-[11px] font-bold text-rose-500 uppercase hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                        >
                            Tudo
                        </button>
                    </div>

                    {isFractional && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sky-500/5 border border-sky-500/10">
                            <div className="w-1 h-8 bg-sky-500/50 rounded-full" />
                            <div className="text-[10px] text-zinc-400 leading-tight">
                                <strong className="text-sky-400 block uppercase mb-0.5">Item Fracionável</strong>
                                1 {item.unit} do estoque equivale a <strong className="text-zinc-300">{stockYield} {usageUnit}</strong>.
                                O sistema debitará proporcionalmente.
                            </div>
                        </div>
                    )}
                </div>


            </div>
        </Modal>
    );
}
