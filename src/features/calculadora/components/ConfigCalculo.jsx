import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    User, Zap, Monitor, Settings2, Save, Check,
    RefreshCw, Loader2, Cpu, AlertCircle,
    MessageCircle, X
} from "lucide-react";
import api from "../../../utils/api";
import { useSettingsStore } from "../logic/calculator";
import Popup from "../../../components/Popup"; // Importando o componente universal

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
        <div className="fixed w-[220px] p-3 bg-zinc-950/40 text-zinc-300 text-[10px] leading-relaxed rounded-xl border border-zinc-800/50/50 z-[9999] shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-200"
            style={{ top: coordenadas.top, left: coordenadas.left, transform: 'translateY(-100%)' }}>
            {texto}
        </div>,
        document.body
    );
};

/* ---------- INPUT DE CONFIGURAÇÃO ---------- */
const EntradaConfiguracao = ({ rotulo, sufixo, valor, aoAlterar, icone: IconeConfig, textoAjuda, cor = "text-zinc-600" }) => {
    const [estaSendoFocado, setEstaSendoFocado] = useState(false);
    const referenciaIcone = useRef(null);

    return (
        <div className="group flex items-center justify-between p-3 rounded-2xl bg-zinc-950/40 border border-zinc-800/50 hover:border-zinc-800/50 hover:bg-zinc-950/60 transition-all duration-300">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-zinc-950/40 border border-zinc-800 flex items-center justify-center ${cor} shadow-inner group-hover:scale-110 transition-transform`}>
                    <IconeConfig size={14} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col cursor-help" onMouseEnter={() => setEstaSendoFocado(true)} onMouseLeave={() => setEstaSendoFocado(false)} ref={referenciaIcone}>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight group-hover:text-zinc-300 transition-colors">{rotulo}</span>
                    <TooltipPortal texto={textoAjuda} referenciaAlvo={referenciaIcone} visivel={estaSendoFocado} />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    className="w-20 bg-transparent text-right text-xs font-mono font-bold text-zinc-200 outline-none placeholder:text-zinc-700 focus:text-white transition-colors"
                    value={valor}
                    onChange={(e) => aoAlterar(e.target.value)}
                    placeholder="0.00"
                />
                <span className="text-[9px] font-bold text-zinc-500 bg-zinc-950/40 px-2 py-1 rounded-lg border border-zinc-800/60 uppercase tracking-tighter shrink-0">{sufixo}</span>
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
    const [carregamentoInicialConcluido, setCarregamentoInicialConcluido] = useState(false);

    // Estado de Conexão Real
    const [statusConexao, setStatusConexao] = useState({ online: false, label: 'Verificando...', color: 'text-zinc-500', dot: 'bg-zinc-500' });

    useEffect(() => {
        const verificarConexao = async () => {
            try {
                const inicio = Date.now();
                const res = await api.get('/users/health');
                const latencia = Date.now() - inicio; // Aproximado ou usar res.data.latency se disponível

                if (res.data?.status === 'online') {
                    if (latencia > 500) {
                        setStatusConexao({ online: true, label: 'Conexão Lenta', color: 'text-amber-500', dot: 'bg-amber-500' });
                    } else {
                        setStatusConexao({ online: true, label: 'Conexão Estável', color: 'text-sky-500', dot: 'bg-sky-500' });
                    }
                } else {
                    setStatusConexao({ online: false, label: 'Offline', color: 'text-rose-500', dot: 'bg-rose-500' });
                }
            } catch {
                setStatusConexao({ online: false, label: 'Desconectado', color: 'text-rose-500', dot: 'bg-rose-500' });
            }
        };

        verificarConexao();
        const intervalo = setInterval(verificarConexao, 30000); // Re-check a cada 30s
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

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
        setCarregamentoInicialConcluido(false);
        await fetchSettings();
        setEstaSincronizando(false);
        setConfiguracaoSincronizada(true);
    };

    const lidarMudancaInput = (setter) => (valor) => {
        setter(valor);
        setConfiguracaoSincronizada(false);
    };

    const lidarSalvarConfiguracoes = async () => {
        const dadosParaSalvar = {
            ...settings,
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
            setWhatsappModal(false);
        }
    };

    /* Lógica de Exibição Combinada */
    const corDot = !configuracaoSincronizada ? 'bg-amber-500 animate-pulse' : statusConexao.dot;
    // O textoStatus e corTexto não estão sendo usados explicitamente pois a lógica foi inline no JSX abaixo, 
    // mas podem ser úteis se quisermos refatorar depois.

    return (
        <div className="relative h-full flex flex-col">
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">

                {/* CABEÇALHO DE AÇÕES */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">Estado da Nuvem</span>
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${corDot}`} />
                            <span className={`text-[9px] font-bold uppercase tracking-tight ${configuracaoSincronizada ? 'text-zinc-600' : 'text-amber-500'}`}>
                                {configuracaoSincronizada ? statusConexao.label : 'Edição Local'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={lidarSincronizacaoManual}
                            className="w-8 h-8 rounded-lg bg-zinc-950/40 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-sky-400 hover:border-sky-500/30 transition-all"
                            title="Sincronizar"
                        >
                            <RefreshCw size={14} className={estaSincronizando ? "animate-spin text-sky-400" : ""} />
                        </button>

                        <button
                            onClick={lidarSalvarConfiguracoes}
                            disabled={configuracaoSincronizada || estaGravando}
                            className={`flex items-center gap-2 px-4 h-8 rounded-lg text-[10px] font-black uppercase transition-all ${configuracaoSincronizada
                                ? "bg-zinc-900/50 text-zinc-700 border border-zinc-800/50"
                                : "bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20 active:scale-95"
                                }`}
                        >
                            {estaGravando ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            {estaGravando ? "..." : (configuracaoSincronizada ? "Salvo" : "Salvar")}
                        </button>
                    </div>
                </div>

                {/* GRUPOS DE CONFIGURAÇÃO */}
                <div className="space-y-4">
                    {/* ENERGIA */}
                    <div className="bg-zinc-950/40/20 border border-zinc-800/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 pb-1">
                            <Zap size={14} className="text-amber-500" />
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Custos de Energia</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <EntradaConfiguracao
                                rotulo="Potência (W)" sufixo="W" icone={Monitor} cor="text-indigo-400"
                                valor={consumoImpressoraKw ? (Number(consumoImpressoraKw) < 2 ? Math.round(Number(consumoImpressoraKw) * 1000) : consumoImpressoraKw) : ""}
                                aoAlterar={lidarMudancaInput((v) => setConsumoImpressoraKw(v === "" ? "" : (Number(v) >= 2 ? String(Number(v) / 1000) : v)))}
                                textoAjuda="Consumo médio da impressora em Watts."
                            />
                            <EntradaConfiguracao
                                rotulo="Preço Energia" sufixo="R$/kWh" icone={Zap} cor="text-amber-400"
                                valor={custoKwh} aoAlterar={lidarMudancaInput(setCustoKwh)}
                                textoAjuda="Custo do kWh na sua fatura de luz."
                            />
                        </div>
                    </div>

                    {/* MÁQUINA */}
                    <div className="bg-zinc-950/40/20 border border-zinc-800/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 pb-1">
                            <Cpu size={14} className="text-blue-500" />
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Custos de Máquina</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <EntradaConfiguracao
                                rotulo="Manutenção" sufixo="R$/h" icone={Cpu} cor="text-blue-400"
                                valor={custoHoraMaquina} aoAlterar={lidarMudancaInput(setCustoHoraMaquina)}
                                textoAjuda="Custo de depreciação e peças por hora."
                            />
                            <EntradaConfiguracao
                                rotulo="Taxa Setup" sufixo="R$" icone={Settings2} cor="text-zinc-400"
                                valor={taxaSetup} aoAlterar={lidarMudancaInput(setTaxaSetup)}
                                textoAjuda="Custo inicial fixo de fatiamento e preparo."
                            />
                        </div>
                    </div>

                    {/* TRABALHO */}
                    <div className="bg-zinc-950/40/20 border border-zinc-800/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 pb-1">
                            <User size={14} className="text-emerald-500" />
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mão de Obra</h4>
                        </div>
                        <EntradaConfiguracao
                            rotulo="Sua Hora" sufixo="R$/h" icone={User} cor="text-emerald-400"
                            valor={valorHoraHumana} aoAlterar={lidarMudancaInput(setValorHoraHumana)}
                            textoAjuda="Quanto você quer ganhar por hora de trabalho manual."
                        />
                    </div>

                    {/* COMUNICAÇÃO */}
                    <div className="bg-zinc-950/40/20 border border-zinc-800/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 pb-1">
                            <MessageCircle size={14} className="text-sky-500" />
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Atendimento</h4>
                        </div>
                        <button
                            onClick={() => setWhatsappModal(true)}
                            className="w-full group flex items-center justify-between p-3 rounded-2xl bg-zinc-950/40 border border-zinc-800/50 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform">
                                    <MessageCircle size={14} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight group-hover:text-emerald-400 transition-colors">Template WhatsApp</span>
                                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Configurar layout da mensagem</span>
                                </div>
                            </div>
                            <Settings2 size={14} className="text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>

            {/* POPUP DE CONFIGURAÇÃO DO WHATSAPP */}
            <Popup
                isOpen={whatsappModal}
                onClose={() => setWhatsappModal(false)}
                title="Template de Mensagem"
                subtitle="Comunicação MakersLog"
                icon={MessageCircle}
                footer={
                    <button
                        onClick={lidarSalvarConfiguracoes}
                        className="w-full h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all active:scale-95 shadow-lg shadow-sky-900/20"
                    >
                        <Check size={14} strokeWidth={3} /> Salvar e Aplicar Layout
                    </button>
                }
            >
                <div className="p-6 space-y-4">
                    <textarea
                        className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-[11px] text-zinc-300 outline-none focus:border-emerald-500/40 transition-all resize-none font-mono leading-relaxed"
                        value={tempTemplate}
                        onChange={(e) => lidarMudancaInput(setTempTemplate)(e.target.value)}
                        placeholder="Escreva sua mensagem aqui..."
                    />
                    <div className="flex flex-wrap gap-2">
                        {['{projeto}', '{valor}', '{tempo}'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setTempTemplate(prev => prev + tag)}
                                className="text-[9px] font-black bg-zinc-950/40 text-zinc-500 px-3 py-1.5 rounded-lg border border-zinc-800/50 hover:text-sky-400 hover:border-sky-500/30 transition-all"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold leading-tight">
                        As tags acima serão substituídas automaticamente pelos dados do cálculo atual no momento do envio.
                    </p>
                </div>
            </Popup>
        </div>
    );
}
