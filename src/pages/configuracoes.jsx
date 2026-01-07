import React from 'react';
import { 
    User, Lock, Search, Cpu, RefreshCw, Save, 
    LogOut, ChevronRight, ShieldCheck, KeyRound 
} from 'lucide-react';

// Lógica e Componentes de Interface
import { useConfigLogic } from '../features/configuracoes/logic/configs';
import { HUDInput } from '../features/configuracoes/components/ConfigUI';
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";
import Popup from "../components/Popup";

// Sub-módulos da Página
import ProfileModule from '../features/configuracoes/components/moduloPerfil';
import SecurityModule from '../features/configuracoes/components/moduloSeguranca';

export default function ConfigPage() {
    const logic = useConfigLogic();

    // Carregando os dados do usuário...
    if (!logic.isLoaded) return null;

    // Função auxiliar para renderizar o módulo ativo
    const renderActiveModule = () => {
        switch (logic.activeTab) {
            case 'PERFIL':
                return <ProfileModule logic={logic} />;
            case 'SEGURANÇA':
                return <SecurityModule logic={logic} />;
            default:
                return <ProfileModule logic={logic} />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden selection:bg-sky-500/30">
            {/* Sistema de Notificação */}
            {logic.toast.show && (
                <Toast 
                    {...logic.toast} 
                    onClose={() => logic.setToast({ ...logic.toast, show: false })} 
                />
            )}

            {/* Barra Lateral Principal */}
            <MainSidebar onCollapseChange={(collapsed) => logic.setLarguraSidebar(collapsed ? 68 : 256)} />

            <main 
                className="flex-1 flex flex-col relative transition-all duration-500" 
                style={{ marginLeft: `${logic.larguraSidebar}px` }}
            >
                {/* Cabeçalho do Painel */}
                <header className="h-24 px-10 flex items-center justify-between z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-2xl">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <Cpu size={12} className="text-sky-500 animate-pulse" />
                            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Mkr_Terminal_v4.2</h1>
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter text-white">
                            Ajustes do <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500">Sistema</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={14} />
                            <input
                                className="w-72 bg-zinc-900/50 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-[11px] text-zinc-200 outline-none focus:border-sky-500/40 transition-all font-bold"
                                placeholder="BUSCAR CONFIGURAÇÃO..."
                                value={logic.busca}
                                onChange={e => logic.setBusca(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={logic.handleGlobalSave}
                            disabled={logic.isSaving || !logic.isDirty}
                            className="h-11 px-8 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all disabled:opacity-20 shadow-lg shadow-white/5"
                        >
                            {logic.isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            Salvar Alterações
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Navegação entre Módulos */}
                    <aside className="w-80 border-r border-zinc-900/50 p-8 bg-zinc-950/30 flex flex-col justify-between shrink-0">
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-8 px-4 border-l-2 border-sky-500/50">Menu de Opções</p>
                            {[
                                { id: 'PERFIL', label: 'Meu Perfil Maker', icon: User },
                                { id: 'SEGURANÇA', label: 'Segurança e Acesso', icon: Lock }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => logic.setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group ${logic.activeTab === tab.id ? 'bg-zinc-100 text-zinc-950 shadow-xl' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <tab.icon size={18} strokeWidth={logic.activeTab === tab.id ? 2.5 : 2} />
                                        {tab.label}
                                    </div>
                                    {logic.activeTab === tab.id && <ChevronRight size={14} className="animate-in slide-in-from-left-2" />}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => logic.signOut()}
                            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 active:scale-95"
                        >
                            <LogOut size={18} /> Sair da Conta
                        </button>
                    </aside>

                    {/* Área de Conteúdo Dinâmico */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-16">
                        <div className="max-w-4xl mx-auto">
                            {renderActiveModule()}
                        </div>
                    </div>
                </div>
            </main>

            {/* Janela de Confirmação */}
            <Popup
                isOpen={logic.modalConfig.open}
                onClose={() => !logic.isSaving && logic.setModalConfig({ ...logic.modalConfig, open: false })}
                title={logic.modalConfig.title}
                subtitle="Confirmação do Sistema"
                icon={logic.modalConfig.icon}
                footer={
                    <div className="flex w-full gap-3 p-6 bg-zinc-900/50">
                        <button 
                            disabled={logic.isSaving} 
                            onClick={() => logic.setModalConfig({ ...logic.modalConfig, open: false })} 
                            className="flex-1 text-[11px] font-black text-zinc-500 uppercase h-14"
                        >
                            Voltar
                        </button>
                        <button
                            disabled={logic.isSaving}
                            onClick={logic.modalConfig.onConfirm}
                            className={`flex-[1.5] ${logic.modalConfig.type === 'danger' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-sky-600 hover:bg-sky-500'} text-white text-[11px] font-black uppercase h-14 rounded-2xl flex items-center justify-center gap-3 transition-all`}
                        >
                            {logic.isSaving ? <RefreshCw size={16} className="animate-spin" /> : "Confirmar Ação"}
                        </button>
                    </div>
                }
            >
                <div className="p-10 text-center border-t border-white/5">
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed uppercase tracking-wider">
                        {logic.modalConfig.message}
                    </p>
                </div>
            </Popup>

            {/* Janela de Senha */}
            <Popup
                isOpen={logic.showPasswordModal}
                onClose={() => !logic.isSaving && logic.setShowPasswordModal(false)}
                title={logic.user?.passwordEnabled ? "Atualizar Senha" : "Habilitar Senha"}
                subtitle="Segurança da Conta"
                icon={Lock}
                footer={
                    <div className="flex w-full gap-3 p-6 bg-zinc-900/50">
                        <button
                            disabled={logic.isSaving}
                            onClick={() => logic.setShowPasswordModal(false)}
                            className="flex-1 text-[11px] font-black text-zinc-500 uppercase h-14"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={logic.isSaving}
                            onClick={logic.handleUpdatePassword}
                            className="flex-[1.5] bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-black uppercase h-14 rounded-2xl flex items-center justify-center gap-3 transition-all"
                        >
                            {logic.isSaving ? <RefreshCw size={16} className="animate-spin" /> : "Confirmar"}
                        </button>
                    </div>
                }
            >
                <div className="p-10 space-y-6">
                    {logic.user?.passwordEnabled && (
                        <HUDInput
                            label="Senha Atual"
                            type="password"
                            value={logic.passwordForm.currentPassword}
                            onChange={(val) => logic.setPasswordForm({ ...logic.passwordForm, currentPassword: val })}
                            placeholder="••••••••"
                            icon={KeyRound}
                        />
                    )}
                    <HUDInput
                        label="Nova Senha"
                        type="password"
                        value={logic.passwordForm.newPassword}
                        onChange={(val) => logic.setPasswordForm({ ...logic.passwordForm, newPassword: val })}
                        placeholder="No mínimo 8 caracteres"
                        icon={ShieldCheck}
                    />
                    <HUDInput
                        label="Confirmar Nova Senha"
                        type="password"
                        value={logic.passwordForm.confirmPassword}
                        onChange={(val) => logic.setPasswordForm({ ...logic.passwordForm, confirmPassword: val })}
                        placeholder="Repita a nova senha"
                        icon={ShieldCheck}
                    />
                </div>
            </Popup>
        </div>
    );
}