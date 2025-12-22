import React, { useState } from 'react';
import {
    Settings, User, Bell, ShieldCheck,
    Trash2, Save, Mail, Info,
    Monitor, Camera, Lock, Smartphone,
    LogOut, Cpu, Cloud, Activity,
    Eye, Gauge, Zap
} from 'lucide-react';

import MainSidebar from "../components/MainSidebar";

// --- COMPONENTES VISUAIS (PADRÃO MAKER OS) ---

const TechStatCard = ({ title, value, icon: Icon, colorClass, secondaryLabel, secondaryValue }) => (
    <div className="group relative h-[160px] p-6 rounded-2xl bg-[#09090b] border border-zinc-800/50 overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-700/60 shadow-2xl">
        <div className="relative z-10 flex justify-between items-start">
            <div className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner ${colorClass}`}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <div className="text-right">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-1.5">{title}</p>
                <h3 className="text-2xl font-black text-zinc-100 font-mono tracking-tighter leading-none">{value}</h3>
            </div>
        </div>
        <div className="relative z-10 pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none mb-1">{secondaryLabel}</span>
                <span className="text-[11px] font-bold text-zinc-400 font-mono leading-none">{secondaryValue}</span>
            </div>
            <div className="h-1 w-8 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full bg-current ${colorClass} opacity-30 animate-pulse`} style={{ width: '100%' }}></div>
            </div>
        </div>
    </div>
);

const SettingSection = ({ title, description, icon: Icon, children, badge }) => (
    <section className="space-y-6">
        <div className="flex items-center gap-3 py-2">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sky-500 shadow-inner">
                <Icon size={16} />
            </div>
            <div className="flex flex-col">
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-100">{title}</h2>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tight">{description}</p>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-zinc-800 to-transparent flex-1 mx-4" />
            {badge && (
                <div className="text-[10px] font-mono bg-zinc-900/50 border border-zinc-800/50 px-4 py-1.5 rounded-full text-zinc-400 uppercase">
                    {badge}
                </div>
            )}
        </div>
        <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-sm">
            {children}
        </div>
    </section>
);

const HUDInput = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-2 w-full group">
        <label className="text-[9px] font-black text-zinc-600 uppercase ml-1 tracking-widest group-focus-within:text-sky-500 transition-colors">{label}</label>
        <input
            type={type} value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-sky-500/50 transition-all font-mono"
        />
    </div>
);

const Toggle = ({ label, enabled, onToggle, sublabel }) => (
    <div className="flex items-center justify-between p-5 bg-black/20 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all group">
        <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide group-hover:text-white transition-colors">{label}</span>
            {sublabel && <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">{sublabel}</span>}
        </div>
        <button
            onClick={() => onToggle(!enabled)}
            className={`w-11 h-6 rounded-full transition-all relative ${enabled ? 'bg-sky-600' : 'bg-zinc-800'}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'left-6' : 'left-1'}`} />
        </button>
    </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function ConfigPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(72);

    // Estados das Configurações
    const [name, setName] = useState("JOÃO_MAKER");
    const [email, setEmail] = useState("maker@oficina.com.br");
    const [performance, setPerformance] = useState(true);

    return (
        <div className="flex h-screen w-full bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 72 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out overflow-hidden" style={{ marginLeft: `${larguraSidebar}px` }}>

                {/* GRID DE FUNDO */}
                <div className="absolute inset-x-0 top-0 h-[500px] z-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        maskImage: 'linear-gradient(to bottom, black, transparent)'
                    }}
                />

                {/* HEADER TÉCNICO */}
                <header className="h-20 min-h-[5rem] px-8 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-40 relative">
                    <div className="flex items-center gap-6">
                        <div>
                            {/* Título Principal no padrão HUD */}
                            <h1 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 leading-none mb-1.5">
                                Painel de Controle
                            </h1>

                            {/* Subtítulo com os indicadores de status da oficina */}
                            <div className="flex items-center gap-4 text-[10px] font-bold">
                                <span className="flex items-center gap-1.5 text-emerald-500/80 uppercase">
                                    <ShieldCheck size={12} strokeWidth={3} /> Conexão Segura
                                </span>

                                {/* Bolinha divisora igual das outras telas */}
                                <div className="w-1 h-1 rounded-full bg-zinc-800" />

                                <span className="text-zinc-500 uppercase tracking-tighter">
                                    Terminal v2.5 Stable
                                </span>
                            </div>
                        </div>
                    </div>

                    <button className="h-[40px] px-6 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-3 shadow-lg shadow-sky-900/20 active:scale-95 transition-all">
                        <Save size={16} strokeWidth={3} /> Salvar Alterações
                    </button>
                </header>

                {/* CONTEÚDO SCROLLÁVEL */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                    <div className="max-w-[1200px] mx-auto space-y-12">

                        {/* KPIS DE CONTA */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <TechStatCard
                                title="Status da Conta"
                                value="PROFISSIONAL"
                                icon={Zap}
                                colorClass="text-sky-500"
                                secondaryLabel="Plano Atual"
                                secondaryValue="FARM_UNLIMITED"
                            />
                            <TechStatCard
                                title="Segurança do Terminal"
                                value="92%"
                                icon={ShieldCheck}
                                colorClass="text-emerald-500"
                                secondaryLabel="Integridade"
                                secondaryValue="PROTEGIDO"
                            />
                            <TechStatCard
                                title="Sincronia Nuvem"
                                value="ATIVA"
                                icon={Cloud}
                                colorClass="text-amber-500"
                                secondaryLabel="Último Backup"
                                secondaryValue="HÁ 2 MINUTOS"
                            />
                        </div>

                        {/* SEÇÃO 01: PERFIL */}
                        <SettingSection
                            title="Operador do Sistema"
                            description="Informações de identificação do terminal"
                            icon={User}
                            badge="Perfil_Ativo"
                        >
                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="relative group shrink-0">
                                    <div className="w-28 h-28 rounded-[2.5rem] bg-zinc-900 border-2 border-zinc-800 overflow-hidden flex items-center justify-center shadow-2xl transition-all group-hover:border-sky-500/50">
                                        <User size={48} className="text-zinc-700" />
                                    </div>
                                    <button className="absolute -bottom-2 -right-2 p-2.5 bg-sky-600 rounded-2xl border-4 border-[#050505] text-white hover:scale-110 transition-all shadow-xl">
                                        <Camera size={16} strokeWidth={3} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 w-full">
                                    <HUDInput label="ID_NOME_OPERADOR" value={name} onChange={setName} />
                                    <HUDInput label="TERMINAL_EMAIL" value={email} onChange={setEmail} type="email" />
                                </div>
                            </div>
                        </SettingSection>

                        {/* SEÇÃO 02: INTERFACE (ANTIGO IDIOMA) */}
                        <SettingSection
                            title="Personalização da Interface"
                            description="Ajuste a experiência visual do Maker OS"
                            icon={Monitor}
                            badge="UI_Engine_v4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Toggle
                                    label="Modo Alta Performance"
                                    enabled={performance}
                                    onToggle={setPerformance}
                                    sublabel="Reduz blur e animações complexas"
                                />
                                <Toggle
                                    label="Exibir G-Code Decorativo"
                                    enabled={true}
                                    onToggle={() => { }}
                                    sublabel="Linhas de código nas bordas da tela"
                                />
                                <Toggle
                                    label="Sons de Notificação"
                                    enabled={true}
                                    onToggle={() => { }}
                                    sublabel="Feedback sonoro ao concluir prints"
                                />
                                <Toggle
                                    label="Painel de Telemetria Oculto"
                                    enabled={false}
                                    onToggle={() => { }}
                                    sublabel="Exibir dados apenas em tela cheia"
                                />
                            </div>
                        </SettingSection>

                        {/* SEÇÃO 03: SEGURANÇA */}
                        <SettingSection
                            title="Segurança e Acesso"
                            description="Camadas de proteção da sua Print Farm"
                            icon={Lock}
                            badge="Auth_Protocol_v2"
                        >
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-black/20 border border-zinc-800 rounded-2xl flex items-center justify-between hover:bg-black/40 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-sky-500 transition-colors">
                                                <Lock size={18} />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-300 uppercase">Chave de Segurança</span>
                                        </div>
                                        <button className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Alterar</button>
                                    </div>
                                    <div className="p-5 bg-black/20 border border-zinc-800 rounded-2xl flex items-center justify-between hover:bg-black/40 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                                                <Smartphone size={18} />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-300 uppercase">Verificação 2FA</span>
                                        </div>
                                        <button className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Configurar</button>
                                    </div>
                                </div>
                                <div className="pt-4 flex items-center justify-between border-t border-white/5 opacity-60">
                                    <div className="flex items-center gap-3 text-zinc-500">
                                        <Activity size={16} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Sessão: Chrome / Windows 11 (São Paulo, BR)</span>
                                    </div>
                                    <button className="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase hover:underline underline-offset-4">
                                        <LogOut size={12} /> Sair do Sistema
                                    </button>
                                </div>
                            </div>
                        </SettingSection>

                        {/* ZONA DE PERIGO */}
                        <div className="pt-8 border-t border-zinc-900">
                            <div className="bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div>
                                    <div className="flex items-center gap-2 text-rose-500 mb-2">
                                        <Trash2 size={18} />
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">Área Crítica</h3>
                                    </div>
                                    <p className="text-xs text-zinc-500 max-w-md font-medium uppercase leading-relaxed">
                                        Ao encerrar esta conta, todos os registros de produção, estoque e máquinas serão apagados permanentemente.
                                    </p>
                                </div>
                                <button className="h-12 px-8 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-3 active:scale-95">
                                    Encerrar Terminal
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <footer className="p-6 text-center border-t border-white/5 bg-black/20 relative z-40">
                    <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.5em]">PrintLog Professional • 2026 • Build_0x25A</p>
                </footer>
            </main>
        </div>
    );
}