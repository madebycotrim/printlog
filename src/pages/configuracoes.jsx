import React, { useState, useEffect, useRef } from 'react';
import {
    User, Lock, Save, RefreshCw, Camera,
    CheckCircle2, Database, Cloud, AlertTriangle, Trash2, Search, X,
    AlertCircle, Info, LogOut
} from 'lucide-react';
import { useClerk, useUser } from "@clerk/clerk-react";

import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";

// --- SUB-COMPONENTE: JANELA MODAL (ESTILO HUD) ---
const Modal = ({ isOpen, onClose, title, children, actions }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-white/[0.03] flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{title}</span>
                    <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors"><X size={16} /></button>
                </div>
                <div className="p-6 text-zinc-300 text-sm leading-relaxed">{children}</div>
                {actions && <div className="px-6 py-4 bg-white/[0.02] flex gap-3 justify-end border-t border-white/[0.03]">{actions}</div>}
            </div>
        </div>
    );
};

// --- COMPONENTE: INPUT HUD ---
const HUDInput = ({ label, value, onChange, placeholder, type = "text", info, disabled }) => (
    <div className="space-y-2 group">
        <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-focus-within:text-sky-400 transition-colors">
                {label}
            </label>
            {info && <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-tight">{info}</span>}
        </div>
        <div className="relative">
            <input
                disabled={disabled}
                type={type} value={value} onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-sky-500/30 focus:bg-zinc-900/80 transition-all font-sans disabled:opacity-40"
            />
        </div>
    </div>
);

// --- SEÇÃO DE CONFIGURAÇÃO ---
const ConfigSection = ({ title, icon: Icon, badge, children }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex items-center gap-5">
            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sky-400 shadow-sm">
                <Icon size={18} strokeWidth={2} />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 whitespace-nowrap">{title}</h2>
            <div className="h-px flex-1 bg-zinc-800/40 mx-4" />
            <div className="px-4 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800/80 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {badge}
            </div>
        </div>
        {children}
    </div>
);

export default function ConfigPage() {
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [activeTab, setActiveTab] = useState('PERFIL');
    const [isSaving, setIsSaving] = useState(false);
    const [busca, setBusca] = useState("");

    // Estado para Toasts e Modais
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [modalConfig, setModalConfig] = useState({ 
        open: false, title: "", message: "", type: "info", onConfirm: null 
    });

    const { signOut } = useClerk();
    const { user, isLoaded } = useUser();
    const fileInputRef = useRef(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    useEffect(() => {
        if (isLoaded && user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
        }
    }, [isLoaded, user]);

    const handleGlobalSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === 'PERFIL') await user.update({ firstName, lastName });
            setToast({ show: true, message: "Ajustes da oficina salvos com sucesso!", type: 'success' });
        } catch (err) {
            setToast({ show: true, message: err.errors?.[0]?.message || "Erro de sincronização.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    const confirmDeleteAccount = () => {
        setModalConfig({
            open: true,
            title: "Protocolo de Rescisão",
            message: "ALERTA CRÍTICO: Esta ação é irreversível. Todos os seus dados de oficina, históricos e filamentos serão apagados permanentemente. Deseja prosseguir?",
            type: "danger",
            onConfirm: async () => {
                try {
                    setIsSaving(true);
                    await user.delete();
                } catch (err) {
                    setToast({ show: true, message: "Erro ao processar exclusão.", type: 'error' });
                } finally { 
                    setIsSaving(false); 
                    setModalConfig(prev => ({ ...prev, open: false }));
                }
            }
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'PERFIL':
                return (
                    <div className="space-y-12">
                        {/* CARD DE PERFIL */}
                        <div className="relative p-10 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm shadow-sm overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-48 h-48 blur-[100px] opacity-10 rounded-full bg-sky-500" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-[2rem] bg-zinc-950 border-2 border-zinc-800 p-1.5 group/avatar">
                                        <div className="w-full h-full rounded-[1.6rem] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                                            {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" alt="Sua Foto" /> : <User size={40} className="text-zinc-700" />}
                                            <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera size={24} className="text-white" />
                                            </button>
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            try {
                                                await user.setProfileImage({ file });
                                                setToast({ show: true, message: "Foto de perfil atualizada!", type: 'success' });
                                            } catch {
                                                setToast({ show: true, message: "Erro ao carregar imagem.", type: 'error' });
                                            }
                                        }
                                    }} className="hidden" accept="image/*" />
                                </div>
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.3em]">Farm Manager</p>
                                        <h3 className="text-3xl font-black text-zinc-100 tracking-tighter leading-none uppercase">
                                            {firstName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">{lastName}</span>
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                        <span className="px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-2">
                                            <CheckCircle2 size={12} /> Sistemas Operacionais
                                        </span>
                                        <span className="px-3 py-1 bg-zinc-950/50 border border-zinc-800 text-zinc-500 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-2">
                                            <Database size={12} /> ID: {user?.id.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ConfigSection title="Identidade do Operador" icon={User} badge="Perfil">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/50">
                                <HUDInput label="Primeiro Nome" value={firstName} onChange={setFirstName} />
                                <HUDInput label="Sobrenome" value={lastName} onChange={setLastName} />
                                <HUDInput label="E-mail Principal" value={user?.primaryEmailAddress?.emailAddress || ""} disabled info="Acesso Restrito" />
                                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-4">
                                    <Cloud className="text-sky-500/60" size={20} />
                                    <p className="text-[10px] font-medium text-zinc-500 uppercase leading-relaxed tracking-wider">
                                        As credenciais de login são gerenciadas por protocolo de segurança externo.
                                    </p>
                                </div>
                            </div>
                        </ConfigSection>
                    </div>
                );

            case 'SEGURANÇA':
                return (
                    <div className="space-y-12">
                        <ConfigSection title="Segurança da Camada de Acesso" icon={Lock} badge="Privacidade">
                            <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/50 space-y-10">
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed border-l-2 border-sky-500/30 pl-6 uppercase tracking-tight">
                                    Sua conta opera sob criptografia de ponta a ponta. Protocolos gerenciados via CLERK_AUTH_SERVICE.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <HUDInput label="Senha Atual" type="password" placeholder="********" />
                                    <HUDInput label="Nova Senha" type="password" placeholder="********" />
                                </div>
                            </div>
                        </ConfigSection>

                        <ConfigSection title="Protocolos de Rescisão" icon={AlertTriangle} badge="Zona Crítica">
                            <div className="bg-rose-500/5 p-10 rounded-[2.5rem] border border-rose-500/10 space-y-8 relative overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-500/10 blur-[60px] pointer-events-none" />
                                <div className="flex flex-col relative select-none">
                                    <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-500/60 mb-1">Danger Zone // Irreversible Action</h1>
                                    <span className="text-xl font-black uppercase tracking-tighter text-white">
                                        Encerrar <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-600">Conta Maker</span>
                                    </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed max-w-xl uppercase tracking-wider">
                                    Ao encerrar sua conta, todos os registros de filamentos, logs e configurações serão <span className="text-rose-400">removidos permanentemente</span>.
                                </p>
                                <button
                                    onClick={confirmDeleteAccount}
                                    className="group flex items-center gap-3 px-6 py-4 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 rounded-2xl transition-all duration-300"
                                >
                                    <Trash2 size={18} className="text-rose-500 group-hover:text-white transition-colors" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 group-hover:text-white">
                                        Confirmar Exclusão de Dados
                                    </span>
                                </button>
                            </div>
                        </ConfigSection>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>

                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none opacity-[0.1]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }}
                />

                <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-700 via-sky-500 to-indigo-400 opacity-60" />
                    <div className="flex flex-col relative select-none">
                        <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Painel de Controle</h1>
                        <span className="text-xl font-black uppercase tracking-tighter text-white">
                            Ajustes da <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Oficina</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden lg:block">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors ${busca && 'text-sky-400'}`} size={14} />
                            <input
                                className="w-64 bg-zinc-900/40 border border-white/5 rounded-xl py-2 pl-11 pr-4 text-[10px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest focus:border-sky-500/30 focus:bg-zinc-900/80"
                                placeholder="BUSCAR CONFIG..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleGlobalSave}
                            disabled={isSaving}
                            className="h-10 px-8 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-3 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                            {isSaving ? "Sincronizando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative">
                    <aside className="w-80 border-r border-zinc-800/50 p-8 bg-zinc-900/10 relative z-40 flex flex-col justify-between shrink-0">
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-8 px-4 border-l border-zinc-800">Menu de Preferências</p>
                            {[
                                { id: 'PERFIL', label: 'Meu Perfil', icon: User },
                                { id: 'SEGURANÇA', label: 'Segurança e Acesso', icon: Lock },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${activeTab === tab.id ? 'bg-zinc-100 text-zinc-950 shadow-lg scale-[1.02]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                                >
                                    <tab.icon size={18} strokeWidth={2.5} /> {tab.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => signOut()} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all group">
                            <LogOut size={18} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" /> Encerrar Sessão
                        </button>
                    </aside>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-16 relative z-10 scroll-smooth">
                        <div className="max-w-4xl mx-auto ">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL GLOBAL DE ALERTAS E CONFIRMAÇÕES */}
            <Modal
                isOpen={modalConfig.open}
                onClose={() => setModalConfig({ ...modalConfig, open: false })}
                title={modalConfig.title}
                actions={
                    <div className="flex w-full gap-2">
                        {modalConfig.type === 'danger' ? (
                            <>
                                <button onClick={() => setModalConfig({ ...modalConfig, open: false })} className="flex-1 text-[10px] font-bold text-zinc-500 uppercase px-4">Cancelar</button>
                                <button onClick={modalConfig.onConfirm} className="flex-1 bg-rose-600 text-white text-[10px] font-black uppercase px-6 py-2.5 rounded-xl">Excluir Tudo</button>
                            </>
                        ) : (
                            <button onClick={() => setModalConfig({ ...modalConfig, open: false })} className="w-full bg-sky-600 text-white text-[10px] font-black uppercase px-6 py-2.5 rounded-xl">Entendi</button>
                        )}
                    </div>
                }
            >
                <div className="flex flex-col items-center text-center gap-4">
                    {modalConfig.type === 'danger' ? <AlertTriangle size={40} className="text-rose-500/50" /> : <Info size={40} className="text-sky-500/50" />}
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed">{modalConfig.message}</p>
                </div>
            </Modal>
        </div>
    );
}