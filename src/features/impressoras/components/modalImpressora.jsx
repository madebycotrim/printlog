import React, { useState, useEffect, useMemo } from "react";
import { X, Zap, Timer, DollarSign, Tag, Binary, Terminal, Cpu, Activity } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { usePrinterStore } from "../logic/printer";

/**
 * Converte strings de entrada (com máscara ou não) em números válidos.
 */
const converterParaNumero = (valor) => {
    if (typeof valor === 'number') return valor;
    if (!valor) return 0;
    // Remove símbolos de moeda, espaços e pontos de milhar, ajustando a vírgula decimal
    const limpo = String(valor).replace(/[R$\s.]/g, '').replace(',', '.');
    const resultado = parseFloat(limpo);
    return isNaN(resultado) ? 0 : resultado;
};

export default function PrinterModal({ aberto, aoFechar, aoSalvar, dadosIniciais }) {
    const { printerModels, fetchPrinterModels } = usePrinterStore();

    // Estado do formulário padronizado
    const [formulario, setFormulario] = useState({
        id: null, 
        nome: "", 
        marca: "", 
        modelo: "", 
        potencia: "", 
        preco: "",
        status: "idle", 
        horas_totais: 0, 
        ultima_manutencao_hora: 0,
        intervalo_manutencao: 300, 
        historico: []
    });

    const [entradaManual, setEntradaManual] = useState({ marca: false, modelo: false });

    useEffect(() => {
        if (aberto) {
            fetchPrinterModels();

            if (dadosIniciais) {
                setFormulario({
                    id: dadosIniciais.id || null,
                    nome: dadosIniciais.name || dadosIniciais.nome || "",
                    marca: dadosIniciais.brand || dadosIniciais.marca || "",
                    modelo: dadosIniciais.model || dadosIniciais.modelo || "",
                    potencia: String(dadosIniciais.power ?? dadosIniciais.potencia ?? ""),
                    preco: String(dadosIniciais.price ?? dadosIniciais.preco ?? ""),
                    status: dadosIniciais.status || "idle",
                    horas_totais: dadosIniciais.totalHours ?? dadosIniciais.horas_totais ?? 0,
                    ultima_manutencao_hora: dadosIniciais.lastMaintenanceHour ?? dadosIniciais.ultima_manutencao_hora ?? 0,
                    intervalo_manutencao: dadosIniciais.maintenanceInterval ?? dadosIniciais.intervalo_manutencao ?? 300,
                    historico: dadosIniciais.history || dadosIniciais.historico || []
                });
            } else {
                setFormulario({
                    id: null, nome: "", marca: "", modelo: "", potencia: "", preco: "",
                    status: "idle", horas_totais: 0, ultima_manutencao_hora: 0,
                    intervalo_manutencao: 300, historico: []
                });
                setEntradaManual({ marca: false, modelo: false });
            }
        }
    }, [aberto, dadosIniciais, fetchPrinterModels]);

    const opcoesMarca = useMemo(() => {
        const marcasUnicas = [...new Set(printerModels.map(p => p.brand))].sort();
        return [{ group: "Marcas / Fabricantes", items: marcasUnicas.map(b => ({ value: b, label: b })) }];
    }, [printerModels]);

    const opcoesModelo = useMemo(() => {
        if (!formulario.marca) return [];
        const modelosFiltrados = printerModels.filter(p => p.brand === formulario.marca);
        return [{
            group: `Modelos ${formulario.marca}`,
            items: modelosFiltrados.map(m => ({ value: m.model, label: m.model, data: m }))
        }];
    }, [printerModels, formulario.marca]);

    const tratarMudancaModelo = (valor, item) => {
        const dadosTecnicos = item?.data;
        setFormulario(prev => ({
            ...prev,
            modelo: valor,
            potencia: dadosTecnicos?.consumoKw ? (dadosTecnicos.consumoKw * 1000).toFixed(0) : prev.potencia,
            nome: prev.nome || dadosTecnicos?.name || `${prev.marca} ${valor}`
        }));
    };

    const custoDesgaste = useMemo(() => {
        const preco = converterParaNumero(formulario.preco);
        // Evita divisão por zero ou valores absurdos (usando 5000h como vida útil base para cálculo de desgaste)
        const vidaUtilEstimada = 5000; 
        return (preco / vidaUtilEstimada).toFixed(2);
    }, [formulario.preco]);

    if (!aberto) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-zinc-950 border border-zinc-800/80 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* PREVIEW LATERAL */}
                <div className="w-full md:w-[320px] bg-zinc-900/30 border-r border-zinc-800/50 p-10 flex flex-col justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-40 select-none">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
                                backgroundSize: '40px 40px',
                                maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                            }}
                        />
                        <div
                            className="absolute inset-0 opacity-50"
                            style={{
                                backgroundImage: `linear-gradient(to right, #18181b 1px, transparent 1px), linear-gradient(to bottom, #18181b 1px, transparent 1px)`,
                                backgroundSize: '10px 10px',
                                maskImage: 'radial-gradient(circle at center, black, transparent 90%)'
                            }}
                        />
                        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-zinc-800" />
                        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-zinc-800" />
                        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-zinc-800" />
                        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-zinc-800" />
                    </div>

                    <div className="space-y-10 relative z-10">
                        <div className="flex items-center gap-3 justify-center">
                            <div className="h-px w-4 bg-zinc-800" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Perfil do Hardware</span>
                            <div className="h-px w-4 bg-zinc-800" />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full transition-opacity group-hover:opacity-100 opacity-50" />
                            <div className="relative p-12 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm">
                                <Cpu size={64} className="text-zinc-600 group-hover:text-emerald-500/50 transition-colors" strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-zinc-100 tracking-tight truncate">
                                {formulario.nome || "Nova Impressora"}
                            </h3>
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50">
                                {formulario.marca || "---"} • {formulario.modelo || "---"}
                            </span>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md relative z-10 shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={12} className="text-emerald-500/50" />
                            <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-wider">Depreciação p/ Hora</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-bold text-zinc-100 font-sans tracking-tighter">R$ {custoDesgaste}</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">/h</span>
                        </div>
                    </div>
                </div>

                {/* FORMULÁRIO */}
                <div className="flex-1 flex flex-col bg-zinc-950">
                    <header className="px-10 py-6 border-b border-zinc-800/50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                                <Binary size={16} className="text-zinc-400" />
                            </div>
                            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Cadastro da Máquina</h3>
                        </div>
                        <button onClick={aoFechar} className="p-2 rounded-full hover:bg-zinc-900 text-zinc-500 transition-all">
                            <X size={20} />
                        </button>
                    </header>

                    <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-12">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">01. Identificação Técnica</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Fabricante</label>
                                        <button onClick={() => setEntradaManual(p => ({ ...p, marca: !p.marca }))} className="text-[10px] text-zinc-600 hover:text-zinc-300">
                                            {entradaManual.marca ? "Ver Lista" : "Entrada Manual"}
                                        </button>
                                    </div>
                                    <UnifiedInput
                                        type={entradaManual.marca ? "text" : "select"}
                                        options={opcoesMarca}
                                        value={formulario.marca}
                                        onChange={val => setFormulario(f => ({ ...f, marca: entradaManual.marca ? val.target.value : val, modelo: "" }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Modelo</label>
                                        <button onClick={() => setEntradaManual(p => ({ ...p, modelo: !p.modelo }))} className="text-[10px] text-zinc-600 hover:text-zinc-300">
                                            {entradaManual.modelo ? "Ver Lista" : "Entrada Manual"}
                                        </button>
                                    </div>
                                    <UnifiedInput
                                        type={entradaManual.modelo ? "text" : "select"}
                                        options={opcoesModelo}
                                        disabled={!formulario.marca && !entradaManual.modelo}
                                        value={formulario.modelo}
                                        onChange={(val, item) => entradaManual.modelo
                                            ? setFormulario(f => ({ ...f, modelo: val.target.value }))
                                            : tratarMudancaModelo(val, item)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Apelido da Impressora</label>
                                <UnifiedInput icon={Tag} value={formulario.nome} placeholder="Ex: Ender 3 S1 - 01" onChange={e => setFormulario({ ...formulario, nome: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">02. Energia e Investimento</h4>
                                <div className="space-y-4">
                                    <UnifiedInput icon={Zap} suffix="W" label="Potência Nominal" value={formulario.potencia} onChange={e => setFormulario({ ...formulario, potencia: e.target.value })} />
                                    <UnifiedInput icon={DollarSign} suffix="BRL" label="Preço de Aquisição" value={formulario.preco} onChange={e => setFormulario({ ...formulario, preco: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">03. Manutenção</h4>
                                <div className="space-y-4">
                                    <UnifiedInput icon={Timer} suffix="Hrs" label="Tempo Total de Impressão" value={formulario.horas_totais} onChange={e => setFormulario({ ...formulario, horas_totais: e.target.value })} />
                                    <UnifiedInput icon={Activity} suffix="Hrs" label="Intervalo p/ Revisão" value={formulario.intervalo_manutencao} onChange={e => setFormulario({ ...formulario, intervalo_manutencao: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="p-8 border-t border-zinc-800/50 bg-zinc-900/10 flex gap-4">
                        <button onClick={aoFechar} className="flex-1 py-3 text-[11px] font-bold uppercase text-zinc-400 border border-zinc-800 rounded-xl hover:bg-zinc-800">Cancelar</button>
                        <button
                            onClick={() => aoSalvar({
                                ...formulario,
                                potencia: converterParaNumero(formulario.potencia),
                                preco: converterParaNumero(formulario.preco),
                                horas_totais: converterParaNumero(formulario.horas_totais),
                                intervalo_manutencao: converterParaNumero(formulario.intervalo_manutencao)
                            })}
                            className="flex-[2] py-3 bg-zinc-100 text-zinc-950 text-[11px] font-bold uppercase rounded-xl flex items-center justify-center gap-3 hover:bg-white active:scale-95 transition-all"
                        >
                            <Terminal size={16} /> Salvar Impressora
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}