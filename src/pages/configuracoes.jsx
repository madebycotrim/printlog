import React, { useState, useEffect, useRef } from 'react';
import {
    User, Lock, Save, RefreshCw, Camera,
    Database, Cloud, AlertTriangle, Trash2, Search,
    Info, LogOut, ShieldAlert, Monitor, Smartphone,
    ShieldCheck, Download, ChevronRight, Mail, Fingerprint,
    Cpu, Activity, Globe, HardDrive, FileJson, FileText, Printer,
    Table, KeyRound
} from 'lucide-react';
import { useClerk, useUser } from "@clerk/clerk-react";

// Utilitários e Componentes Customizados
import api from '../utils/api';
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";
import Popup from "../components/Popup";

// --- FUNÇÃO AUXILIAR: ESCAPE PARA CSV ---
const escapeCSV = (val) => {
    const stringVal = String(val || "");
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
};

// --- COMPONENTE: INPUT ESTILIZADO (HUD) ---
const HUDInput = ({ label, value, onChange, placeholder, type = "text", info, disabled, icon: Icon, maxLength = 50 }) => (
    <div className="space-y-2 group w-full">
        <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-focus-within:text-sky-400 transition-colors">
                {label}
            </label>
            {info && (
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {info}
                </span>
            )}
        </div>
        <div className="relative flex items-center">
            {Icon && (
                <Icon size={14} className="absolute left-4 text-zinc-600 group-focus-within:text-sky-500 transition-colors" />
            )}
            <input
                disabled={disabled}
                type={type}
                value={value}
                maxLength={maxLength}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-zinc-900/40 border border-zinc-800 rounded-xl ${Icon ? 'pl-11' : 'px-4'} py-3.5 text-sm text-zinc-200 outline-none focus:border-sky-500/40 focus:bg-zinc-900/80 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-zinc-700 shadow-inner`}
            />
        </div>
    </div>
);

// --- COMPONENTE: SEÇÃO DE CONFIGURAÇÃO ---
const ConfigSection = ({ title, icon: Icon, badge, description, children, visible = true }) => {
    if (!visible) return null;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-5">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sky-400 shadow-lg shadow-sky-500/5 mt-1 shrink-0">
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100">{title}</h2>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none bg-zinc-900 px-2 py-1 rounded border border-zinc-800 shrink-0">{badge}</span>
                    </div>
                    {description && (
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight mt-2 leading-relaxed max-w-2xl">
                            {description}
                        </p>
                    )}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-800/80 to-transparent mx-4 mt-4 hidden md:block" />
            </div>
            <div className="grid gap-6 pl-0 md:pl-14">
                {children}
            </div>
        </div>
    );
};

export default function ConfigPage() {
    // --- ESTADOS ---
    const [larguraSidebar, setLarguraSidebar] = useState(68);
    const [activeTab, setActiveTab] = useState('PERFIL');
    const [isSaving, setIsSaving] = useState(false);
    const [busca, setBusca] = useState("");
    const [sessions, setSessions] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [modalConfig, setModalConfig] = useState({
        open: false, title: "", message: "", type: "info", icon: Info, onConfirm: null
    });

    const { signOut } = useClerk();
    const { user, isLoaded } = useUser();
    const fileInputRef = useRef(null);

    const [firstName, setFirstName] = useState("");
    const [originalData, setOriginalData] = useState({ firstName: "" });

    // --- CARREGAMENTO INICIAL ---
    useEffect(() => {
        if (isLoaded && user) {
            setFirstName(user.firstName || "");
            setOriginalData({ firstName: user.firstName || "" });
            user.getSessions().then(res => setSessions(res)).catch(console.error);
        }
    }, [isLoaded, user]);

    const isDirty = firstName !== originalData.firstName;
    const isVisible = (tag) => !busca || tag.toLowerCase().includes(busca.toLowerCase());

    // --- AÇÃO: SALVAR PERFIL ---
    const handleGlobalSave = async () => {
        if (!isLoaded || !user) return;
        setIsSaving(true);
        try {
            await user.update({ firstName });
            setOriginalData({ firstName });
            setToast({ show: true, message: "Parâmetros atualizados no núcleo.", type: 'success' });
        } catch { setToast({ show: true, message: "Erro na sincronização.", type: 'error' }); }
        finally { setIsSaving(false); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setIsSaving(true);
            await user.setProfileImage({ file });
            setToast({ show: true, message: "Avatar atualizado.", type: 'success' });
        } catch { setToast({ show: true, message: "Falha no upload.", type: 'error' }); }
        finally { setIsSaving(false); }
    };

    // --- AÇÃO: REDEFINIR SENHA ---
    const handlePasswordReset = async () => {
        try {
            setIsSaving(true);
            if (!user.passwordEnabled) {
                setToast({ show: true, message: "Login Social ativo. Sem senha local.", type: 'error' });
                return;
            }
            await user.preparePasswordReset({ strategy: "reset_password_email_code" });
            setToast({ show: true, message: "Protocolo enviado ao seu e-mail.", type: 'success' });
        } catch (error) {
            const clerkError = error.errors?.[0]?.longMessage || "Falha ao solicitar redefinição.";
            setToast({ show: true, message: clerkError, type: 'error' });
        } finally { setIsSaving(false); }
    };

    // --- AÇÃO: REVOGAR SESSÃO ---
    const revokeSession = async (sessionObject) => {
        try {
            if (sessionObject.id === user.lastActiveSessionId) {
                setToast({ show: true, message: "Use 'Encerrar Conexão' para a sessão atual.", type: 'error' });
                return;
            }
            await sessionObject.revoke();
            setSessions((prev) => prev.filter((s) => s.id !== sessionObject.id));
            setToast({ show: true, message: "Terminal removido com sucesso.", type: 'success' });
        } catch (error) {
            const res = await user.getSessions();
            setSessions(res);
            setToast({ show: true, message: "Sincronização de sessões atualizada.", type: 'info' });
        }
    };

    // --- AÇÃO: EXPORTAR MANIFESTO ---
    const exportFormattedData = async (format) => {
        try {
            setIsSaving(true);
            // Simplificado para usar a rota protegida que o Worker identifica via Token
            const response = await api.get(`/users/backup`);
            if (!response.success) throw new Error("Falha na API");

            const { data, metadata } = response;
            const timestamp = new Date().getTime();
            let blob, filename;

            if (format === 'json') {
                blob = new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
                filename = `maker_core_manifesto_${timestamp}.json`;
            } else if (format === 'csv') {
                let rows = [
                    ["MAKER CORE - MANIFESTO TECNICO"],
                    ["Operador", escapeCSV(firstName)],
                    ["UID", user.id],
                    ["Gerado em", metadata.generated_at],
                    [""],
                    ["TABELA: FILAMENTOS"],
                    ["ID", "NOME", "MATERIAL", "PESO_ATUAL"]
                ];
                // CORREÇÃO: Sincronizado com nomes das colunas do D1 (nome, material, peso_atual)
                data.filaments.forEach(f => rows.push([f.id, escapeCSV(f.nome), escapeCSV(f.material), f.peso_atual]));
                
                rows.push([""], ["TABELA: IMPRESSORAS"], ["ID", "NOME", "MODELO", "STATUS"]);
                data.printers.forEach(p => rows.push([p.id, escapeCSV(p.nome), escapeCSV(p.modelo), p.status]));

                const csvContent = rows.map(e => e.join(",")).join("\n");
                // Adicionado BOM (\ufeff) para o Excel reconhecer caracteres PT-BR
                blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
                filename = `maker_planilha_${timestamp}.csv`;
            } else if (format === 'pdf') {
                const printWindow = window.open('', '_blank');
                if (!printWindow) {
                    setToast({ show: true, message: "Pop-up bloqueado pelo navegador.", type: 'error' });
                    setIsSaving(false); return;
                }
                printWindow.document.write(`
                    <html><head><title>Manifesto Maker Core</title><style>
                        body{font-family:monospace;padding:40px;background:#fff;color:#000}
                        h1{border-bottom:2px solid #000;padding-bottom:10px}
                        .sec{margin-top:20px;font-weight:bold;text-transform:uppercase;color:#666}
                        .val{font-size:16px;margin-bottom:10px;border-left:3px solid #0ea5e9;padding-left:10px}
                    </style></head><body>
                    <h1>MANIFESTO DE IDENTIDADE OPERACIONAL</h1>
                    <div class="sec">Operador</div><div class="val">${firstName}</div>
                    <div class="sec">Identificação (UID)</div><div class="val">${user.id}</div>
                    <div class="sec">Ativos</div><div class="val">${data.filaments.length} Filamentos / ${data.printers.length} Impressoras</div>
                    <script>window.onload = function(){ window.print(); window.close(); }</script></body></html>
                `);
                setIsSaving(false); return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            setToast({ show: true, message: `Manifesto .${format.toUpperCase()} gerado.`, type: 'success' });
        } catch (err) {
            setToast({ show: true, message: "Erro ao extrair manifesto do banco.", type: 'error' });
        } finally { setIsSaving(false); }
    };

    // --- AÇÃO: RESCISÃO ---
    const handleRescisaoCompleta = async () => {
        try {
            setIsSaving(true);
            const response = await api.delete('/users');
            if (response.success) {
                setToast({ show: true, message: "Expurgo concluído. Encerrando...", type: 'success' });
                setTimeout(() => signOut(), 2000);
            }
        } catch {
            setToast({ show: true, message: "Falha ao limpar banco de dados.", type: 'error' });
        } finally {
            setIsSaving(false);
            setModalConfig(prev => ({ ...prev, open: false }));
        }
    };

    const clearLocalCache = () => {
        localStorage.clear();
        setToast({ show: true, message: "Cache limpo. Reiniciando...", type: 'success' });
        setTimeout(() => window.location.reload(), 1500);
    };

    if (!isLoaded) return null;

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden selection:bg-sky-500/30">
            {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}

            <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

            <main className="flex-1 flex flex-col relative transition-all duration-500" style={{ marginLeft: `${larguraSidebar}px` }}>

                <header className="h-24 px-10 flex items-center justify-between z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-2xl">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <Cpu size={12} className="text-sky-500 animate-pulse" />
                            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Mkr_Terminal_v4.2</h1>
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter text-white">
                            Configurações do <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500">Núcleo</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={14} />
                            <input
                                className="w-72 bg-zinc-900/50 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-[11px] text-zinc-200 outline-none focus:border-sky-500/40 transition-all font-bold"
                                placeholder="LOCALIZAR COMANDO..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleGlobalSave}
                            disabled={isSaving || !isDirty}
                            className="h-11 px-8 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all disabled:opacity-20 shadow-lg shadow-white/5"
                        >
                            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            Sincronizar
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <aside className="w-80 border-r border-zinc-900/50 p-8 bg-zinc-950/30 flex flex-col justify-between shrink-0">
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-8 px-4 border-l-2 border-sky-500/50">Módulos de Sistema</p>
                            {[
                                { id: 'PERFIL', label: 'Identidade Operacional', icon: User, tag: "perfil nome avatar" },
                                { id: 'SEGURANÇA', label: 'Protocolos de Acesso', icon: Lock, tag: "senha seguranca sessao" },
                                { id: 'SISTEMA', label: 'Dados e Exportação', icon: Database, tag: "dados exportar cache backup" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group ${activeTab === tab.id ? 'bg-zinc-100 text-zinc-950 shadow-xl' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                        {tab.label}
                                    </div>
                                    {activeTab === tab.id && <ChevronRight size={14} className="animate-in slide-in-from-left-2" />}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setModalConfig({
                                open: true,
                                title: "Encerrar Sessão?",
                                message: "Você será desconectado do terminal com segurança.",
                                type: "info",
                                icon: LogOut,
                                onConfirm: () => signOut()
                            })}
                            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 active:scale-95"
                        >
                            <LogOut size={18} /> Encerrar Conexão
                        </button>
                    </aside>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-12 lg:p-16 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.03),transparent_40%)]">
                        <div className="max-w-4xl mx-auto space-y-16">

                            {activeTab === 'PERFIL' && (
                                <div className="space-y-16">
                                    <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/60 to-zinc-900/20 border border-white/5 overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Fingerprint size={160} className="text-white" /></div>
                                        <div className="relative z-10 flex items-center gap-10">
                                            {/* CORREÇÃO: Button semântico para acessibilidade */}
                                            <button 
                                                className="relative group/avatar cursor-pointer outline-none focus:ring-2 focus:ring-sky-500 rounded-[2.5rem]" 
                                                onClick={() => fileInputRef.current.click()}
                                                disabled={isSaving}
                                            >
                                                <div className="w-36 h-36 rounded-[2.5rem] bg-zinc-950 border-2 border-zinc-800 p-1.5 group-hover/avatar:border-sky-500/50 transition-all shadow-2xl overflow-hidden">
                                                    <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                                                        {isSaving && (
                                                            <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                                                                <RefreshCw size={24} className="text-sky-500 animate-spin" />
                                                            </div>
                                                        )}
                                                        {user?.imageUrl ? <img src={user.imageUrl} className="w-full h-full object-cover" alt="Avatar" /> : <User size={40} className="text-zinc-700" />}
                                                        <div className="absolute inset-0 bg-sky-950/80 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all">
                                                            <Camera size={24} className="text-white mb-2" />
                                                            <span className="text-[8px] font-black uppercase text-white tracking-widest">Alterar</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                            </button>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Activity size={12} className="text-emerald-500" />
                                                    <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">Operador Autenticado</p>
                                                </div>
                                                <h3 className="text-4xl font-black text-white tracking-tighter uppercase">{firstName || "Operador"}</h3>
                                                <div className="flex gap-3 mt-6">
                                                    <span className="px-4 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-xl text-[10px] font-bold uppercase tracking-wider">UID: {user?.id.slice(-8)}</span>
                                                    <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-sm shadow-emerald-500/5">
                                                        <ShieldCheck size={14} /> Status: Nominal
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <ConfigSection
                                        title="Parâmetros de Identidade"
                                        icon={User}
                                        badge="Módulo 01"
                                        description="Defina sua assinatura técnica para autoria no ecossistema."
                                        visible={isVisible("perfil nome email")}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/40">
                                            <HUDInput label="Nome Civil ou Maker" value={firstName} onChange={setFirstName} placeholder="Ex: Alex" />
                                            <HUDInput label="E-mail de Acesso" value={user?.primaryEmailAddress?.emailAddress || ""} disabled info="Canal Primário" icon={Mail} />
                                            <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 flex items-center gap-4">
                                                <Cloud className="text-sky-500/40" size={20} />
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sincronização Cloud</p>
                                                    <p className="text-[9px] text-zinc-600 font-bold uppercase mt-0.5">Clerk Auth Proxy Ativo</p>
                                                </div>
                                            </div>
                                        </div>
                                    </ConfigSection>
                                </div>
                            )}

                            {activeTab === 'SEGURANÇA' && (
                                <div className="space-y-16">
                                    <ConfigSection
                                        title="Protocolos de Acesso"
                                        icon={KeyRound}
                                        badge="Segurança"
                                        description="Gerencie suas credenciais e chaves de acesso ao terminal."
                                    >
                                        <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/40">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] text-zinc-200 font-black uppercase tracking-widest">Redefinição de Credenciais</p>
                                                    <p className="text-[10px] text-zinc-500 uppercase font-medium">Link de segurança enviado ao e-mail cadastrado.</p>
                                                </div>
                                                <button
                                                    onClick={handlePasswordReset}
                                                    disabled={isSaving || !user.passwordEnabled}
                                                    className="w-full md:w-auto px-8 py-4 bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white border border-sky-500/20 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                                                    {user.passwordEnabled ? "Redefinir Senha" : "Login via Social"}
                                                </button>
                                            </div>
                                        </div>
                                    </ConfigSection>

                                    <ConfigSection
                                        title="Monitoramento de Terminais"
                                        icon={Monitor}
                                        badge="Acessos"
                                        description="Relação de todos os dispositivos autenticados."
                                    >
                                        <div className="grid gap-4">
                                            {sessions.map((sess) => (
                                                <div key={sess.id} className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 flex items-center justify-between group hover:bg-zinc-900/50 transition-all">
                                                    <div className="flex items-center gap-5">
                                                        <div className="p-4 bg-zinc-950 rounded-2xl text-zinc-500 group-hover:text-sky-500 border border-zinc-800">
                                                            {sess.latestActivity?.device?.type === 'mobile' ? <Smartphone size={22} /> : <Monitor size={22} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[12px] font-black text-zinc-100 uppercase tracking-tight">{sess.latestActivity?.device?.model || "Terminal Remoto"}</p>
                                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">IP: {sess.latestActivity?.ipAddress}</p>
                                                        </div>
                                                    </div>
                                                    {sess.id === user.lastActiveSessionId ? (
                                                        <span className="text-[9px] font-black text-sky-400 bg-sky-400/10 px-4 py-2 rounded-xl uppercase border border-sky-400/20">Sessão Atual</span>
                                                    ) : (
                                                        <button onClick={() => revokeSession(sess)} className="text-[9px] font-black text-rose-500 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl uppercase border border-rose-500/20 transition-all">Revogar</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </ConfigSection>

                                    <ConfigSection title="Zona de Exclusão" icon={AlertTriangle} badge="Nível Crítico" description="A rescisão apaga todos os registros permanentemente do D1.">
                                        <div className="bg-rose-500/5 p-12 rounded-[2.5rem] border border-rose-500/20 space-y-8 relative overflow-hidden group">
                                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-500/10 blur-[80px] pointer-events-none" />
                                            <h2 className="text-2xl font-black uppercase text-white tracking-tighter">Rescisão de <span className="text-rose-500">Identidade</span></h2>
                                            <button
                                                onClick={() => setModalConfig({
                                                    open: true,
                                                    title: "Confirmar Expurgo?",
                                                    message: "Esta ação apagará filamentos, impressoras e orçamentos vinculados ao seu UID permanentemente.",
                                                    type: "danger",
                                                    icon: AlertTriangle,
                                                    onConfirm: handleRescisaoCompleta
                                                })}
                                                className="group flex items-center gap-4 px-8 py-5 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-2xl transition-all duration-500"
                                            >
                                                <Trash2 size={20} className="text-rose-500 group-hover:text-white" />
                                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-500 group-hover:text-white">Confirmar Protocolo de Expurgo</span>
                                            </button>
                                        </div>
                                    </ConfigSection>
                                </div>
                            )}

                            {activeTab === 'SISTEMA' && (
                                <div className="space-y-16">
                                    <ConfigSection
                                        title="Portabilidade de Ativos"
                                        icon={Download}
                                        badge="Módulo 03"
                                        description="Extraia seu Manifesto de Dados diretamente do banco D1."
                                    >
                                        <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/40 space-y-8">
                                            <div className="flex items-start gap-4 p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                                                <HardDrive className="text-sky-500 mt-1" size={18} />
                                                <div className="space-y-1">
                                                    <p className="text-[11px] text-zinc-200 font-black uppercase tracking-widest">Manifesto do Núcleo</p>
                                                    <p className="text-[10px] text-zinc-500 uppercase leading-relaxed font-medium">Extração via API:</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <button onClick={() => exportFormattedData('json')} className="flex items-center justify-center gap-3 px-6 py-5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 rounded-2xl transition-all text-[10px] font-black uppercase group">
                                                    <FileJson size={18} className="text-zinc-600 group-hover:text-sky-500" /> Exportar .JSON
                                                </button>
                                                <button onClick={() => exportFormattedData('csv')} className="flex items-center justify-center gap-3 px-6 py-5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl transition-all text-[10px] font-black uppercase group">
                                                    <Table size={18} className="text-zinc-600 group-hover:text-emerald-500" /> Exportar Planilha
                                                </button>
                                                <button onClick={() => exportFormattedData('pdf')} className="flex items-center justify-center gap-3 px-6 py-5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 rounded-2xl transition-all text-[10px] font-black uppercase group">
                                                    <Printer size={18} className="text-zinc-600 group-hover:text-rose-500" /> Gerar .PDF
                                                </button>
                                            </div>
                                        </div>
                                    </ConfigSection>

                                    <ConfigSection title="Sincronização de Cache" icon={RefreshCw} badge="Memória" description="Reinicializa a memória local do navegador.">
                                        <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/40">
                                            <button onClick={clearLocalCache} className="flex items-center gap-4 px-8 py-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 rounded-2xl transition-all font-black uppercase text-[11px]">
                                                <RefreshCw size={20} /> Limpar Memória Local
                                            </button>
                                        </div>
                                    </ConfigSection>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Popup
                isOpen={modalConfig.open}
                onClose={() => !isSaving && setModalConfig({ ...modalConfig, open: false })}
                title={modalConfig.title}
                subtitle="Validação de Sistema"
                icon={modalConfig.icon}
                footer={
                    <div className="flex w-full gap-3 p-6 bg-zinc-900/50">
                        <button disabled={isSaving} onClick={() => setModalConfig({ ...modalConfig, open: false })} className="flex-1 text-[11px] font-black text-zinc-500 hover:text-zinc-300 uppercase h-14">Abortar</button>
                        <button
                            disabled={isSaving}
                            onClick={modalConfig.onConfirm}
                            className={`flex-[1.5] ${modalConfig.type === 'danger' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-sky-600 hover:bg-sky-500'} text-white text-[11px] font-black uppercase h-14 rounded-2xl flex items-center justify-center gap-3 transition-all`}
                        >
                            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : "Confirmar Protocolo"}
                        </button>
                    </div>
                }
            >
                <div className="p-10 text-center border-t border-white/5">
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed uppercase tracking-wider">{modalConfig.message}</p>
                </div>
            </Popup>
        </div>
    );
}
