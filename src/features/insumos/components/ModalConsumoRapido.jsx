import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
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

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setShowErrors(false);
        }
    }, [isOpen]);

    if (!item) return null;

    // Fractional Logic
    const stockYield = Number(item.stockYield || 1);
    const usageUnit = item.usageUnit || '';
    const isFractional = stockYield > 1 && !!usageUnit;

    // Display Values
    const currentStock = Number(item.currentStock || 0);
    const effectiveStock = currentStock * stockYield;
    const displayUnit = isFractional ? usageUnit : item.unit;

    // Math for UI
    const parsedAmount = Number(amount.replace(',', '.')) || 0;
    const currentDisplayVal = isFractional ? effectiveStock : currentStock;
    const finalDisplayVal = Math.max(0, currentDisplayVal - parsedAmount);

    // Formatting helper
    const fmt = (n) => typeof n === 'number' ? n.toFixed(isFractional ? 1 : 0).replace('.0', '') : n;

    const handleConfirm = async () => {
        const val = Number(amount.replace(',', '.'));
        // Validation: If invalid, show errors and stop (mimicking ModalBaixaRapida)
        if (!val || val <= 0) {
            setShowErrors(true);
            return;
        }

        setLoading(true);
        try {
            // Calculate new stock in standard units
            let deductionInUnits = val;

            if (isFractional) {
                deductionInUnits = val / stockYield;
            }

            const newStock = Math.max(0, currentStock - deductionInUnits);

            // Call Store
            const success = await quickUpdateStock(item.id, newStock);
            if (success) {
                addToast(`Consumo de ${val} ${displayUnit} registrado!`, "success");
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
                        disabled={loading} // Now only disabled while loading, allowing click for validation
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
                                    <span className="text-xs font-bold text-zinc-600 uppercase">{displayUnit}</span>
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
                                    <span className={`text-xs font-bold uppercase ${finalDisplayVal === 0 ? 'text-rose-500/50' : 'text-sky-500/50'}`}>{displayUnit}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input & Presets */}
                <div className="space-y-4">
                    <UnifiedInput
                        label={`Quantidade a debitar (${displayUnit}) *`}
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            if (showErrors && e.target.value) setShowErrors(false); // Clear error on typing
                        }}
                        placeholder="0"
                        type="number"
                        min="0"
                        autoFocus
                        variant="default"
                        error={showErrors && (!amount || parseFloat(amount) <= 0)} // Pass error state
                    />

                    {/* Quick Add Presets */}
                    <div className="grid grid-cols-4 gap-2">
                        {(() => {
                            const maxVal = isFractional ? effectiveStock : currentStock;
                            let presets = [];

                            if (maxVal <= 10) presets = [1, 2, 3, 4, 5];
                            else if (maxVal <= 50) presets = [1, 5, 10];
                            else if (maxVal <= 100) presets = [5, 10, 25];
                            else presets = [10, 50, 100];

                            // Filter valid and slice to dynamic count but max 3 to keep layout
                            const validPresets = presets.filter(n => n < maxVal).slice(0, 3);

                            return validPresets.map((val) => (
                                <button
                                    key={val}
                                    onClick={() => {
                                        const current = Number(Math.max(0, parseFloat((String(amount || 0)).replace(',', '.'))));
                                        setAmount(prev => (current + val).toString());
                                    }}
                                    className="py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-[11px] font-bold text-zinc-400 uppercase hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all active:scale-95"
                                >
                                    +{val} {isFractional && isNaN(val) ? '' : ''}
                                </button>
                            ));
                        })()}
                        <button
                            onClick={() => setAmount(isFractional ? effectiveStock.toString() : currentStock.toString())}
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
