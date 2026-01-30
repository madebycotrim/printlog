import React from 'react';
import { Upload } from "lucide-react";

export default function OverlayArrastarSoltar({ isDragging }) {
    return (
        <div className={`
            absolute inset-0 z-[200] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center 
            transition-all duration-300 pointer-events-none
            ${isDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}>
            <div className={`
                    flex flex-col items-center gap-6 p-12 
                    border-4 border-dashed border-sky-500/50 bg-sky-500/5 
                    rounded-[3rem] shadow-2xl shadow-sky-500/10 
                    transition-all duration-500
                    ${isDragging ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
            `}>
                <div className="relative">
                    <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-20 animate-pulse" />
                    <Upload size={80} className="text-sky-400 relative z-10 animate-bounce" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Solte o arquivo</h2>
                    <p className="text-sm font-bold text-sky-400 uppercase tracking-[0.2em]">Extração Automática de Dados</p>
                </div>
            </div>
        </div>
    );
}
