import React from "react";
import { Printer, History, Settings2, ChevronDown, Trash2, FileCode } from "lucide-react";

export default function Header({
    nomeProjeto,
    setNomeProjeto,
    printers = [],
    idImpressoraSelecionada,
    onCyclePrinter,
    onOpenHistory,
    onOpenSettings,
    onOpenWaste,
    onUploadGCode, // Nova prop para upload de arquivo
    needsConfig = false,
    hud
}) {
    // Busca a impressora selecionada na lista de equipamentos com comparação segura de tipo
    const impressoraAtual = printers.find(p => String(p.id) === String(idImpressoraSelecionada));

    // Define o nome que aparece no botão
    const nomeExibicaoHardware = impressoraAtual?.nome || impressoraAtual?.name || (printers.length > 0 ? "Selecionar Impressora" : "Offline");

    // Organiza o valor da potência
    const potenciaHardware = Number(impressoraAtual?.potencia || impressoraAtual?.power || 0);

    /**
     * Lógica para renderizar o texto:
     * Tudo em BRANCO, exceto a ÚLTIMA palavra que ganha o GRADIENTE CYAN-SKY.
     */
    const renderTextoColorido = () => {
        if (!nomeProjeto) return <span className="text-zinc-800">NOME DO PROJETO...</span>;

        const palavras = nomeProjeto.split(" ");

        if (palavras.length === 1) {
            return (
                <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                    {palavras[0]}
                </span>
            );
        }

        const ultimaPalavra = palavras[palavras.length - 1];
        const restoDoTexto = palavras.slice(0, -1).join(" ");

        return (
            <>
                <span className="text-white">{restoDoTexto + " "}</span>
                <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                    {ultimaPalavra}
                </span>
            </>
        );
    };

    return (
        <header className="px-8 xl:px-12 py-8 flex items-start justify-between z-40 relative shrink-0 gap-6">

            {/* LADO ESQUERDO: TITULO E INPUT DE PROJETO */}
            <div className="flex flex-col min-w-[200px] max-w-xl group relative">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    Cálculo de Produção
                </span>

                {/* CONTAINER DO INPUT */}
                <div className="relative inline-flex items-center">
                    {/* Camada Visual: Texto Renderizado */}
                    <div className="pointer-events-none whitespace-pre text-4xl font-black tracking-tight text-zinc-200 z-10 transition-colors group-hover:text-white">
                        {renderTextoColorido()}
                    </div>

                    {/* Input Real */}
                    <input
                        value={nomeProjeto}
                        onChange={(e) => setNomeProjeto(e.target.value)}
                        placeholder="NOME DO PROJETO..."
                        className="absolute inset-0 bg-transparent border-none outline-none text-4xl font-black tracking-tight text-transparent caret-sky-500 selection:bg-sky-500/30 w-full z-20 placeholder:text-transparent"
                    />
                </div>
            </div>

            {/* CENTRO: HUD (Painel Flutuante) */}
            <div className="flex-1 flex justify-center px-4 pt-2">
                {hud}
            </div>

            {/* LADO DIREITO: TOOLBAR */}
            <div className="flex items-center gap-4 shrink-0 pt-1">

                {/* Selector de Impressora */}
                <button
                    type="button"
                    onClick={onCyclePrinter}
                    className="group flex items-center gap-3 px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900 rounded-2xl transition-all duration-300 hover-lift"
                >
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Printer size={18} className={`${impressoraAtual ? 'text-sky-400' : 'text-zinc-600'} transition-colors`} />
                    </div>

                    <div className="flex flex-col items-start text-left">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
                            Máquina
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-200 uppercase tracking-tight truncate max-w-[140px]">
                                {nomeExibicaoHardware}
                            </span>
                            {potenciaHardware > 0 && (
                                <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                    {potenciaHardware}W
                                </span>
                            )}
                        </div>
                    </div>
                    <ChevronDown size={14} className="text-zinc-600 group-hover:text-zinc-400 ml-2" />
                </button>

                <div className="w-px h-10 bg-zinc-800/50" />

                {/* Ações Rápidas */}
                <div className="flex gap-2">
                    <button
                        onClick={onUploadGCode}
                        title="Importar G-Code / 3MF"
                        className="w-12 h-12 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all hover-lift"
                    >
                        <FileCode size={18} />
                    </button>
                    <button
                        onClick={onOpenWaste}
                        title="Registrar Falha"
                        className="w-12 h-12 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all hover-lift"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={onOpenSettings}
                        title="Configurações"
                        className={`w-12 h-12 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center transition-all hover-lift ${needsConfig ? 'text-amber-500 border-amber-500/30 animate-pulse' : 'text-zinc-500 hover:text-white hover:border-zinc-600'}`}
                    >
                        <Settings2 size={18} />
                    </button>
                    <button
                        onClick={onOpenHistory}
                        title="Histórico"
                        className="w-12 h-12 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center text-zinc-500 hover:text-sky-400 hover:border-sky-500/30 hover:bg-sky-500/10 transition-all hover-lift"
                    >
                        <History size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}