import React, { useRef, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, X, Square, Circle } from "lucide-react";
import { MATERIAIS_RESINA_FLAT } from "../logic/constantes";

export default function ModalEtiquetaMaterial({ isOpen, onClose, item }) {
    if (!isOpen || !item) return null;

    const [formato, setFormato] = useState('retangular'); // 'retangular' | 'redonda'
    const qrRef = useRef(null);

    // Robust Resin Detection Logic
    const isResin = useMemo(() => {
        if (!item) return false;
        const mat = (item.material || "").trim();
        const tipo = (item.tipo || "").toUpperCase();

        // Direct checks
        if (tipo === 'SLA' || tipo === 'RESINA') return true;

        // Check if material is in the known resin list
        if (MATERIAIS_RESINA_FLAT.includes(mat)) return true;

        // Loose string matching
        const lowerMat = mat.toLowerCase();
        if (lowerMat.includes('resina') || lowerMat.includes('resin')) return true;

        // Check if any resin constant is part of the material name
        return MATERIAIS_RESINA_FLAT.some(r => lowerMat.includes(r.toLowerCase()));
    }, [item]);

    const typeLabel = isResin ? "RESINA" : "FILAMENTO";

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=400,height=300');

        const cssRetangular = `
            @page { size: 50mm 30mm; margin: 0; }
            body { margin: 0; padding: 0; width: 50mm; height: 30mm; }
            .label-container {
                width: 48mm; height: 28mm;
                border: 1px solid #eee; border-radius: 1mm;
                display: grid; grid-template-columns: 19mm 1fr;
                padding: 1mm; gap: 1mm; box-sizing: border-box;
            }
            .qr-code { width: 19mm; height: 19mm; }
            .info-section { display: flex; flex-direction: column; height: 100%; justify-content: space-between; overflow: hidden; }
            .header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid black; padding-bottom: 2px; margin-bottom: 1px; }
            .brand-tag { font-size: 7px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
            .type-badge { font-size: 6px; background: black; color: white; padding: 1px 3px; border-radius: 2px; font-weight: bold; }
            .main-name { font-size: 9px; font-weight: 900; line-height: 1.1; text-transform: uppercase; margin-bottom: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
            .sub-info { font-size: 7px; font-weight: 600; color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .footer-row { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid black; padding-top: 2px; }
            .id-code { font-size: 8px; font-family: monospace; font-weight: 900; letter-spacing: -0.5px; }
            .color-hex { font-size: 6px; font-family: monospace; border: 1px solid black; padding: 0px 2px; font-weight: bold; }
        `;

        const cssRedonda = `
            @page { size: 50mm 50mm; margin: 0; } 
            body { margin: 0; padding: 0; width: 50mm; height: 50mm; display: flex; align-items: center; justify-content: center; }
            .label-container {
                width: 50mm; height: 50mm;
                border-radius: 50%;
                /* Single column flex for tight centering */
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                gap: 2mm; /* Tight gap to keep things central */
                text-align: center;
                box-sizing: border-box;
                padding: 4mm;
                position: relative;
                overflow: hidden;
            }
            
            .item-name {
                font-size: 10px; font-weight: 900; line-height: 1; text-transform: uppercase;
                max-width: 90%;
                text-align: center;
                display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
            }

            .qr-code { 
                width: 22mm; height: 22mm; 
                flex-shrink: 0;
            }
            
            .bottom-stack {
                display: flex; flex-direction: column; align-items: center;
                line-height: 1.1;
            }
            
            .material-info { font-size: 9px; font-weight: 900; text-transform: uppercase; }
            .id-code { font-size: 8px; font-family: monospace; font-weight: 600; opacity: 0.8; margin-top: 1px; }
        `;

        const htmlRetangular = `
            <div class="label-container">
                <div class="qr-section">
                    ${qrRef.current ? qrRef.current.innerHTML : ''}
                </div>
                <div class="info-section">
                    <div class="header-row">
                        <span class="brand-tag">PRINTLOG</span>
                        <span class="type-badge">${typeLabel}</span>
                    </div>
                    <div class="main-info">
                        <div class="main-name">${item.nome}</div>
                        <div class="sub-info">${item.marca} - ${(item.material || "").toUpperCase()}</div>
                    </div>
                    <div class="footer-row">
                        <span class="id-code">#${item.id.slice(0, 6)}</span>
                        <span class="color-hex">${item.cor_hex || "#000"}</span>
                    </div>
                </div>
            </div>
        `;

        const htmlRedonda = `
            <div class="label-container">
                <div class="item-name">${item.nome}</div>
                <div class="qr-code">
                    ${qrRef.current ? qrRef.current.innerHTML : ''}
                </div>
                <div class="bottom-stack">
                    <div class="material-info">${(item.material || item.tipo || "").toUpperCase()}</div>
                    <div class="id-code">#${item.id.slice(0, 6)}</div>
                </div>
            </div>
        `;

        const pageContent = `
            <html>
                <head>
                    <title>Etiqueta ${item.nome}</title>
                    <style>
                        body { font-family: Arial, sans-serif; background: white; color: black; }
                        .qr-code svg { width: 100%; height: 100%; }
                        @media print { .label-container { border: none !important; } }
                        ${formato === 'retangular' ? cssRetangular : cssRedonda}
                    </style>
                </head>
                <body>
                    ${formato === 'retangular' ? htmlRetangular : htmlRedonda}
                </body>
            </html>
        `;

        printWindow.document.write(pageContent);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <h3 className="text-lg font-bold text-white mb-1">Etiqueta Térmica</h3>
                <p className="text-xs text-zinc-500 mb-6 font-medium">Selecione o formato desejado.</p>

                {/* Format Toggle */}
                <div className="flex p-1 bg-zinc-950/50 rounded-lg border border-zinc-800/50 mb-6">
                    <button
                        onClick={() => setFormato('retangular')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${formato === 'retangular' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Square size={14} /> Retangular
                    </button>
                    <button
                        onClick={() => setFormato('redonda')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${formato === 'redonda' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Circle size={14} /> Redonda
                    </button>
                </div>

                {/* Preview Area */}
                <div className="flex justify-center mb-8 h-[120px] items-center">
                    {formato === 'retangular' ? (
                        /* Rectangular Preview */
                        <div className="w-[250px] aspect-[50/30] bg-white rounded-md p-2 flex items-center gap-3 shadow-2xl relative overflow-hidden border-4 border-zinc-800 ring-1 ring-white/20 select-none">
                            <div ref={qrRef} className="shrink-0 w-[80px] h-[80px] flex items-center justify-center border border-black/10 rounded-sm bg-white">
                                <QRCodeSVG value={item.id} size={76} />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0 h-full py-0.5 text-black justify-between">
                                <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-1">
                                    <span className="text-[9px] font-black tracking-widest uppercase">PRINTLOG</span>
                                    <span className="text-[7px] font-bold bg-black text-white px-1 rounded-[1px]">{typeLabel}</span>
                                </div>
                                <div className="flex flex-col justify-center flex-1">
                                    <span className="text-[11px] font-black uppercase leading-[0.95] line-clamp-2 break-words mb-1">{item.nome}</span>
                                    <span className="text-[8px] font-bold text-zinc-800 truncate uppercase">{item.marca} - {item.material}</span>
                                </div>
                                <div className="flex items-end justify-between border-t border-black pt-1 mt-auto">
                                    <span className="text-[10px] font-mono font-black tracking-tighter">#{item.id.slice(0, 6)}</span>
                                    <span className="text-[7px] font-mono border border-black px-1 font-bold">{item.cor_hex}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Round Preview */
                        <div className="w-[120px] h-[120px] bg-white rounded-full p-2 flex flex-col items-center justify-center gap-2 relative shadow-2xl border-4 border-zinc-800 ring-1 ring-white/20 select-none text-black overflow-hidden py-3">
                            {/* Border Simulation (Dashed for visual help only in preview) */}
                            <div className="absolute inset-1 rounded-full border border-dashed border-zinc-300 pointer-events-none opacity-50"></div>

                            {/* Content - Flex Stack */}
                            <div className="w-full px-4 text-center">
                                <div className="text-[10px] font-black uppercase leading-tight line-clamp-2">
                                    {item.nome}
                                </div>
                            </div>

                            <div ref={qrRef} className="flex-shrink-0">
                                <QRCodeSVG value={item.id} size={55} />
                            </div>

                            <div className="flex flex-col items-center w-full">
                                <div className="text-[8px] font-black uppercase text-black leading-none">
                                    {(item.material || item.tipo).toUpperCase()}
                                </div>
                                <div className="text-[8px] font-mono font-bold text-zinc-600 tracking-tight mt-0.5">#{item.id.slice(0, 6)}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-3 bg-zinc-100 hover:bg-white text-black rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-white/5 active:scale-95"
                    >
                        <Printer size={16} /> Imprimir {formato === 'retangular' ? '(50x30mm)' : '(Redonda 50mm)'}
                    </button>
                </div>
            </div>
        </div>
    );
}
