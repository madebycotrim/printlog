import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, ScanLine, AlertCircle } from 'lucide-react';
import { useToastStore } from '../../../stores/toastStore';

export default function ModalScanner({ isOpen, onClose, onScan, errorMessage }) {
    const [msgErro, setMsgErro] = useState('');
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Cleanup se fechar modal
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
            return;
        }

        // Delay para garantir que o DOM renderizou
        const timeout = setTimeout(() => {
            startScanner();
        }, 100);

        return () => {
            clearTimeout(timeout);
            if (html5QrCodeRef.current) {
                if (html5QrCodeRef.current.isScanning) {
                    html5QrCodeRef.current.stop().then(() => {
                        html5QrCodeRef.current.clear();
                    }).catch(console.error);
                }
            }
        };
    }, [isOpen]);

    const startScanner = async () => {
        setMsgErro('');
        try {
            // Check if browser supports media devices
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                console.log("Media Devices not supported, switching to manual mode.");
                setIsScanning(false);
                return;
            }

            const devices = await Html5Qrcode.getCameras().catch(err => {
                console.warn("Camera init failed (expected if no camera):", err);
                return [];
            });

            if (!devices || devices.length === 0) {
                // Not an error, just fallback to manual mode
                console.log("No cameras found, staying in manual mode.");
                setIsScanning(false);
                return;
            }

            const html5QrCode = new Html5Qrcode("reader");
            html5QrCodeRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            const startCamera = async (mode) => {
                await html5QrCode.start(
                    mode,
                    config,
                    (decodedText) => {
                        html5QrCode.stop().then(() => {
                            html5QrCode.clear();
                            onScan(decodedText);
                        }).catch(console.error);
                    },
                    (errorMessage) => {
                        // ignore
                    }
                );
            };

            try {
                await startCamera({ facingMode: "environment" });
            } catch (err) {
                try {
                    await startCamera({ facingMode: "user" });
                } catch (err2) {
                    console.warn("Could not start any camera, ensuring manual input is ready.");
                    setIsScanning(false);
                }
            }

            setIsScanning(true);
        } catch (err) {
            console.warn("Scanner initialization passed, falling back to manual:", err);
            setIsScanning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="absolute top-6 right-6">
                <button
                    onClick={onClose}
                    className="p-3 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="w-full max-w-md flex flex-col items-center gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar p-2">
                <div className="text-center space-y-2 shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mx-auto mb-4 border border-sky-500/20 shadow-lg shadow-sky-500/10">
                        <ScanLine size={32} className="text-sky-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Escanear Código</h2>
                    <p className="text-zinc-400">Aponte a câmera para o QR Code do item</p>
                </div>

                {/* Error Message - Prominent Position */}
                {(msgErro || errorMessage) && (
                    <div className="w-full flex items-center gap-3 text-rose-200 bg-rose-500/20 px-4 py-3 rounded-xl border border-rose-500/30 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-rose-900/20">
                        <AlertCircle size={20} className="shrink-0 text-rose-400" />
                        <span className="text-sm font-semibold">{msgErro || errorMessage}</span>
                    </div>
                )}

                {/* Scanner Container */}
                <div className="relative w-full aspect-square max-w-[320px] shrink-0 overflow-hidden rounded-3xl border border-zinc-700 bg-black shadow-2xl">
                    <div id="reader" className="w-full h-full object-cover"></div>

                    {/* Viewport Overlay */}
                    <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none z-10"></div>

                    {/* Corner Markers */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <div className="absolute top-10 left-10 w-8 h-8 border-l-4 border-t-4 border-sky-500 rounded-tl-xl" />
                        <div className="absolute top-10 right-10 w-8 h-8 border-r-4 border-t-4 border-sky-500 rounded-tr-xl" />
                        <div className="absolute bottom-10 left-10 w-8 h-8 border-l-4 border-b-4 border-sky-500 rounded-bl-xl" />
                        <div className="absolute bottom-10 right-10 w-8 h-8 border-r-4 border-b-4 border-sky-500 rounded-br-xl" />
                    </div>

                    {/* Scan Line Animation (Only if scanning) */}
                    {isScanning && (
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-sky-500/20 to-transparent z-10 animate-scan pointer-events-none" />
                    )}

                    {/* No Camera / Manual Mode Placeholder */}
                    {!isScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-sm z-20">
                            <div className="text-zinc-500 text-sm font-medium animate-pulse">
                                Aguardando Leitor USB...
                            </div>
                        </div>
                    )}
                </div>

                {/* Physical Scanner / Manual Input Support */}
                <div className="w-full relative group shrink-0">
                    <input
                        type="text"
                        placeholder="Escanear com leitor ou digitar ID..."
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-center font-mono tracking-widest uppercase mb-2"
                        autoFocus
                        onInput={() => {
                            if (errorMessage && onClose) {
                                // HACK: We can't clear parent state easily without a specific prop, 
                                // but typically we can ignore it or assume the parent clears it on scan.
                                // Ideally we would have onClearError prop.
                                // For now, let's just rely on the next scan result clearing it.
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = e.currentTarget.value;
                                if (val) {
                                    onScan(val);
                                    e.currentTarget.value = '';
                                }
                            }
                        }}
                        onBlur={(e) => {
                            // Optional: auto-refocus logic if needed
                        }}
                    />
                    <div className="text-[10px] text-zinc-500 text-center uppercase tracking-widest">
                        Pressione Enter para confirmar
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
}
