import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
    X, ScanLine, AlertCircle, Package, ArrowRight, Edit, Loader2,
    CheckCircle2, Minus, Plus, Box, ArrowDownToLine, TrendingDown, Eye
} from 'lucide-react';

import { parseNumber } from '../../../utils/numbers';
import { useSupplyStore } from '../../insumos/logic/supplies';

export default function ModalScanner({ isOpen, onClose, onScan, onViewDetails, onConsume, supplies = [], items = [] }) {
    // Determine the list to use (support 'supplies' or 'items' prop)
    const { supplies: storeSupplies, consumeSupply } = useSupplyStore();

    // If specific list passed, use it. If not, use store for global scan.
    const effectiveList = (supplies.length > 0) ? supplies : (items.length > 0 ? items : storeSupplies);

    // Estado Local
    const [msgErro, setMsgErro] = useState('');
    const [scannedItem, setScannedItem] = useState(null);
    const [viewState, setViewState] = useState('scanning'); // 'scanning', 'result', 'success'
    const [isProcessing, setIsProcessing] = useState(false);

    // Result View State
    const [quantity, setQuantity] = useState("");

    // Refs
    const html5QrCodeRef = useRef(null);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setViewState('scanning');
            setScannedItem(null);
            setMsgErro('');
            setQuantity("");
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch (err) {
                console.error("Stop failed", err);
            }
        }
    };

    const startScanner = async () => {
        try {
            await stopScanner();

            const devices = await Html5Qrcode.getCameras().catch(() => []);
            if (!devices || devices.length === 0) {
                console.log("No cameras, manual mode only.");
                return;
            }

            const html5QrCode = new Html5Qrcode("unified-reader");
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                (decodedText) => handleCodeFound(decodedText),
                () => { }
            );
        } catch (err) {
            console.warn("Camera start failed", err);
        }
    };

    const handleCodeFound = (code) => {
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.pause();
        }

        const item = effectiveList.find(s => String(s.id) === String(code) || s.name === code);

        if (item) {
            setScannedItem(item);
            setQuantity("1");
            setViewState('result');
            stopScanner();
        } else {
            setMsgErro('Item não encontrado');
            setTimeout(() => {
                setMsgErro('');
                if (html5QrCodeRef.current) html5QrCodeRef.current.resume();
            }, 2000);
        }
    };

    const handleManualSubmit = (e) => {
        if (e.key === 'Enter') {
            const val = e.currentTarget.value;
            if (val) {
                handleCodeFound(val);
                e.currentTarget.value = '';
            }
        }
    };

    const handleConsume = async () => {
        if (!scannedItem) return;

        setIsProcessing(true);
        try {
            const qtd = parseNumber(quantity) || 0;

            if (onConsume) {
                await onConsume(scannedItem, qtd);
            } else if (scannedItem.type === 'supply' || scannedItem.category || storeSupplies.some(s => s.id === scannedItem.id)) {
                // Fallback to internal store logic for supplies
                await consumeSupply(scannedItem.id, qtd);
                // Toast handled by store
            }

            setViewState('success');
            setTimeout(() => {
                handleReset();
            }, 1500);
        } catch (error) {
            console.error(error);
            setMsgErro('Erro ao processar ação');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEdit = () => {
        if (onScan && scannedItem) {
            onScan(scannedItem.id);
        }
    };

    const handleView = () => {
        if (onViewDetails && scannedItem) {
            onViewDetails(scannedItem);
        }
    };

    const handleReset = () => {
        setViewState('scanning');
        setScannedItem(null);
        setQuantity("");
        startScanner();
    };

    const adjustQuantity = (delta) => {
        const current = parseNumber(quantity) || 0;
        setQuantity(Math.max(1, current + delta).toString());
    };

    // --- RENDERERS ---

    if (!isOpen) return null;

    // Check if item is a Supply (has unit/stock)
    const isSupply = scannedItem && (scannedItem.type === 'supply' || scannedItem.estoque_atual !== undefined || storeSupplies.some(s => s.id === scannedItem.id));

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">

            {/* CLOSE BTN */}
            <div className="absolute top-6 right-6 z-50">
                <button onClick={onClose} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all shadow-lg active:scale-95">
                    <X size={20} />
                </button>
            </div>

            {/* ERROR TOAST */}
            {msgErro && (
                <div className="absolute top-10 transform -translate-x-1/2 left-1/2 z-50 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg shadow-xl backdrop-blur-md">
                    <AlertCircle size={18} className="text-red-500" />
                    <span className="text-sm font-bold block">{msgErro}</span>
                </div>
            )}

            {/* --- VIEW: SCANNING --- */}
            {viewState === 'scanning' && (
                <div className="flex flex-col items-center w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
                    <div className="text-center space-y-2 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-zinc-800 shadow-lg ring-1 ring-white/5">
                            <ScanLine size={32} className="text-zinc-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Escanear Item</h2>
                        <p className="text-sm text-zinc-500 font-medium">Aponte a câmera ou use leitor USB</p>
                    </div>

                    <div className="relative w-full aspect-square max-w-[280px] bg-black rounded-3xl overflow-hidden border-4 border-zinc-900 shadow-2xl mb-8 ring-1 ring-white/10">
                        <div id="unified-reader" className="w-full h-full object-cover"></div>
                        <div className="absolute inset-0 border-[40px] border-black/60 pointer-events-none z-10" />
                        {/* Custom Finder Pattern */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/30 rounded-2xl z-20">
                            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white -translate-x-0.5 -translate-y-0.5" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-white translate-x-0.5 -translate-y-0.5" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-white -translate-x-0.5 translate-y-0.5" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white translate-x-0.5 translate-y-0.5" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20 animate-scan" />
                    </div>

                    <div className="w-full relative px-0 max-w-[280px]">
                        <input
                            type="text"
                            placeholder="DIGITAR CÓDIGO..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-center font-mono text-sm uppercase focus:outline-none focus:border-zinc-700 transition-all placeholder:text-zinc-700 shadow-lg"
                            autoFocus
                            onKeyDown={handleManualSubmit}
                        />
                    </div>
                </div>
            )}

            {/* --- VIEW: RESULT (Compact Card) --- */}
            {viewState === 'result' && scannedItem && (
                <div className="w-full max-w-sm bg-[#09090b] border border-zinc-800 rounded-[2rem] p-6 shadow-2xl ring-1 ring-white/5 animate-in zoom-in-95 duration-300 flex flex-col gap-6 relative">

                    {/* TOP GLOW LINE */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)] to-transparent z-20 animate-pulse" />

                    {/* Header: Item Info */}
                    <div className="flex gap-4 items-start">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center shrink-0 shadow-inner">
                            <Package size={24} className="text-zinc-400 mb-0.5" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">
                                    {scannedItem.marca || scannedItem.brand || 'Sem Marca'}
                                </span>
                                {scannedItem.material && (
                                    <>
                                        <span className="text-[10px] text-zinc-700">•</span>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                                            {scannedItem.material}
                                        </span>
                                    </>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
                                {scannedItem.nome || scannedItem.name}
                            </h3>

                            <div className="flex items-center gap-3 mt-2">
                                {scannedItem.tipo && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${scannedItem.tipo === 'SLA' || scannedItem.tipo === 'RESINA'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                        }`}>
                                        <Box size={10} /> {scannedItem.tipo}
                                    </span>
                                )}
                                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1">
                                    {scannedItem.localizacao || scannedItem.location || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Show Current Stock for Supplies */}
                    {isSupply && (
                        <div className="bg-zinc-900/50 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Estoque Atual</span>
                            <span className="text-lg font-bold text-emerald-400 font-mono tracking-tight">
                                {scannedItem.estoque_atual || 0} {scannedItem.unit || 'un'}
                            </span>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

                    {/* Quantity Control & Consume Action (Only if onConsume provided or it's a Supply) */}
                    {(onConsume || isSupply) && (
                        <>
                            <div className="flex flex-col items-center gap-4 py-2">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Quantidade a Baixar</span>

                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => adjustQuantity(-1)}
                                        className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all"
                                    >
                                        <Minus size={20} />
                                    </button>

                                    <div className="flex flex-col items-center w-24">
                                        <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                            {quantity || 0}
                                        </span>
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase mt-1">
                                            {scannedItem.unit}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => adjustQuantity(1)}
                                        className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {/* Presets */}
                                <div className="flex gap-2">
                                    {[1, 5, 10, 20].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setQuantity(val.toString())}
                                            className="px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-white hover:border-zinc-600 transition-all uppercase"
                                        >
                                            +{val}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main Action */}
                            <button
                                onClick={handleConsume}
                                disabled={isProcessing}
                                className="w-full h-14 bg-white hover:bg-zinc-200 text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-white/5 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <TrendingDown size={18} />}
                                Confirmar Baixa
                            </button>
                        </>
                    )}

                    {/* Footer Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={handleEdit}
                            className="h-10 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400 uppercase hover:text-white hover:bg-zinc-800 transition-all"
                        >
                            <Edit size={14} /> Editar
                        </button>
                        <button
                            onClick={handleView}
                            className="h-10 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400 uppercase hover:text-white hover:bg-zinc-800 transition-all"
                        >
                            <Eye size={14} /> Visualizar
                        </button>
                    </div>

                </div>
            )}

            {/* --- VIEW: SUCCESS --- */}
            {viewState === 'success' && (
                <div className="w-full max-w-sm bg-[#09090b] border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center mx-4 ring-1 ring-white/5 animate-in zoom-in-90 duration-300">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-6 animate-in zoom-in spin-in-12 duration-500">
                        <CheckCircle2 size={40} strokeWidth={2} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Sucesso</h2>
                    <p className="text-zinc-500 text-sm font-medium mb-6 max-w-[200px]">
                        Estoque de <span className="text-zinc-300">{scannedItem?.name}</span> atualizado.
                    </p>
                    <div className="px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800 mb-2">
                        <span className="text-emerald-500 font-black text-sm font-mono tracking-wider">
                            -{parseNumber(quantity)} {scannedItem?.unit || 'un'}
                        </span>
                    </div>
                </div>
            )}

        </div>
    );
}
