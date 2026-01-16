import React from 'react';
import {
    User, Lock, RefreshCw, Save, ShieldCheck,
    KeyRound, Fingerprint, ShieldAlert, FileText,
    Table, Trash2, Loader2, Camera, Mail,
    Download,
    Wrench, HardDrive, Info, Shield, Check,
} from 'lucide-react';

import { useLogicaConfiguracao } from '../../utils/configLogic';
import Popup from '../../components/Popup';
import BarraLateralPrincipal from "../../layouts/mainSidebar";
import AvisoFlutuante from "../../components/Toast";

// --- COMPONENTE DE CARTÃƒO (ESTILO DASHBOARD) ---
const CartaoInformativo = ({ titulo, subtitulo, Icone, classeCor = "sky", children, etiqueta, className = "" }) => {
    const temas = {
        sky: "text-sky-400 bg-sky-500/10",
        emerald: "text-emerald-400 bg-emerald-500/10",
        amber: "text-amber-400 bg-amber-500/10",
        rose: "text-rose-400 bg-rose-500/10",
    };
    const temaEscolhido = temas[classeCor] || temas.sky;

    return (
        <div className={`bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-4 hover-lift group ${className}`}>
            {/* Header do Card */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                        {titulo}
                    </h3>
                    {subtitulo && (
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">
                            {subtitulo}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {etiqueta && (
                        <span className="text-[9px] font-black px-2 py-1 rounded bg-zinc-950/40 border border-zinc-800 text-zinc-500 uppercase tracking-widest leading-none">
                            {etiqueta}
                        </span>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${temaEscolhido} group-hover:scale-110 transition-transform`}>
                        <Icone size={20} strokeWidth={2} />
                    </div>
                </div>
            </div>
            {/* Content */}
            <div className="h-full">
                {children}
            </div>
        </div>
    );
};

export default function PaginaConfiguracao() {
    const logica = useLogicaConfiguracao();
    const [exibirModalSuporte, setExibirModalSuporte] = React.useState(false);
    const [exibirModalExclusao, setExibirModalExclusao] = React.useState(false);

    if (!logica.estaCarregado) return (
        <div className="h-screen w-full bg-[#030303] flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <RefreshCw className="text-cyan-500 animate-spin" size={40} />
                <div className="absolute inset-0 blur-lg bg-cyan-500/20 animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-[0.4em]">Iniciando Painel de Controle...</p>
        </div>
    );

    const temSenhaDefinida = logica.usuario?.passwordEnabled;


    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">


            <input
                type="file"
                ref={logica.referenciaEntradaArquivo}
                onChange={logica.manipularCarregamentoImagem}
                accept="image/*"
                className="hidden"
            />

            {logica.aviso.exibir && (
                <AvisoFlutuante
                    message={logica.aviso.mensagem}
                    type={logica.aviso.tipo}
                    onClose={() => logica.setAviso({ ...logica.aviso, exibir: false })}
                />
            )}

            <BarraLateralPrincipal />

            <main className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar" style={{ marginLeft: `${logica.larguraBarraLateral}px` }}>

                {/* Fundo Decorativo */}
                <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
                    }} />

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-sky-500/30 via-transparent to-transparent" />
                    </div>
                </div>

                {/* ConteÃºdo Principal */}
                <div className="relative z-10 p-8 xl:p-12 max-w-[1600px] mx-auto w-full">
                    <div className="mb-12 animate-fade-in-up">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                                    Configurações
                                </h1>
                                <p className="text-sm text-zinc-500">
                                    Ajustes da sua oficina maker
                                </p>
                            </div>

                            <button
                                onClick={logica.salvarAlteracoesGerais}
                                disabled={logica.estaSalvando || !logica.temAlteracao}
                                className={`
                                    h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] 
                                    flex items-center gap-3 transition-all duration-300
                                    active:scale-[0.98]
                                    ${logica.temAlteracao
                                        ? 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 border border-sky-500/20'
                                        : 'bg-zinc-900/50 text-zinc-600 border border-zinc-800 opacity-50 cursor-not-allowed'
                                    }
                                `}
                            >
                                {logica.estaSalvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>

                    {/* Grid de Widgets */}
                    <div className="space-y-4">
                        {/* Linha 1: Resumo RÃ¡pido */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            {[
                                {
                                    Icone: Fingerprint,
                                    label: 'Identificador Ãšnico',
                                    value: logica.usuario?.id?.slice(-8).toUpperCase(),
                                    color: 'sky',
                                    value: logica.usuario?.id?.slice(-8).toUpperCase(),
                                    color: 'sky',
                                    info: 'Código de Registro'
                                },
                                {
                                    Icone: ShieldCheck,
                                    label: 'Segurança da Conta',
                                    value: temSenhaDefinida ? 'Protegida' : 'Sem Senha',
                                    color: temSenhaDefinida ? 'emerald' : 'amber',
                                    info: 'Status de Proteção'
                                },
                                {
                                    Icone: logica.statusConexaoNuvem.Icone,
                                    label: 'Conexão Online',
                                    value: logica.statusConexaoNuvem.rotulo,
                                    color: logica.statusConexaoNuvem.cor === 'cyan' ? 'sky' : logica.statusConexaoNuvem.cor,
                                    info: logica.statusConexaoNuvem.informacao,
                                },
                            ].map((item, i) => (
                                <div key={i} className="bg-zinc-950/40 border border-zinc-800/50 rounded-2xl p-6 hover-lift group">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                                            {item.label}
                                        </h3>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${item.color}-500/10 text-${item.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                                            <item.Icone size={20} strokeWidth={2} className={item.value === 'Conectando' ? 'animate-spin' : ''} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-mono font-black text-${item.color}-400 mb-1`}>{item.value}</p>
                                        <p className="text-xs text-zinc-600">{item.info}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Linha 2: ConfiguraÃ§Ãµes Principais */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                            {/* SEÃ‡ÃƒO DE PERFIL DO MAKER (Esquerda, ocupando 2 linhas) */}
                            <div className="lg:row-span-2 h-full">
                                <CartaoInformativo titulo="Minha Foto" subtitulo="Imagem do Perfil" Icone={User} classeCor="sky" etiqueta="Usuário" className="h-full">
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="relative">


                                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-zinc-800 bg-black p-1 transition-all shadow-2xl relative z-10">
                                                {logica.usuario?.imageUrl ? (
                                                    <img src={logica.usuario.imageUrl} className="w-full h-full object-cover rounded-xl" alt="Sua Foto" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-950/40 rounded-xl">
                                                        <User size={40} className="text-zinc-700" />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => logica.referenciaEntradaArquivo.current?.click()}
                                                className="absolute -bottom-2 -right-2 z-20 p-3 bg-sky-500 text-white rounded-2xl shadow-xl hover:bg-sky-400 transition-all duration-300 border-4 border-zinc-950 hover:scale-110 active:scale-95"
                                            >
                                                <Camera size={16} />
                                            </button>
                                        </div>
                                        <div className="mt-6 text-center">
                                            <h2 className="text-xl font-black text-white uppercase tracking-tight">{logica.primeiroNome || "Membro da Oficina"}</h2>
                                            <div className="flex items-center gap-2 justify-center mt-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">Acesso Ativo</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-600 uppercase ml-1 tracking-wider flex items-center gap-2">
                                                Nome do Membro <Info size={10} className="text-sky-500" />
                                            </label>
                                            <input
                                                value={logica.primeiroNome}
                                                onChange={e => logica.setPrimeiroNome(e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-sky-500/50 transition-all uppercase tracking-wide"
                                            />
                                        </div>
                                        <div className="p-4 bg-zinc-950/40/30 border border-zinc-800/50 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-[8px] font-black text-zinc-600 uppercase mb-1 tracking-wider">E-mail Cadastrado</p>
                                                <p className="text-[10px] text-zinc-400 font-mono truncate">{logica.usuario?.primaryEmailAddress?.emailAddress}</p>
                                            </div>
                                            <Mail size={14} className="text-zinc-600 shrink-0" />
                                        </div>
                                    </div>
                                </CartaoInformativo>
                            </div>

                            {/* SEÃ‡ÃƒO DE SEGURANÃ‡A E DADOS */}


                            {/* CONTROLE DE SENHA */}
                            <CartaoInformativo titulo="Senha de Acesso" subtitulo="Segurança da Conta" Icone={Lock} classeCor="emerald" etiqueta="Privado">
                                <div className="space-y-6 mb-6">
                                    {temSenhaDefinida && (
                                        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                            <Shield className="text-emerald-500" size={16} />
                                            <span className="text-xs font-bold text-emerald-400">Senha configurada e protegida</span>
                                        </div>
                                    )}

                                </div>
                                <button
                                    onClick={() => logica.setExibirJanelaSenha(true)}
                                    className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98]"
                                >
                                    <KeyRound size={16} /> {temSenhaDefinida ? "Trocar Senha Atual" : "Criar Nova Senha"}
                                </button>
                            </CartaoInformativo>

                            {/* EXPORTAÇÃO DE RELATÓRIOS */}
                            <CartaoInformativo titulo="Baixar Dados" subtitulo="Relatórios e Planilhas" Icone={HardDrive} classeCor="sky" etiqueta="Backup">


                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => logica.exportarRelatorio('csv')}
                                        className="group w-full p-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Table size={18} className="text-emerald-500 transition-colors" />
                                            <span className="text-xs font-black text-emerald-500 uppercase tracking-wide transition-colors">Planilha Excel (CSV)</span>
                                        </div>
                                        <Download size={14} className="text-emerald-500/50 transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => logica.exportarRelatorio('pdf')}
                                        className="group w-full p-4 bg-sky-500/5 hover:bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} className="text-sky-500 transition-colors" />
                                            <span className="text-xs font-black text-sky-500 uppercase tracking-wide transition-colors">Documento Técnico (PDF)</span>
                                        </div>
                                        <Download size={14} className="text-sky-500/50 transition-colors" />
                                    </button>
                                </div>
                            </CartaoInformativo>

                            {/* ZONA DE EXCLUSÃO (Rodapé direito - Ocupa 2 colunas) */}
                            <div className="lg:col-span-2">
                                <CartaoInformativo titulo="Excluir Conta" subtitulo="Zona de Perigo" Icone={Trash2} classeCor="rose" etiqueta="Irreversível">
                                    <p className="text-xs text-zinc-500 mb-4 leading-relaxed font-medium">
                                        Perda irreversível de todos os dados.
                                    </p>

                                    <button
                                        onClick={() => setExibirModalExclusao(true)}
                                        className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-[0.98]"
                                    >
                                        <ShieldAlert size={16} /> Excluir Minha Conta
                                    </button>
                                </CartaoInformativo>
                            </div>
                        </div>
                    </div>


                    {/* Footer de Suporte */}
                    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-zinc-900/50 to-zinc-900/20 border border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                                <Info size={20} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wide">Precisa de suporte extra?</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Nossa equipe pode ajudar com dúvidas específicas.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setExibirModalSuporte(true)}
                                className="px-5 py-2.5 bg-zinc-950/40 border border-zinc-800 hover:border-sky-500/50 hover:bg-sky-500/10 rounded-lg text-[10px] font-black text-zinc-400 hover:text-sky-500 uppercase tracking-widest transition-all flex items-center gap-2 group active:scale-[0.98]"
                            >
                                <Wrench size={12} className="text-zinc-600 group-hover:text-sky-500 transition-colors" />
                                Abrir Chamado
                            </button>
                            <button
                                onClick={() => { navigator.clipboard.writeText("suporte@printlog.com.br"); logica.setAviso({ exibir: true, tipo: 'sucesso', mensagem: 'E-mail copiado!' }); }}
                                className="px-5 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-800/50 rounded-lg text-[10px] font-black text-zinc-400 uppercase tracking-widest transition-all flex items-center gap-2 active:scale-[0.98]"
                            >
                                <Mail size={12} className="text-zinc-600" />
                                Copiar Email
                            </button>
                        </div>
                    </div>
                </div>
            </main >

            {/* JANELA DE SENHA (MODAL) */}
            < Popup
                isOpen={logica.exibirJanelaSenha}
                onClose={() => logica.setExibirJanelaSenha(false)
                }
                title="Configurar Senha"
                subtitle="Segurança"
                icon={KeyRound}
                maxWidth="max-w-md"
                isLoading={logica.estaSalvando}
                footer={
                    < button
                        onClick={logica.atualizarSenha}
                        disabled={logica.estaSalvando || !logica.todosRequisitosAtendidos}
                        className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${logica.todosRequisitosAtendidos
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-zinc-950/40 text-zinc-600 cursor-not-allowed border border-zinc-800'
                            }`}
                    >
                        {
                            logica.estaSalvando ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : logica.todosRequisitosAtendidos ? (
                                <>
                                    <Shield size={16} />
                                    Confirmar Mudança
                                </>
                            ) : (
                                'Complete os requisitos acima'
                            )
                        }
                    </button >
                }
            >
                <div className="space-y-4">
                    {temSenhaDefinida && (
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Senha Atual</label>
                            <input
                                type="password"
                                value={logica.formularioSenha.senhaAtual}
                                onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, senhaAtual: e.target.value })}
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Nova Senha</label>
                        <input
                            type="password"
                            value={logica.formularioSenha.novaSenha}
                            onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, novaSenha: e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Repetir Nova Senha</label>
                        <input
                            type="password"
                            value={logica.formularioSenha.confirmarSenha}
                            onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, confirmarSenha: e.target.value })}
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all"
                        />
                    </div>

                    {/* Lista de Requisitos */}
                    <div className="space-y-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Requisitos de Segurança
                        </h4>
                        <div className="space-y-2">
                            {[
                                { test: logica.requisitosSenha.tamanhoMinimo, label: "Mínimo de 8 caracteres" },
                                { test: logica.requisitosSenha.temMaiuscula, label: "Pelo menos 1 letra maiúscula (A-Z)" },
                                { test: logica.requisitosSenha.temMinuscula, label: "Pelo menos 1 letra minúscula (a-z)" },
                                { test: logica.requisitosSenha.temNumero, label: "Pelo menos 1 número (0-9)" },
                                { test: logica.requisitosSenha.temEspecial, label: "Pelo menos 1 caractere especial (!@#$...)" },
                                { test: logica.requisitosSenha.senhasConferem, label: "As senhas conferem" },
                            ].map((req, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${req.test ? 'bg-emerald-500 text-white scale-100' : 'bg-zinc-900/50 text-zinc-600 scale-90'
                                        }`}>
                                        {req.test ? <Check size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />}
                                    </div>
                                    <span className={`text-xs transition-colors duration-300 ${req.test ? 'text-zinc-300 font-bold' : 'text-zinc-600'}`}>
                                        {req.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Barra de ForÃ§a da Senha */}
                    {logica.formularioSenha.novaSenha.length > 0 && (
                        <div className="space-y-2 p-4 bg-zinc-950/40/30 rounded-xl border border-zinc-800/50">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Força da senha</span>
                                <span className={`text-xs font-black text-${logica.forcaSenha.cor}-400 uppercase`}>
                                    {logica.forcaSenha.rotulo}
                                </span>
                            </div>
                            <div className="h-2 bg-zinc-950/40 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-${logica.forcaSenha.cor}-500 transition-all duration-500 ease-out`}
                                    style={{ width: `${logica.forcaSenha.pontuacao}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Popup >

            {/* MODAL DE SUPORTE (GOOGLE FORMS) */}
            < Popup
                isOpen={exibirModalSuporte}
                onClose={() => setExibirModalSuporte(false)}
                title="Abrir Chamado"
                subtitle="Suporte Técnico"
                icon={Wrench}
                maxWidth="max-w-2xl"
            >
                <div className="w-full h-[70vh] bg-white rounded-xl overflow-hidden">
                    <iframe
                        src="https://docs.google.com/forms/d/e/1FAIpQLSet7HVM3asx7qDukgZv0pFhyQRaQGl-ArM6jLif8nceI223Ow/viewform?embedded=true"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        marginHeight="0"
                        marginWidth="0"
                    >
                        Carregando formulário...
                    </iframe>
                </div>
            </Popup >

            {/* MODAL DE CONFIRMAÃ‡ÃƒO DE EXCLUSÃƒO */}
            < Popup
                isOpen={exibirModalExclusao}
                onClose={() => setExibirModalExclusao(false)}
                title="Excluir Conta"
                subtitle="Ação Irreversível"
                icon={ShieldAlert}
                maxWidth="max-w-md"
                footer={
                    < div className="flex gap-3" >
                        <button
                            onClick={() => setExibirModalExclusao(false)}
                            className="flex-1 py-3 bg-zinc-950/40 hover:bg-zinc-900/50 border border-zinc-800/50 text-zinc-300 rounded-xl font-black uppercase text-xs tracking-wider transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                setExibirModalExclusao(false);
                                logica.excluirContaPermanente();
                            }}
                            className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={14} />
                            Confirmar Exclusão
                        </button>
                    </div >
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                        Você está prestes a <strong className="text-rose-400 font-black">excluir permanentemente</strong> sua conta e todos os dados associados:
                    </p>

                    <ul className="space-y-2 pl-4">
                        <li className="text-xs text-zinc-400 flex items-start gap-2">
                            <span className="text-rose-500 mt-0.5">â€¢</span>
                            <span>Todos os filamentos cadastrados</span>
                        </li>
                        <li className="text-xs text-zinc-400 flex items-start gap-2">
                            <span className="text-rose-500 mt-0.5">â€¢</span>
                            <span>Todas as impressoras configuradas</span>
                        </li>
                        <li className="text-xs text-zinc-400 flex items-start gap-2">
                            <span className="text-rose-500 mt-0.5">•</span>
                            <span>Histórico completo de projetos</span>
                        </li>
                        <li className="text-xs text-zinc-400 flex items-start gap-2">
                            <span className="text-rose-500 mt-0.5">•</span>
                            <span>Configurações e preferências</span>
                        </li>
                    </ul>

                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                        <p className="text-xs text-rose-300 font-bold text-center">
                            ⚠️ Esta ação não pode ser desfeita. Os dados não poderão ser recuperados.
                        </p>
                    </div>
                </div>
            </Popup >
        </div >
    );
}

