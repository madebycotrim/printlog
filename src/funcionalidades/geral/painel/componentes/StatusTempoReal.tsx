import { ArrowRight, Printer } from "lucide-react";

import { useArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { StatusImpressora, StatusPedido } from "@/compartilhado/tipos/modelos";
import { useNavigate } from "react-router-dom";
import { usePedidos } from "@/funcionalidades/producao/projetos/hooks/usePedidos";
import { obterImagemImpressora } from "@/funcionalidades/producao/impressoras/utilitarios/obter-imagem-simplyprint";
import { useState } from "react";

export function StatusTempoReal() {
    const { impressoras } = useArmazemImpressoras();
    const { pedidos } = usePedidos();
    const navegar = useNavigate();
    const [errosImagens, setErrosImagens] = useState<Record<string, boolean>>({});

    const maquinasAtivas = impressoras.filter(imp => !imp.dataAposentadoria);
    const resumoMaquinas = maquinasAtivas.slice(0, 4);

    const buscarTrabalhoAtivo = (idImpressora: string) => {
        return pedidos.find(p => p.idImpressora === idImpressora && p.status === StatusPedido.EM_PRODUCAO);
    };

    const obterConfigStatus = (status: string) => {
        switch (status) {
            case StatusImpressora.LIVRE: return { cor: "emerald", label: "PRONTA" };
            case StatusImpressora.IMPRIMINDO: return { cor: "amber", label: "EM CURSO" };
            case StatusImpressora.MANUTENCAO: return { cor: "rose", label: "EM REVISÃO" };
            default: return { cor: "zinc", label: status };
        }
    };



    const classesCoresText: any = {
        emerald: "text-emerald-500",
        amber: "text-amber-500",
        rose: "text-rose-500",
        zinc: "text-zinc-500",
    };

    return (
        <div className="bg-card border border-borda-sutil rounded-[2rem] p-8 flex flex-col h-full shadow-media relative overflow-hidden group transition-all hover:bg-zinc-50 dark:hover:bg-white/[0.01]">
            {/* Grid Pattern Background - Subtil */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
                style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Live Monitor</h3>
                </div>
                <button 
                    onClick={() => navegar("/impressoras")}
                    className="flex items-center gap-1 text-[10px] font-black text-sky-500 hover:text-sky-400 transition-colors tracking-widest uppercase group"
                >
                    <span>FARM</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {resumoMaquinas.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-borda-sutil pr-1 relative z-10">
                    {resumoMaquinas.map((imp) => {
                        const trabalho = buscarTrabalhoAtivo(imp.id);
                        const config = obterConfigStatus(imp.status);
                        const urlImagem = obterImagemImpressora(imp.imagemUrl, imp.marca, imp.modeloBase);
                        const erroNaImagem = errosImagens[imp.id] || !urlImagem;

                        const obterProgressoImpressao = () => {
                            if (imp.status === StatusImpressora.LIVRE) return '100%';
                            if (imp.status === StatusImpressora.MANUTENCAO) return '0%';
                            if (trabalho) {
                                if (trabalho.tempoMinutos && trabalho.tempoMinutos > 0) {
                                    const dataInicio = trabalho.dataInicioAgendada ? new Date(trabalho.dataInicioAgendada) : new Date(trabalho.dataCriacao);
                                    const diffMs = Date.now() - dataInicio.getTime();
                                    const diffMinutos = diffMs / (1000 * 60);
                                    let progresso = Math.min(Math.round((diffMinutos / trabalho.tempoMinutos) * 100), 99);
                                    if (progresso < 0) progresso = 0;
                                    return `${progresso}%`;
                                }
                                return '45%';
                            }
                            return '0%';
                        };
                        
                        return (
                            <div 
                                key={imp.id} 
                                onClick={() => navegar("/impressoras")}
                                className="flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-zinc-50 dark:bg-white/[0.02] border border-borda-sutil hover:border-sky-500/30 transition-all hover:bg-white/[0.04] dark:hover:bg-white/[0.04] group/item cursor-pointer shadow-sm hover:shadow-md text-center"
                            >
                                <div className="w-28 h-28 flex items-center justify-center rounded-2xl z-10 overflow-hidden group-hover/item:scale-110 transition-transform duration-300 mb-2 relative">
                                    {!erroNaImagem ? (
                                        <img 
                                            src={urlImagem} 
                                            alt={imp.nome} 
                                            onError={() => setErrosImagens(prev => ({ ...prev, [imp.id]: true }))}
                                            className={`w-full h-full object-contain ${imp.status === StatusImpressora.IMPRIMINDO ? 'animate-pulse' : ''}`}
                                        />
                                    ) : (
                                        <Printer size={48} className={`${classesCoresText[config.cor]} ${imp.status === StatusImpressora.IMPRIMINDO ? 'animate-pulse' : ''}`} />
                                    )}
                                </div>

                                <div className="space-y-1 w-full min-w-0">
                                    <h5 className="text-[11px] font-black text-primary dark:text-zinc-200 uppercase tracking-wider truncate leading-tight group-hover/item:text-sky-400 transition-colors">
                                        {trabalho ? trabalho.descricao : imp.nome}
                                    </h5>
                                    
                                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                                        <span className={`font-extrabold ${classesCoresText[config.cor]}`}>
                                            {obterProgressoImpressao()}
                                        </span>
                                        <span>•</span>
                                        <span className="tabular-nums font-medium truncate">
                                            {config.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-borda-sutil rounded-3xl">
                    <Printer size={32} className="text-zinc-300 dark:text-zinc-700 mb-4" />
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Sem máquinas ativas</p>
                </div>
            )}


        </div>
    );
}


