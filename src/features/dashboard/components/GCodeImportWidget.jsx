import React, { useCallback, useState } from 'react';
import { Upload, FileCode, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { parseProjectFile } from '../../../utils/projectParser';

export default function GCodeImportWidget() {
    const [, setLocation] = useLocation();
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const processFile = async (file) => {
        setLoading(true);
        setError(null);
        try {
            const result = await parseProjectFile(file);

            if (result.success) {
                const params = new URLSearchParams();
                params.append('hours', Math.floor(result.timeSeconds / 3600));
                params.append('minutes', Math.floor((result.timeSeconds % 3600) / 60));
                params.append('weight', result.weightGrams);
                params.append('auto', 'true');

                setLocation(`/calculadora?${params.toString()}`);
            } else {
                setError(result.message || "Não foi possível ler os dados do arquivo. Certifique-se que ele foi fatiado e contém metadados.");
                setTimeout(() => setError(null), 5000);
            }
        } catch (err) {
            console.error(err);
            setError("Erro ao processar arquivo.");
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.gcode') || file.name.endsWith('.gco') || file.name.endsWith('.3mf'))) {
            processFile(file);
        }
    }, [setLocation]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                relative h-full min-h-[160px] rounded-2xl border-2 border-dashed transition-all duration-300 group
                flex flex-col items-center justify-center text-center p-6 cursor-pointer
                ${isDragging ? 'border-sky-500 bg-sky-500/10 scale-[1.02]' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50'}
            `}
            onClick={() => document.getElementById('gcode-widget-input').click()}
        >
            <input
                type="file"
                id="gcode-widget-input"
                className="hidden"
                accept=".gcode,.gco,.3mf"
                onChange={handleFileChange}
            />

            {loading ? (
                <Loader2 size={32} className="text-sky-500 animate-spin mb-3" />
            ) : (
                <div className={`p-4 rounded-full bg-zinc-800/50 mb-3 group-hover:bg-sky-500/20 transition-colors ${isDragging ? 'bg-sky-500/20' : ''}`}>
                    <Upload size={24} className={`text-zinc-400 group-hover:text-sky-500 transition-colors ${isDragging ? 'text-sky-500' : ''}`} />
                </div>
            )}

            <h3 className="text-sm font-black text-zinc-300 uppercase tracking-wide mb-1">
                {loading ? 'Processando...' : 'Importar Arquivo'}
            </h3>
            <p className="text-[10px] text-zinc-500 font-medium">
                Arraste ou clique para carregar <br />
                <span className="text-sky-500/80 font-mono">.GCODE</span> ou <span className="text-emerald-500/80 font-mono">.3MF</span>
            </p>

            {/* Feedback de erro inline */}
            {error && (
                <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
                    <AlertTriangle size={32} className="text-amber-500 mb-3" />
                    <p className="text-xs text-zinc-400 text-center leading-relaxed max-w-[200px]">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}
