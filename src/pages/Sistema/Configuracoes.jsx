import React from 'react';
import {
    User, Lock, RefreshCw, Save, ShieldCheck,
    KeyRound, Fingerprint, ShieldAlert, FileText,
    Table, Trash2, Loader2, Camera, Mail,
    Download,
    Wrench, HardDrive, Info, Shield, Check,
} from 'lucide-react';

import { useLogicaConfiguracao } from '../../utils/configLogic';
import ManagementLayout from "../../layouts/ManagementLayout";
import { UnifiedInput } from "../../components/UnifiedInput";
import Modal from '../../components/ui/Modal';
import DataCard from '../../components/ui/DataCard';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';



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
        <ManagementLayout>
            <input
                type="file"
                ref={logica.referenciaEntradaArquivo}
                onChange={logica.manipularCarregamentoImagem}
                accept="image/*"
                className="hidden"
            />



            {/* Conteúdo Principal */}
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

                        <Button
                            onClick={logica.salvarAlteracoesGerais}
                            disabled={!logica.temAlteracao}
                            isLoading={logica.estaSalvando}
                            variant={logica.temAlteracao ? "primary" : "secondary"}
                            className={`h-14 px-8 shadow-lg ${logica.temAlteracao ? "bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 shadow-sky-500/10 border-sky-500/20" : "opacity-50"}`}
                            icon={Save}
                        >
                            Salvar Alterações
                        </Button>
                    </div>
                </div>

                {/* Grid de Widgets */}
                <div className="space-y-4">
                    {/* Linha 1: Resumo Rápido */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        {[
                            {
                                Icone: Fingerprint,
                                label: 'Identificador Único',
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

                    {/* Linha 2: Configurações Principais */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                        {/* SEÇÃO DE PERFIL DO MAKER (Esquerda, ocupando 2 linhas) */}
                        <div className="lg:row-span-2 h-full">
                            <DataCard title="Minha Foto" subtitle="Imagem do Perfil" icon={User} color="sky" badge="Usuário" className="h-full">
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
                                    <UnifiedInput
                                        label="Nome do Membro"
                                        icon={User}
                                        value={logica.primeiroNome}
                                        onChange={e => logica.setPrimeiroNome(e.target.value)}
                                        placeholder="SEU NOME"
                                    />
                                    <div className="p-4 bg-zinc-950/40/30 border border-zinc-800/50 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="text-[8px] font-black text-zinc-600 uppercase mb-1 tracking-wider">E-mail Cadastrado</p>
                                            <p className="text-[10px] text-zinc-400 font-mono truncate">{logica.usuario?.primaryEmailAddress?.emailAddress}</p>
                                        </div>
                                        <Mail size={14} className="text-zinc-600 shrink-0" />
                                    </div>
                                </div>
                            </DataCard>
                        </div>

                        {/* SEÇÃO DE SEGURANÇA E DADOS */}


                        {/* CONTROLE DE SENHA */}
                        <DataCard title="Senha de Acesso" subtitle="Segurança da Conta" icon={Lock} color="emerald" badge="Privado">
                            <div className="space-y-4">
                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                    Garanta a segurança dos seus projetos e dados definindo uma senha forte para sua conta.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => logica.setExibirJanelaSenha(true)}
                                        className="group w-full p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98]"
                                    >
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                                            <KeyRound size={24} />
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-xs font-black text-emerald-600 uppercase tracking-wide">
                                                {temSenhaDefinida ? "Gerenciar Senha" : "Criar Senha"}
                                            </span>
                                            <span className="block text-[9px] text-emerald-600/60 font-medium mt-0.5">
                                                {temSenhaDefinida ? "Ultima alteração: Recente" : "Não configurada"}
                                            </span>
                                        </div>
                                    </button>

                                    <div className="group w-full p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-3 opacity-60 cursor-not-allowed relative overflow-hidden">
                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-zinc-800 rounded text-[8px] font-black text-zinc-500 uppercase tracking-wider">
                                            Em Breve
                                        </div>
                                        <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-600">
                                            <Fingerprint size={24} />
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-xs font-black text-zinc-500 uppercase tracking-wide">Autenticação 2FA</span>
                                            <span className="block text-[9px] text-zinc-600 font-medium mt-0.5">Proteção Extra</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DataCard>

                        {/* EXPORTAÇÃO DE RELATÓRIOS */}
                        <DataCard
                            title="Baixar Dados"
                            subtitle="Exportar & Backup"
                            icon={HardDrive}
                            color="indigo"
                            badge="Portabilidade"
                        >
                            <div className="space-y-4">
                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                    Mantenha cópias locais dos seus registros. Seus dados são seus.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => logica.exportarRelatorio('csv')}
                                        className="group w-full p-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98]"
                                    >
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                                            <Table size={24} />
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-xs font-black text-emerald-600 uppercase tracking-wide">Excel (.CSV)</span>
                                            <span className="block text-[9px] text-emerald-600/60 font-medium mt-0.5">Planilha Universal</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => logica.exportarRelatorio('pdf')}
                                        className="group w-full p-4 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98]"
                                    >
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 group-hover:bg-indigo-500/20 transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-xs font-black text-indigo-600 uppercase tracking-wide">PDF Técnico</span>
                                            <span className="block text-[9px] text-indigo-600/60 font-medium mt-0.5">Documento Formal</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </DataCard>

                        {/* ZONA DE EXCLUSÃO (Rodapé direito - Ocupa 2 colunas) */}
                        <div className="lg:col-span-2">
                            <DataCard
                                title="Excluir Conta"
                                subtitle="Zona de Perigo"
                                icon={Trash2}
                                color="rose"
                                badge="Irreversível"
                                className="bg-rose-950/10 border-rose-500/10 group-hover:border-rose-500/30"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-6 justify-between h-full pt-2">
                                    <div className="flex-1 space-y-2 text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20 mb-1">
                                            <ShieldAlert size={12} className="text-rose-500" />
                                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Ação Destrutiva</span>
                                        </div>
                                        <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-lg">
                                            Essa ação apagará <strong className="text-rose-400">permanentemente</strong> todos os seus filamentos, impressoras e configurações. Não há como desfazer.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => setExibirModalExclusao(true)}
                                        className="w-full md:w-auto bg-rose-600 hover:bg-rose-500 text-white border-rose-400/20"
                                        variant="danger"
                                        icon={Trash2}
                                    >
                                        Excluir Tudo
                                    </Button>
                                </div>
                            </DataCard>
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
                        <Button
                            onClick={() => setExibirModalSuporte(true)}
                            variant="secondary"
                            className="bg-zinc-950/40 border-zinc-800 hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-500"
                            icon={Wrench}
                        >
                            Abrir Chamado
                        </Button>
                        <Button
                            onClick={() => { navigator.clipboard.writeText("suporte@printlog.com.br"); logica.setAviso({ exibir: true, tipo: 'sucesso', mensagem: 'E-mail copiado!' }); }}
                            variant="secondary"
                            className="bg-zinc-950 border-zinc-800 hover:border-zinc-800/50"
                            icon={Mail}
                        >
                            Copiar Email
                        </Button>
                    </div>
                </div>
            </div>


            {/* JANELA DE SENHA (MODAL) */}
            <Modal
                isOpen={logica.exibirJanelaSenha}
                onClose={() => logica.setExibirJanelaSenha(false)
                }
                title="Configurar Senha"
                subtitle="Segurança"
                icon={KeyRound}
                maxWidth="max-w-md"
                isLoading={logica.estaSalvando}
                footer={
                    <Button
                        onClick={logica.atualizarSenha}
                        disabled={!logica.todosRequisitosAtendidos}
                        isLoading={logica.estaSalvando}
                        variant={logica.todosRequisitosAtendidos ? "primary" : "secondary"}
                        className="w-full"
                        icon={Shield}
                    >
                        {logica.todosRequisitosAtendidos ? "Confirmar Mudança" : "Complete os requisitos acima"}
                    </Button>
                }
            >
                <div className="space-y-4">
                    {temSenhaDefinida && (
                        <UnifiedInput
                            label="Senha Atual"
                            type="password"
                            value={logica.formularioSenha.senhaAtual}
                            onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, senhaAtual: e.target.value })}
                            placeholder="••••••••"
                        />
                    )}
                    <UnifiedInput
                        label="Nova Senha"
                        type="password"
                        value={logica.formularioSenha.novaSenha}
                        onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, novaSenha: e.target.value })}
                        placeholder="••••••••"
                    />
                    <UnifiedInput
                        label="Repetir Nova Senha"
                        type="password"
                        value={logica.formularioSenha.confirmarSenha}
                        onChange={e => logica.setFormularioSenha({ ...logica.formularioSenha, confirmarSenha: e.target.value })}
                        placeholder="••••••••"
                    />

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

                    {/* Barra de Força da Senha */}
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
            </Modal>

            {/* MODAL DE SUPORTE (GOOGLE FORMS) */}
            <Modal
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
            </Modal>

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            <ConfirmModal
                isOpen={exibirModalExclusao}
                onClose={() => setExibirModalExclusao(false)}
                onConfirm={() => {
                    setExibirModalExclusao(false);
                    logica.excluirContaPermanente();
                }}
                title="Excluir Conta"
                message={
                    <span>
                        Você está prestes a <strong className="text-rose-400 font-black">excluir permanentemente</strong> sua conta e todos os dados associados.
                    </span>
                }
                description="⚠️ Esta ação não pode ser desfeita. Os dados não poderão ser recuperados."
                confirmText="Confirmar Exclusão"
                isDestructive
            />
        </ManagementLayout>
    );
}
