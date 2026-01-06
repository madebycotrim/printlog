import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    User, Zap, Monitor, Settings2, Save, Check,
    RefreshCw, RotateCcw, Loader2, Cpu, AlertCircle,
    MessageCircle, X, Layout
} from "lucide-react";
import { useSettingsStore } from "../logic/calculator";

/* ---------- TOOLTIP VIA PORTAL ---------- */
const TooltipPortal = ({ texto, referenciaAlvo, visivel }) => {
    const [coordenadas, setCoordenadas] = useState({ top: 0, left: 0 });

    useLayoutEffect(() => {
        if (visivel && referenciaAlvo.current) {
            const retangulo = referenciaAlvo.current.getBoundingClientRect();
            setCoordenadas({
                top: retangulo.top - 10,
                left: retangulo.left + (retangulo.width / 2) - 100
            });
        }
    }, [visivel, referenciaAlvo]);

    if (!visivel) return null;

    return createPortal(
        <div className="fixed w-[220px] p-3 bg-zinc-900 text-zinc-300 text-[10px] leading-relaxed rounded-xl border border-zinc-800 z-[9999] shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-200"
            style={{ top: coordenadas.top, left: coordenadas.left, transform: 'translateY(-100%)' }}>
            {texto}
        </div>,
        document.body
    );
};

/* ---------- MODAL ---------- */
const ModalEstiloResumo = ({ isOpen, onClose, title, children, actions }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl w-full max-w-[360px] overflow-hidden shadow-2xl flex flex-col max-h-[90%] animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-white/[0.03] flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{title}</span>
                    <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">{children}</div>
                {actions && <div className="px-6 py-5 bg-white/[0.01] border-t border-white/[0.03] shrink-0">{actions}</div>}
            </div>
        </div>
    );
};

/* ---------- INPUT DE CONFIGURAÇÃO ---------- */
const EntradaConfiguracao = ({ rotulo, sufixo, valor, aoAlterar, icone: Icone, textoAjuda, cor = "text-zinc-600" }) => {
    const [estaSendoFocado, setEstaSendoFocado] = useState(false);
    const referenciaIcone = useRef(null);

    return (
        <div className="group flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/80 transition-all duration-200">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-center ${cor} shadow-inner group-hover:scale-105 transition-transform`}>
                    <Icone size={14} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col cursor-help" onMouseEnter={() => setEstaSendoFocado(true)} onMouseLeave={() => setEstaSendoFocado(false)} ref={referenciaIcone}>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{rotulo}</span>
                    <TooltipPortal texto={textoAjuda} referenciaAlvo={referenciaIcone} visivel={estaSendoFocado} />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    className="w-20 bg-transparent text-right text-xs font-mono font-bold text-zinc-200 outline-none placeholder:text-zinc-700"
                    value={valor}
                    onChange={(e) => aoAlterar(e.target.value)}
                    placeholder="0.00"
                />
                <span className="text-[9px] font-bold text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800/60 uppercase tracking-tighter shrink-0">{sufixo}</span>
            </div>
        </div>
    );
};

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function PainelConfiguracoesCalculo({
    valorHoraHumana, setValorHoraHumana,
    custoKwh, setCustoKwh,
    consumoImpressoraKw, setConsumoImpressoraKw,
    custoHoraMaquina, setCustoHoraMaquina,
    taxaSetup, setTaxaSetup,
    onSaved
}) {
    const { settings, saveSettings, fetchSettings, isLoading: estaGravando } = useSettingsStore();
    const [estaSincronizando, setEstaSincronizando] = useState(false);
    const [configuracaoSincronizada, setConfiguracaoSincronizada] = useState(true);
    const [whatsappModal, setWhatsappModal] = useState(false);
    const [tempTemplate, setTempTemplate] = useState("");

    // ESTADO DE TRAVA: Impede que o banco sobrescreva sua digitação
    const [carregamentoInicialConcluido, setCarregamentoInicialConcluido] = useState(false);

    // 1. Busca dados do banco assim que o componente monta
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // 2. Sincroniza os dados do banco para os inputs locais APENAS UMA VEZ
    useEffect(() => {
        if (settings && Object.keys(settings).length > 0 && !carregamentoInicialConcluido) {
            if (settings.valorHoraHumana) setValorHoraHumana(String(settings.valorHoraHumana));
            if (settings.custoKwh) setCustoKwh(String(settings.custoKwh));
            if (settings.consumoKw) setConsumoImpressoraKw(String(settings.consumoKw));
            if (settings.custoHoraMaquina) setCustoHoraMaquina(String(settings.custoHoraMaquina));
            if (settings.taxaSetup) setTaxaSetup(String(settings.taxaSetup));
            
            const template = settings.whatsappTemplate || settings.whatsapp_template;
            if (template) setTempTemplate(template);

            setCarregamentoInicialConcluido(true);
            setConfiguracaoSincronizada(true);
        }
    }, [settings, carregamentoInicialConcluido, setValorHoraHumana, setCustoKwh, setConsumoImpressoraKw, setCustoHoraMaquina, setTaxaSetup]);

    const lidarSincronizacaoManual = async () => {
        setEstaSincronizando(true);
        setCarregamentoInicialConcluido(false); // Destrava para aceitar novos dados do banco
        await fetchSettings();
        setEstaSincronizando(false);
        setConfiguracaoSincronizada(true);
    };

    const lidarMudancaInput = (setter) => (valor) => {
        setter(valor);
        setConfiguracaoSincronizada(false); // Marca como "Não salvo"
    };

    const lidarSalvarConfiguracoes = async () => {
        const dadosParaSalvar = {
            ...settings, // Mantém margem de lucro, impostos, etc.
            valorHoraHumana,
            custoKwh,
            consumoKw: consumoImpressoraKw,
            custoHoraMaquina,
            taxaSetup,
            whatsappTemplate: tempTemplate
        };

        const sucesso = await saveSettings(dadosParaSalvar);
        if (sucesso) {
            setConfiguracaoSincronizada(true);
            if (onSaved) onSaved();
        }
    };

    return (
        <div className="relative h-full flex flex-col">
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
                
                {/* CABEÇALHO DE AÇÕES */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">Backup na Nuvem</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-zinc-600 uppercase">
                                {configuracaoSincronizada ? 'Sincronizado' : 'Alteração Pendente'}
                            </span>
                            {!configuracaoSincronizada && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={lidarSincronizacaoManual} 
                            title="Baixar da Nuvem"
                            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-sky-400 transition-all"
                        >
                            <RefreshCw size={14} className={estaSincronizando ? "animate-spin text-sky-400" : ""} />
                        </button>

                        <button
                            onClick={lidarSalvarConfiguracoes}
                            disabled={configuracaoSincronizada || estaGravando}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                configuracaoSincronizada 
                                ? "bg-zinc-900 text-zinc-600" 
                                : "bg-sky-600 text-white hover:bg-sky-500 shadow-lg active:scale-95"
                            }`}
                        >
                            {estaGravando ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            {estaGravando ? "..." : (configuracaoSincronizada ? "Salvo" : "Salvar")}
                        </button>
                    </div>
                </div>

                {/* ENERGIA */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Consumo de Energia</h4>
                        <div className="h-px flex-1 bg-zinc-900" />
                    </div>
                    <div className="space-y-2">
                        <EntradaConfiguracao 
                            rotulo="Potência da Máquina" sufixo="Watts" icone={Monitor} cor="text-indigo-400" 
                            valor={consumoImpressoraKw ? (Number(consumoImpressoraKw) < 2 ? Math.round(Number(consumoImpressoraKw) * 1000) : consumoImpressoraKw) : ""} 
                            aoAlterar={lidarMudancaInput((v) => setConsumoImpressoraKw(v === "" ? "" : (Number(v) >= 2 ? String(Number(v) / 1000) : v)))} 
                            textoAjuda="Consumo médio (Watts). Acima de 2W o sistema converte para kW automaticamente." 
                        />
                        <EntradaConfiguracao 
                            rotulo="Preço do kWh" sufixo="R$/kWh" icone={Zap} cor="text-amber-400" 
                            valor={custoKwh} 
                            aoAlterar={lidarMudancaInput(setCustoKwh)} 
                            textoAjuda="Tarifa de energia da sua região." 
                        />
                    </div>
                </div>

                {/* CUSTOS MÁQUINA */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Custos da Máquina</h4>
                        <div className="h-px flex-1 bg-zinc-900" />
                    </div>
                    <div className="space-y-2">
                        <EntradaConfiguracao 
                            rotulo="Depreciação/Hora" sufixo="R$/h" icone={Cpu} cor="text-blue-400" 
                            valor={custoHoraMaquina} 
                            aoAlterar={lidarMudancaInput(setCustoHoraMaquina)} 
                            textoAjuda="Desgaste e manutenção por hora de uso." 
                        />
                        <EntradaConfiguracao 
                            rotulo="Taxa de Setup" sufixo="R$" icone={Settings2} cor="text-zinc-400" 
                            valor={taxaSetup} 
                            aoAlterar={lidarMudancaInput(setTaxaSetup)} 
                            textoAjuda="Custo inicial fixo de preparação do projeto." 
                        />
                    </div>
                </div>

                {/* MÃO DE OBRA */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Trabalho Manual</h4>
                        <div className="h-px flex-1 bg-zinc-900" />
                    </div>
                    <EntradaConfiguracao 
                        rotulo="Valor da sua Hora" sufixo="R$/h" icone={User} cor="text-emerald-400" 
                        valor={valorHoraHumana} 
                        aoAlterar={lidarMudancaInput(setValorHoraHumana)} 
                        textoAjuda="Quanto você recebe por hora de trabalho manual." 
                    />
                </div>

                {/* WHATSAPP */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Comunicação</h4>
                        <div className="h-px flex-1 bg-zinc-900" />
                    </div>
                    <button
                        onClick={() => setWhatsappModal(true)}
                        className="w-full group flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-center text-emerald-500">
                                <MessageCircle size={14} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Template de WhatsApp</span>
                                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Editar mensagem padrão</span>
                            </div>
                        </div>
                        <Settings2 size={14} className="text-zinc-700" />
                    </button>
                </div>
            </div>

            {/* MODAL WHATSAPP */}
            <ModalEstiloResumo
                isOpen={whatsappModal}
                onClose={() => setWhatsappModal(false)}
                title="Mensagem de Envio"
                actions={
                    <button
                        onClick={() => { setWhatsappModal(false); lidarSalvarConfiguracoes(); }}
                        className="w-full h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all active:scale-95"
                    >
                        <Check size={14} /> Confirmar Layout
                    </button>
                }
            >
                <div className="space-y-4">
                    <textarea
                        className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-[11px] text-zinc-300 outline-none focus:border-emerald-500/40 transition-all resize-none"
                        value={tempTemplate}
                        onChange={(e) => lidarMudancaInput(setTempTemplate)(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-1">
                        {['{projeto}', '{valor}', '{tempo}'].map(tag => (
                            <button key={tag} onClick={() => lidarMudancaInput(setTempTemplate)(tempTemplate + tag)} className="text-[8px] bg-zinc-900 text-zinc-500 px-2 py-1 rounded border border-white/5 hover:text-sky-400">{tag}</button>
                        ))}
                    </div>
                </div>
            </ModalEstiloResumo>

            {/* AVISO FINAL */}
            <div className="mt-auto p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3 mb-4">
                <AlertCircle className="text-amber-500 shrink-0" size={16} />
                <p className="text-[9px] text-amber-500/80 leading-relaxed uppercase font-black tracking-tight">
                    As configurações acima serão aplicadas automaticamente em todos os seus novos cálculos.
                </p>
            </div>
        </div>
    );
}