import React, { useMemo, useState } from "react";
import { Printer, History, Settings2, ChevronDown, Trash2, FileCode, UserCircle2, User, Check, X, Wand2, Cloud, CloudOff, Loader2, Store, RotateCcw } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { useClientStore } from "../../clientes/logic/clients";
import { useCalculatorStore } from "../../../stores/calculatorStore";
import { useToastStore } from "../../../stores/toastStore";

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
    onSelectPrinter,
    onOpenHistory,
    onOpenSettings,
    onOpenWaste,
    onUploadGCode, // Nova prop para upload de arquivo
    needsConfig = false,
    hud,
    isSaving = false,
    lastSaved = null,
    isAutoSaveEnabled = true,
    onToggleAutoSave,
    onReset
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const { atualizarCampo } = useCalculatorStore();
    const { addToast } = useToastStore();

    const aplicarTemplate = (template) => {
        if (!template?.config) return;

        // Aplica as configurações do template
        Object.entries(template.config).forEach(([key, value]) => {
            atualizarCampo('config', key, value);
        });

        addToast(`Template "${template.nome}" aplicado!`, 'success');
    };

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
        if (!nomeProjeto) return <span className="text-zinc-800">NOME DA PEÇA / PROJETO...</span>;

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
        <header className="px-4 md:px-8 xl:px-12 pt-6 lg:pt-8 flex flex-col lg:flex-row items-start justify-between z-40 relative shrink-0 gap-6 lg:gap-6">

            {/* LADO ESQUERDO: TITULO E INPUT DE PROJETO */}
            <div className="flex flex-col w-full lg:w-auto min-w-[200px] max-w-xl group relative pl-20 lg:pl-0">
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    Novo Orçamento
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
                        placeholder="NOME DA PEÇA / PROJETO..."
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

            {/* LADO DIREITO: TOOLBAR RENOVADA */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 shrink-0 pt-1 w-full lg:w-auto">

                {/* 1. SELETOR DE IMPRESSORA (Refinado) */}
                <div className="relative group/printer w-full lg:w-auto lg:min-w-[180px] lg:max-w-[280px]">
                    <button
                        type="button"
                        onClick={() => { const nextIndex = (printers.findIndex(p => p.id === impressoraAtual?.id) + 1) % printers.length; onCyclePrinter(nextIndex); }}
                        className="w-full flex items-center gap-3 pl-2 pr-4 h-11 bg-zinc-950/40 border border-zinc-800/60 rounded-xl hover:bg-zinc-900 transition-all text-left relative overflow-hidden group-hover/printer:border-zinc-700"
                    >
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 shadow-sm transition-colors ${impressoraAtual ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
                            <Printer size={14} className={`${impressoraAtual ? 'text-emerald-500' : 'text-zinc-600'}`} />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Máquina</span>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${impressoraAtual ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500/50'}`} />
                                <span className="text-[11px] font-bold text-zinc-200 truncate leading-none pt-px">{nomeExibicaoHardware}</span>
                            </div>
                        </div>
                        {potenciaHardware > 0 && <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{potenciaHardware}W</span>}
                    </button>

                    {/* Menu Dropdown */}
                    <div className="absolute top-full mt-2 left-0 w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden invisible opacity-0 group-hover/printer:visible group-hover/printer:opacity-100 transition-all z-50 transform origin-top pointer-events-none group-hover/printer:pointer-events-auto">
                        <div className="p-1.5 flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                            <span className="px-2 py-1.5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">Disponíveis</span>
                            {printers.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => onSelectPrinter && onSelectPrinter(p)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${p.id === impressoraAtual?.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
                                >
                                    <div className="flex flex-col text-left">
                                        <span>{p.nome}</span>
                                        <span className="text-[8px] text-zinc-600 lowercase">{p.tipo || 'FDM'}</span>
                                    </div>
                                    <span className="font-mono text-zinc-600">{p.consumo_w || 0}W</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DIVISÓRIA EXTERNA 1 Sutil */}
                <div className="h-6 w-px bg-zinc-800 self-center hidden lg:block mx-1" />

                {/* 2. BOTÃO DE AÇÃO PRINCIPAL: IMPORTAR */}
                <button
                    onClick={onUploadGCode}
                    className="relative overflow-hidden group h-11 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 transition-all shadow-lg shadow-sky-900/20 flex items-center justify-center gap-2 mx-1 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <FileCode size={18} className="text-white fill-white/20" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">Importar 3D</span>
                </button>

                {/* DIVISÓRIA EXTERNA 2 Sutil */}
                <div className="h-6 w-px bg-zinc-800 self-center hidden lg:block mx-1" />

                {/* 3. GRUPO DE AÇÕES SECUNDÁRIAS (Unificado e Clean) */}
                <div className="grid grid-cols-4 lg:flex bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-1 gap-1 h-11 items-center">
                    <button
                        onClick={onOpenWaste}
                        title="Registrar Falha"
                        className="h-9 w-9 lg:w-10 lg:h-full rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-all"
                    >
                        <Trash2 size={18} />
                    </button>

                    <button
                        onClick={onOpenSettings}
                        title="Configurações e Tarifas"
                        className={`h-9 w-9 lg:w-10 lg:h-full rounded-lg flex items-center justify-center transition-all ${needsConfig ? 'text-amber-500 animate-pulse bg-amber-500/10' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    >
                        <Settings2 size={18} />
                    </button>

                    <button
                        onClick={onOpenHistory}
                        title="Histórico de Projetos"
                        className="h-9 w-9 lg:w-10 lg:h-full rounded-lg flex items-center justify-center text-zinc-500 hover:text-sky-400 hover:bg-zinc-800 transition-all"
                    >
                        <History size={18} />
                    </button>

                    <button
                        onClick={onReset}
                        title="Reiniciar Calculadora"
                        className="h-9 w-9 lg:w-10 lg:h-full rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-all"
                    >
                        <RotateCcw size={18} />
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
