import React, { useState, useEffect } from 'react';
import { Loader2, ArrowDownToLine, Package, ChevronDown, TrendingDown, Box } from 'lucide-react';
import SideBySideModal from '../../../components/ui/SideBySideModal'; // Using the new layout
import { UnifiedInput } from '../../../components/UnifiedInput';
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
    // Base Unit = The unit stored in DB (e.g. UN, KG).
    // Usage Unit = The smaller unit (e.g. ML, G).
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

    // Current Stock Calculations
    const currentStock = Number(item.currentStock || 0);
    const effectiveStock = currentStock * stockYield;
    const currentDisplayVal = isFractional ? effectiveStock : currentStock;
    const conversionFactor = availableUnits.factors[selectedUnit] || 1;

    // Prediction Logic
    const parsedAmount = Number(amount.replace(',', '.')) || 0;
    const normalizedAmount = parsedAmount * conversionFactor;
    const finalDisplayVal = Math.max(0, currentDisplayVal - normalizedAmount);
    const erroSaldoNegativo = currentDisplayVal - normalizedAmount < 0;

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
            const amountInBaseUnit = val * conversionFactor;
            let deductionInStockUnits = amountInBaseUnit;
            if (isFractional) {
                deductionInStockUnits = amountInBaseUnit / stockYield;
            }

            const newStock = Math.max(0, currentStock - deductionInStockUnits);

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



    // --- FOOTER CONTENT ---
    const footerContent = ({ onClose }) => (
        <div className="flex gap-4 w-full">
            <button
                disabled={loading}
                onClick={onClose}
                className="flex-1 py-4 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-500 hover:text-zinc-200 transition-all tracking-widest disabled:opacity-20"
            >
                Cancelar
            </button>
            <button
                disabled={loading}
                onClick={handleConfirm}
                className={`flex-[2] py-4 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 tracking-widest
                                ${loading
                        ? 'bg-zinc-950/40 text-zinc-700 border border-zinc-800 cursor-not-allowed opacity-50'
                        : 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 active:scale-95'}`}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingDown size={16} />}
                {loading ? "Processando..." : "Confirmar Uso"}
            </button>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={isOpen}
            onClose={onClose}
            header={{ title: "Registrar Uso", subtitle: "Lançar consumo de material do estoque", icon: Box }}
            footer={footerContent}
            salvando={loading}
            isDirty={amount !== "" && amount !== "0"}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-8 relative">

                {/* Stats Block (Moved from Sidebar) */}
                <div className="w-full">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center relative overflow-hidden group">

                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                        <div className="flex flex-col items-start gap-1">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estoque Atual</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-zinc-200 tracking-tighter">
                                    {fmt(currentDisplayVal)}
                                </span>
                                <span className="text-xs font-bold text-zinc-600 uppercase">{selectedUnit}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2 text-zinc-700">
                            <ArrowDownToLine size={24} strokeWidth={1.5} className={amount ? "text-sky-500 animate-bounce" : ""} />
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Previsão Final</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-3xl font-black tracking-tighter ${erroSaldoNegativo ? 'text-rose-500' : 'text-sky-500'}`}>
                                    {fmt(finalDisplayVal)}
                                </span>
                                <span className={`text-xs font-bold uppercase ${erroSaldoNegativo ? 'text-rose-500/50' : 'text-sky-500/50'}`}>{selectedUnit}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <h4>[01] Quantidade a Debitar</h4>
                        <div className="h-px bg-zinc-800/50 flex-1" />
                    </div>

                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
                            <Package size={20} />
                        </div>
                        <input
                            autoFocus
                            disabled={loading}
                            type="number"
                            min="0"
                            step="0.1"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0"
                            className={`w-full bg-zinc-900/50 border rounded-2xl py-6 pl-14 pr-32 text-4xl font-bold text-zinc-100 outline-none transition-all shadow-inner font-mono ${erroSaldoNegativo || (showErrors && !amount) ? 'border-rose-500/40 focus:border-rose-500/60 ring-4 ring-rose-500/5' : 'border-zinc-800 focus:border-zinc-800/30 focus:bg-zinc-950/40'}`}
                        />

                        {/* Unit Selector inside Input */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="relative">
                                <select
                                    value={selectedUnit}
                                    onChange={(e) => setSelectedUnit(e.target.value)}
                                    className="h-10 pl-3 pr-8 bg-black/20 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 uppercase focus:border-sky-500/50 focus:text-sky-500 focus:ring-0 appearance-none cursor-pointer hover:bg-black/40 transition-colors"
                                >
                                    {availableUnits.options.map(u => (
                                        <option key={u} value={u} className="bg-zinc-900 text-zinc-300">{u}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-4 gap-2">
                        {(() => {
                            // Calculate sensible presets
                            const maxValInSelectedUnit = currentDisplayVal / conversionFactor;

                            // Heuristics derived from usual Filament/Resin usage but adapted broadly
                            let presets = [];
                            if (maxValInSelectedUnit <= 10) presets = [1, 5, 10];
                            else if (maxValInSelectedUnit <= 50) presets = [5, 15, 25];
                            else if (maxValInSelectedUnit <= 200) presets = [10, 50, 100];
                            else presets = [50, 100, 250];

                            // Always take 3, regardless if it's more than stock (user can click and it handles it)
                            const validPresets = presets.slice(0, 3);

                            return validPresets.map((val) => (
                                <button
                                    key={val}
                                    onClick={() => {
                                        const current = Number(Math.max(0, parseFloat((String(amount || 0)).replace(',', '.'))));
                                        setAmount((current + val).toString());
                                    }}
                                    className="py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-[10px] font-bold text-zinc-500 uppercase hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all active:scale-95 tracking-widest"
                                >
                                    +{val}
                                </button>
                            ));
                        })()}
                        <button
                            onClick={() => {
                                // "All" means Total Stock -> Converted to Selected Unit
                                const allInSelected = currentDisplayVal / conversionFactor;
                                setAmount(fmt(allInSelected).toString());
                            }}
                            className="py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-[11px] font-bold text-rose-500 uppercase hover:bg-rose-500 hover:text-white transition-all active:scale-95 tracking-widest"
                        >
                            Tudo
                        </button>
                    </div>
                </section>

                {/* Info Block */}
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
        </SideBySideModal>
    );
}
