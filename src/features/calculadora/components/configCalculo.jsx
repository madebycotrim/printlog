// src/features/calculadora/components/PainelConfiguracoesCalculo.jsx
import React, { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
    User, Zap, Monitor, Settings2, Save, Check,
    RefreshCw, RotateCcw, Loader2, Cpu, AlertCircle
} from "lucide-react";
import { useSettingsStore } from "../logic/calculator";

// TOOLTIP VIA PORTAL (Mantém o foco e evita quebra de layout)
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

// INPUT DE CONFIGURAÇÃO REUTILIZÁVEL
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
                <span className="text-[9px] font-bold text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800/60 uppercase tracking-tighter shrink-0">
                    {sufixo}
                </span>
            </div>
        </div>
    );
};

export default function PainelConfiguracoesCalculo({
    config, // Objeto de configuração vindo do estado pai
    valorHoraHumana, setValorHoraHumana,
    custoKwh, setCustoKwh,
    consumoImpressoraKw, setConsumoImpressoraKw,
    custoHoraMaquina, setCustoHoraMaquina,
    taxaSetup, setTaxaSetup,
    onSaved
}) {
    const { saveSettings, fetchSettings, isLoading: estaGravando } = useSettingsStore();
    const [estaSincronizando, setEstaSincronizando] = useState(false);
    const [configuracaoSincronizada, setConfiguracaoSincronizada] = useState(true);

    // Sincronizar dados com o banco D1 (Nuvem)
    const lidarSincronizacao = async () => {
        setEstaSincronizando(true);
        const sucesso = await fetchSettings();
        if (sucesso) {
            setConfiguracaoSincronizada(true);
        }
        setEstaSincronizando(false);
    };

    // Resetar campos locais
    const lidarResetLocal = () => {
        if (window.confirm("Limpar alterações locais e voltar aos campos vazios?")) {
            setValorHoraHumana("");
            setCustoKwh("");
            setConsumoImpressoraKw("");
            setCustoHoraMaquina("");
            setTaxaSetup("");
            setConfiguracaoSincronizada(false);
        }
    };

    // Persistir no Banco de Dados via Store
    const lidarSalvarConfiguracoes = async () => {
        // Garante que o objeto enviado contenha os valores mais recentes dos estados
        const dadosParaSalvar = {
            ...config,
            valorHoraHumana,
            custoKwh,
            consumoKw: consumoImpressoraKw,
            custoHoraMaquina,
            taxaSetup
        };

        const sucesso = await saveSettings(dadosParaSalvar);
        if (sucesso) {
            setConfiguracaoSincronizada(true);
            if (onSaved) onSaved();
        } else {
            alert("Erro ao salvar na nuvem. Verifique sua conexão.");
        }
    };

    // Monitor de alterações para avisar que há dados não salvos
    const lidarMudancaInput = (setter) => (valor) => {
        setter(valor);
        setConfiguracaoSincronizada(false);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">

            {/* BARRA DE FERRAMENTAS */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 leading-none mb-1">Backup na Nuvem</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">Status: {configuracaoSincronizada ? 'Sincronizado' : 'Alterado'}</span>
                        {!configuracaoSincronizada && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={lidarResetLocal} title="Limpar Local" className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-400 transition-colors">
                        <RotateCcw size={14} />
                    </button>

                    <button onClick={lidarSincronizacao} disabled={estaSincronizando} title="Buscar da Nuvem" className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-sky-400 transition-all">
                        <RefreshCw size={14} className={estaSincronizando ? "animate-spin text-sky-400" : ""} />
                    </button>

                    <button 
                        onClick={lidarSalvarConfiguracoes} 
                        disabled={configuracaoSincronizada || estaGravando} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${configuracaoSincronizada ? "bg-zinc-900 text-zinc-600 cursor-default" : "bg-sky-600 text-white hover:bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)] active:scale-95"}`}
                    >
                        {estaGravando ? <Loader2 size={12} className="animate-spin mr-1" /> : (configuracaoSincronizada ? <Check size={12} strokeWidth={3} className="mr-1" /> : <Save size={12} className="mr-1" />)}
                        {estaGravando ? "Gravando" : (configuracaoSincronizada ? "Salvo" : "Salvar Nuvem")}
                    </button>
                </div>
            </div>

            {/* SEÇÃO 1: ELÉTRICA */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Consumo Elétrico</h4>
                    <div className="h-px flex-1 bg-zinc-900" />
                </div>
                <div className="space-y-2">
                    <EntradaConfiguracao
                        rotulo="Potência do Hardware"
                        sufixo="Watts"
                        icone={Monitor}
                        cor="text-indigo-400"
                        // Exibição: Se o valor for decimal (kW), converte para Watts para o usuário
                        valor={consumoImpressoraKw ? (Number(consumoImpressoraKw) < 2 ? Math.round(Number(consumoImpressoraKw) * 1000) : consumoImpressoraKw) : ""}
                        aoAlterar={lidarMudancaInput((v) => {
                            // Salvamento: Se o usuário digitar Watts (>2), converte para kW para o motor de cálculo
                            const valorConvertido = v === "" ? "" : (Number(v) >= 2 ? String(Number(v) / 1000) : v);
                            setConsumoImpressoraKw(valorConvertido);
                        })}
                        textoAjuda="Consumo médio da impressora em Watts (ex: 150W). O sistema converterá para kW automaticamente."
                    />
                    <EntradaConfiguracao
                        rotulo="Preço do kWh" sufixo="R$/kWh" icone={Zap} cor="text-amber-400"
                        valor={custoKwh}
                        aoAlterar={lidarMudancaInput(setCustoKwh)}
                        textoAjuda="Valor da tarifa de energia por kWh cobrado na sua fatura."
                    />
                </div>
            </div>

            {/* SEÇÃO 2: MANUTENÇÃO */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Custos de Máquina</h4>
                    <div className="h-px flex-1 bg-zinc-900" />
                </div>
                <div className="space-y-2">
                    <EntradaConfiguracao
                        rotulo="Depreciação/Hora" sufixo="R$/h" icone={Cpu} cor="text-blue-400"
                        valor={custoHoraMaquina}
                        aoAlterar={lidarMudancaInput(setCustoHoraMaquina)}
                        textoAjuda="Custo de desgaste da máquina por hora (Ex: Valor da Máquina / Vida Útil em horas)."
                    />
                    <EntradaConfiguracao
                        rotulo="Taxa de Setup" sufixo="R$" icone={Settings2} cor="text-zinc-400"
                        valor={taxaSetup}
                        aoAlterar={lidarMudancaInput(setTaxaSetup)}
                        textoAjuda="Custo fixo inicial para preparar a máquina, fatiar e iniciar a produção."
                    />
                </div>
            </div>

            {/* SEÇÃO 3: LABORATÓRIO */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Trabalho Humano</h4>
                    <div className="h-px flex-1 bg-zinc-900" />
                </div>
                <div className="space-y-2">
                    <EntradaConfiguracao
                        rotulo="Valor da sua Hora" sufixo="R$/h" icone={User} cor="text-emerald-400"
                        valor={valorHoraHumana}
                        aoAlterar={lidarMudancaInput(setValorHoraHumana)}
                        textoAjuda="Seu pró-labore. Quanto você quer receber por hora de trabalho manual direto."
                    />
                </div>
            </div>

            {/* AVISO DE CONFIGURAÇÃO */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={16} />
                <p className="text-[10px] text-amber-500/80 leading-relaxed uppercase font-bold tracking-tight">
                    As configurações de oficina são globais. Qualquer alteração aqui será aplicada imediatamente em todos os cálculos de novos projetos.
                </p>
            </div>

        </div>
    );
}