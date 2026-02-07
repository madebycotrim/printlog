import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, X, Square, Circle } from "lucide-react";

export default function ModalEtiquetaInsumo({ isOpen, onClose, item }) {
    if (!isOpen || !item) return null;

    const [formato, setFormato] = useState('retangular'); // 'retangular' | 'redonda'
    const qrRef = useRef(null);

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=400,height=300');

        const cssRetangular = `
            @page { size: 100mm 150mm; margin: 0; }
            body { margin: 0; padding: 0; width: 100mm; height: 150mm; }
            .label-container {
                width: 85mm; height: 55mm;
                position: absolute; top: 2mm; left: 2mm;
                border: 2px dashed #ddd; border-radius: 2mm;
                display: grid; grid-template-columns: 35mm 1fr;
                padding: 3mm; gap: 3mm; box-sizing: border-box;
                background: white;
            }
            .qr-section { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; border-right: 2px solid #000; padding-right: 2mm; }
            .qr-code { width: 32mm; height: 32mm; }
            .info-section { display: flex; flex-direction: column; height: 100%; justify-content: space-between; overflow: hidden; }
            
            .header-row { border-bottom: 2px solid #000; padding-bottom: 1mm; margin-bottom: 2mm; display: flex; justify-content: space-between; align-items: center; }
            .brand-tag { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
            .cat-pill { font-size: 9px; font-weight: 900; background: #000; color: #fff; padding: 1px 6px; border-radius: 4px; text-transform: uppercase; }

            .main-name { font-size: 16px; font-weight: 900; line-height: 1; text-transform: uppercase; margin-bottom: 2mm; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
            
            .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; margin-top: auto; border-top: 2px solid #000; padding-top: 1mm; }
            .data-item { display: flex; flex-direction: column; }
            .data-label { font-size: 7px; font-weight: 700; text-transform: uppercase; color: #666; }
            .data-value { font-size: 10px; font-weight: 900; text-transform: uppercase; }

            .id-code { font-size: 11px; font-family: monospace; font-weight: 900; letter-spacing: -0.5px; text-align: center; margin-top: 2mm; line-height: 1; word-break: break-all; width: 100%; }
        `;

        const cssRedonda = `
            @page { size: 50mm 50mm; margin: 0; } 
            body { margin: 0; padding: 0; width: 50mm; height: 50mm; display: flex; align-items: center; justify-content: center; }
            .label-container {
                width: 50mm; height: 50mm;
                border-radius: 50%;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                gap: 2mm; text-align: center; box-sizing: border-box; padding: 4mm; position: relative; overflow: hidden;
            }
            .item-name {
                font-size: 10px; font-weight: 900; line-height: 1; text-transform: uppercase;
                max-width: 90%; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
            }
            .qr-code { width: 22mm; height: 22mm; flex-shrink: 0; }
            .bottom-stack { display: flex; flex-direction: column; align-items: center; line-height: 1.1; }
            .material-info { font-size: 9px; font-weight: 900; text-transform: uppercase; }
            .id-code { font-size: 8px; font-family: monospace; font-weight: 600; opacity: 0.8; margin-top: 1px; }
        `;

        // Safe Data Access
        const categoryLabel = (item.category || item.categoria || "GERAL").toUpperCase();
        const brandLabel = (item.brand || item.marca || "").toUpperCase();
        const nameLabel = item.name || "ITEM SEM NOME";
        const unitLabel = (item.unit || item.unidade || "UN").toUpperCase();
        const locLabel = (item.location || item.localizacao || "N/A").toUpperCase();
        const minStock = item.minStock || item.estoque_minimo || "0";

        const htmlRetangular = `
            <div class="label-container">
                <div class="qr-section">
                    <div class="qr-code">
                        ${qrRef.current ? qrRef.current.innerHTML : ''}
                    </div>
                    <span class="id-code">${item.id}</span>
                </div>
                <div class="info-section">
                    <div class="header-row">
                        <span class="brand-tag">${brandLabel || "GENÉRICO"}</span>
                        <span class="cat-pill">${categoryLabel.slice(0, 10)}</span>
                    </div>
                    
                    <div class="main-name">${nameLabel}</div>
                    
                    <div class="data-grid">
                        <div class="data-item">
                            <span class="data-label">LOCALIZAÇÃO</span>
                            <span class="data-value">${locLabel}</span>
                        </div>
                        <div class="data-item">
                            <span class="data-label">ESTOQUE MÍN</span>
                            <span class="data-value">${minStock} ${unitLabel}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const htmlRedonda = `
            <div class="label-container">
                <div class="item-name">${nameLabel}</div>
                <div class="qr-code">
                    ${qrRef.current ? qrRef.current.innerHTML : ''}
                </div>
                <div class="bottom-stack">
                    <div class="material-info">${categoryLabel}</div>
                    <div class="id-code">#${item.id.slice(0, 8)}</div>
                </div>
            </div>
        `;

        const pageContent = `
            <html>
                <head>
                    <title>Etiqueta ${nameLabel}</title>
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

                <h3 className="text-lg font-bold text-white mb-1">Etiqueta de Insumo</h3>
                <p className="text-xs text-zinc-500 mb-6 font-medium">Identifique caixas e gavetas.</p>

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
                <div className="flex justify-center mb-6 min-h-[120px] h-auto items-center">
                    {formato === 'retangular' ? (
                        /* Rectangular Preview */
                        <div className="w-full max-w-[300px] aspect-[85/55] bg-white rounded-md p-2 flex items-center gap-3 shadow-2xl relative overflow-hidden border-4 border-zinc-800 ring-1 ring-white/20 select-none">
                            <div className="shrink-0 w-[110px] flex flex-col items-center gap-2 border-r-2 border-black pr-2 h-full justify-center">
                                <div ref={qrRef} className="w-[90px] h-[90px] flex items-center justify-center">
                                    <QRCodeSVG value={item.id} size={86} />
                                </div>
                                <span className="text-[9px] font-mono font-black text-black tracking-tight w-full break-all text-center leading-none">
                                    {item.id}
                                </span>
                            </div>

                            <div className="flex flex-col flex-1 min-w-0 h-full py-1 text-black justify-between pl-1">
                                <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-tight">{item.brand || "GENÉRICO"}</span>
                                    <span className="text-[8px] font-bold bg-black text-white px-1.5 py-0.5 rounded-[2px] uppercase">
                                        {(item.category || "GERAL").slice(0, 10)}
                                    </span>
                                </div>

                                <div className="flex flex-col justify-center flex-1 my-1">
                                    <span className="text-[15px] font-black uppercase leading-[0.9] line-clamp-3 break-words">
                                        {item.name}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 border-t-2 border-black pt-1 mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-bold text-zinc-500 uppercase">LOCALIZAÇÃO</span>
                                        <span className="text-[9px] font-black uppercase">{item.location || item.localizacao || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[7px] font-bold text-zinc-500 uppercase">ESTOQUE MÍN</span>
                                        <span className="text-[9px] font-black uppercase">{item.minStock || item.estoque_minimo || "0"} {item.unit || "UN"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Round Preview */
                        <div className="w-[120px] h-[120px] bg-white rounded-full p-2 flex flex-col items-center justify-center gap-2 relative shadow-2xl border-4 border-zinc-800 ring-1 ring-white/20 select-none text-black overflow-hidden py-3">
                            <div className="absolute inset-1 rounded-full border border-dashed border-zinc-300 pointer-events-none opacity-50"></div>

                            <div className="w-full px-4 text-center">
                                <div className="text-[10px] font-black uppercase leading-tight line-clamp-2">
                                    {item.name}
                                </div>
                            </div>

                            <div ref={qrRef} className="flex-shrink-0">
                                <QRCodeSVG value={item.id} size={55} />
                            </div>

                            <div className="flex flex-col items-center w-full">
                                <div className="text-[8px] font-black uppercase text-black leading-none">
                                    {(item.category || "GERAL").toUpperCase()}
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
                        <Printer size={16} /> Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
}
