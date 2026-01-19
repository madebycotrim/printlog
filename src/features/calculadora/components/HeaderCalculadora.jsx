import React, { useMemo, useState } from "react";
import { Printer, History, Settings2, ChevronDown, Trash2, FileCode, UserCircle2, User, Check, X } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { useClientStore } from "../../clientes/logic/clients";

import ModalCliente from "../../clientes/components/ModalCliente";

export default function Header({
    nomeProjeto,
    setNomeProjeto,
    clients = [],
    selectedClientId,
    onSelectClient,
    printers = [],
    idImpressoraSelecionada,
    onCyclePrinter,
    onSelectPrinter, // Nova prop
    onOpenHistory,
    onOpenSettings,
    onOpenWaste,
    onUploadGCode, // Nova prop para upload de arquivo
    needsConfig = false,
    hud
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    // Busca a impressora selecionada na lista de equipamentos com comparação segura de tipo
    const impressoraAtual = printers.find(p => String(p.id) === String(idImpressoraSelecionada));

    // Define o nome que aparece no botão
    const nomeExibicaoHardware = impressoraAtual?.nome || impressoraAtual?.name || (printers.length > 0 ? "Selecionar Impressora" : "Offline");

    // Organiza o valor da potência
    const potenciaHardware = Number(impressoraAtual?.potencia || impressoraAtual?.power || 0);

    // Prepara opções de clientes para o UnifiedInput
    const clientOptions = useMemo(() => {
        const clientItems = clients.map(c => ({
            value: c.id,
            label: c.empresa ? `${c.nome} • ${c.empresa}` : c.nome
        }));

        return [
            {
                group: "Ações",
                items: [{ value: "new_client", label: "+ NOVO CLIENTE (RÁPIDO)", color: "#0ea5e9" }]
            },
            {
                group: "Meus Clientes",
                items: [{ value: "", label: "Cliente (Opcional)" }, ...clientItems]
            }
        ];
    }, [clients]);



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
        <header className="px-4 md:px-8 xl:px-12 pt-6 lg:pt-8 flex flex-col lg:flex-row items-start lg:items-center justify-between z-40 relative shrink-0 gap-6 lg:gap-6" data-tour="calc-header">

            {/* LADO ESQUERDO: TITULO E INPUT DE PROJETO */}
            <div className="flex flex-col w-full lg:w-auto min-w-[200px] max-w-xl group relative pl-20 lg:pl-0">
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    Cálculo de Produção
                </span>

                {/* CONTAINER DO INPUT */}
                <div className="relative inline-flex items-center w-full" data-tour="calc-project-name">
                    {/* Camada Visual: Texto Renderizado */}
                    <div className="pointer-events-none whitespace-pre text-2xl lg:text-4xl font-black tracking-tight text-zinc-200 z-10 transition-colors group-hover:text-white truncate">
                        {renderTextoColorido()}
                    </div>

                    {/* Input Real */}
                    <input
                        value={nomeProjeto}
                        onChange={(e) => setNomeProjeto(e.target.value)}
                        placeholder="NOME DO PROJETO..."
                        className="absolute inset-0 bg-transparent border-none outline-none text-2xl lg:text-4xl font-black tracking-tight text-transparent caret-sky-500 selection:bg-sky-500/30 w-full z-20 placeholder:text-zinc-800/50"
                    />
                </div>

                {/* CLIENT SELECTOR - NOVO INTEGRADO */}
                <div className="mt-4 w-full lg:w-[280px] relative z-30">
                    <UnifiedInput
                        label="Cliente"
                        placeholder="Selecione um Cliente..."
                        type="select"
                        icon={User}
                        options={clientOptions}
                        value={selectedClientId || ""}
                        onSearch={setSearchTerm}
                        onChange={(val) => {
                            if (val === 'new_client') {
                                setIsClientModalOpen(true);
                            } else {
                                onSelectClient(val);
                            }
                        }}
                    />
                    {/* Nota: UnifiedInput variant ghost remove bordas. O seletor original tinha UserCircle2 mas UnifiedInput já tem suporte a ícone. */}
                </div>
            </div>

            {/* CENTRO: REMOVIDO HUD */}
            <div className="hidden lg:flex flex-1 justify-center px-4 pt-2">
                {/* HUD removido conforme solicitado */}
            </div>

            {/* LADO DIREITO: TOOLBAR (STACKED ON MOBILE) */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 shrink-0 pt-1 w-full lg:w-auto">

                {/* Selector de Impressora (Dropdown Customizado) */}
                <div className="relative group/printer w-full lg:w-64">
                    <button
                        type="button"
                        onClick={() => { const nextIndex = (printers.findIndex(p => p.id === impressoraAtual?.id) + 1) % printers.length; onCyclePrinter(nextIndex); }}
                        className="w-full flex items-center gap-3 px-3 h-12 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all text-left relative overflow-hidden"
                    >
                        <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                            <Printer size={16} className={`${impressoraAtual ? 'text-sky-500' : 'text-zinc-600'}`} />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Máquina Atual</span>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-zinc-200 truncate">{nomeExibicaoHardware}</span>
                                {potenciaHardware > 0 && <span className="text-[9px] font-mono text-emerald-500">{potenciaHardware}W</span>}
                            </div>
                        </div>

                        {/* Hover Overlay com Lista (Simulação de Dropdown Nativo via CSS no Hover/Focus ou Click) */}
                        {/* Como o usuário pediu Dropdown, vamos fazer algo mais robusto que o cycle. 
                            Mas o onCyclePrinter atual só cicla. Vou usar o estado local para abrir um menu. 
                        */}
                    </button>

                    {/* Menu Dropdown - Implementado com Absolute Position e Visibility Hidden por padrão */}
                    <div className="absolute top-full mt-2 left-0 w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden invisible opacity-0 group-hover/printer:visible group-hover/printer:opacity-100 transition-all z-50 transform origin-top pointer-events-none group-hover/printer:pointer-events-auto">
                        <div className="p-1.5 flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                            <span className="px-2 py-1.5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">Disponíveis</span>
                            {printers.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => onSelectPrinter && onSelectPrinter(p)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${p.id === impressoraAtual?.id ? 'bg-sky-500/10 text-sky-400' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
                                >                                      <div className="flex flex-col text-left">
                                        <span>{p.nome}</span>
                                        <span className="text-[8px] text-zinc-600 lowercase">{p.tipo || 'FDM'}</span>
                                    </div>
                                    <span className="font-mono text-zinc-600">{p.consumo_w || 0}W</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ações Rápidas - Grid on Mobile (3 items visible) */}
                <div className="grid grid-cols-3 lg:flex gap-2 w-full lg:w-auto">
                    <button
                        onClick={onUploadGCode}
                        title="Importar G-Code / 3MF"
                        className="hidden lg:flex h-12 lg:w-12 rounded-xl bg-zinc-900/50 border border-zinc-800/50 items-center justify-center text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all hover-lift"
                    >
                        <FileCode size={18} />
                    </button>
                    <button
                        onClick={onOpenWaste}
                        title="Registrar Falha"
                        className="h-12 w-full lg:w-12 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all hover-lift"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={onOpenSettings}
                        title="Configurações"
                        className={`h-12 w-full lg:w-12 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center transition-all hover-lift ${needsConfig ? 'text-amber-500 border-amber-500/30 animate-pulse' : 'text-zinc-500 hover:text-white hover:border-zinc-800/30'}`}
                    >
                        <Settings2 size={18} />
                    </button>
                    <button
                        onClick={onOpenHistory}
                        title="Histórico"
                        className="h-12 w-full lg:w-12 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center text-zinc-500 hover:text-sky-400 hover:border-sky-500/30 hover:bg-sky-500/10 transition-all hover-lift"
                    >
                        <History size={18} />
                    </button>
                </div>
            </div>

            <ModalCliente
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                reduced={true}
                initialData={{ nome: searchTerm }}
                onSuccess={(newId) => {
                    setIsClientModalOpen(false);
                    onSelectClient(newId);
                }}
            />
        </header>
    );
}
