import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Save, User, Building2, Phone, Mail, FileText, MapPin, Loader2, AlertCircle, Terminal } from 'lucide-react';
import { useClientStore } from '../logic/clients';
import { UnifiedInput } from '../../../components/UnifiedInput';
import FormFeedback from '../../../components/FormFeedback';
import { useFormFeedback } from '../../../hooks/useFormFeedback';

export default function ModalCliente({ isOpen, onClose, clienteParaEditar = null }) {
    const { saveClient, isSaving } = useClientStore();
    const { feedback, showSuccess, showError, hide: hideFeedback } = useFormFeedback();

    const initialForm = useMemo(() => ({
        nome: "",
        empresa: "",
        email: "",
        telefone: "",
        documento: "",
        endereco: "",
        observacoes: ""
    }), []);

    const [formData, setFormData] = useState(initialForm);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (clienteParaEditar) {
                setFormData(clienteParaEditar);
            } else {
                setFormData(initialForm);
            }
            setIsDirty(false);
            hideFeedback();
        }
    }, [isOpen, clienteParaEditar, initialForm, hideFeedback]);

    const updateForm = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
    };

    const handleTentativaFechar = useCallback(() => {
        if (isSaving) return;
        if (isDirty) {
            if (window.confirm("Você tem alterações não salvas. Deseja realmente sair?")) {
                onClose();
            }
        } else {
            onClose();
        }
    }, [isSaving, isDirty, onClose]);

    const handleSubmit = async () => {
        if (isSaving) return;

        if (!formData.nome.trim()) {
            showError("O nome do cliente é obrigatório.");
            return;
        }

        try {
            hideFeedback();
            const success = await saveClient(formData);
            if (success) {
                showSuccess(clienteParaEditar ? 'Cliente atualizado com sucesso!' : 'Novo cliente cadastrado!');
                setTimeout(() => {
                    onClose();
                }, 1000);
            }
        } catch (error) {
            showError("Erro ao salvar cliente.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={handleTentativaFechar} />

            <div className={`relative bg-zinc-950 border border-zinc-800/80 rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[96vh] ${isSaving ? 'opacity-90 grayscale-[0.3]' : 'opacity-100'}`}>

                {/* Lateral de Visualização (Prévia) */}
                <div className="w-full md:w-[320px] bg-zinc-950/40/30 border-b md:border-b-0 md:border-r border-zinc-800/50 p-10 flex flex-col justify-between shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-30 select-none">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
                            backgroundSize: '40px 40px',
                            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                        }} />
                    </div>

                    <div className="flex flex-col items-center w-full space-y-10 relative z-10">
                        <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                            <div className="h-px w-4 bg-zinc-900/50" />
                            <span>Prévia</span>
                            <div className="h-px w-4 bg-zinc-900/50" />
                        </div>

                        <div className="relative group p-10 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm">
                            <div className="relative scale-110">
                                <User size={80} className="text-zinc-600" strokeWidth={1} />
                            </div>
                        </div>

                        <div className="text-center space-y-3 w-full">
                            <h3 className="text-xl font-bold text-zinc-100 tracking-tight truncate px-2 leading-tight">
                                {formData.nome || "Novo Cliente"}
                            </h3>
                            {formData.empresa ? (
                                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50 inline-block">
                                    {formData.empresa}
                                </span>
                            ) : (
                                <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                                    Pessoa Física
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 relative z-10 mt-auto">
                        <div className="flex items-center gap-2 mb-2">
                            <Phone size={12} className="text-indigo-500/50" />
                            <span className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-wider">Contato Principal</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 overflow-hidden">
                            <span className="text-lg font-bold text-zinc-300 tracking-tight truncate">
                                {formData.telefone || "---"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Conteúdo do Formulário */}
                <div className="flex-1 flex flex-col bg-zinc-950">
                    <header className="px-10 py-6 border-b border-zinc-800/50 bg-zinc-950/40/10 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800">
                                <User size={18} className="text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
                                    {clienteParaEditar ? "Editar Cliente" : "Cadastrar Cliente"}
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-medium mt-1">
                                    {clienteParaEditar ? "Atualize os dados de contato do cliente" : "Adicione um novo parceiro ou cliente à sua base"}
                                </p>
                            </div>
                        </div>
                        <button disabled={isSaving} onClick={handleTentativaFechar} className="p-2 rounded-full hover:bg-zinc-950/40 text-zinc-500 transition-all disabled:opacity-30">
                            <X size={20} />
                        </button>
                    </header>

                    <div className={`p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8 ${isSaving ? 'pointer-events-none' : ''}`}>

                        {/* Seção 01 - Identificação */}
                        <section className="space-y-5">
                            <div className="flex items-center gap-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[01] Identificação</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                                <div className="space-y-1.5 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Nome Completo</label>
                                    <UnifiedInput
                                        icon={User}
                                        value={formData.nome}
                                        onChange={(e) => updateForm({ nome: e.target.value })}
                                        placeholder="Ex: João da Silva"
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Empresa (Opcional)</label>
                                    <UnifiedInput
                                        icon={Building2}
                                        value={formData.empresa}
                                        onChange={(e) => updateForm({ empresa: e.target.value })}
                                        placeholder="Ex: Tech Solutions"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Seção 02 - Contato */}
                        <section className="space-y-5">
                            <div className="flex items-center gap-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[02] Contato</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                                <div className="space-y-1.5 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Email</label>
                                    <UnifiedInput
                                        icon={Mail}
                                        value={formData.email}
                                        onChange={(e) => updateForm({ email: e.target.value })}
                                        placeholder="contato@exemplo.com"
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Telefone / WhatsApp</label>
                                    <UnifiedInput
                                        icon={Phone}
                                        value={formData.telefone}
                                        onChange={(e) => updateForm({ telefone: e.target.value })}
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Seção 03 - Detalhes */}
                        <section className="space-y-5">
                            <div className="flex items-center gap-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[03] Dados Adicionais</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Documento (CPF/CNPJ)</label>
                                    <UnifiedInput
                                        icon={FileText}
                                        value={formData.documento}
                                        onChange={(e) => updateForm({ documento: e.target.value })}
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">Endereço Completo</label>
                                    <UnifiedInput
                                        icon={MapPin}
                                        value={formData.endereco}
                                        onChange={(e) => updateForm({ endereco: e.target.value })}
                                        placeholder="Rua, Número, Bairro, Cidade - UF"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className="p-8 border-t border-zinc-800/50 bg-zinc-950/40/10 flex flex-col gap-4">
                        <FormFeedback
                            type={feedback.type}
                            message={feedback.message}
                            show={feedback.show}
                            onClose={hideFeedback}
                        />

                        {!formData.nome.trim() && isDirty && !isSaving && (
                            <div className="flex items-center gap-2 text-rose-500 animate-shake">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Nome é obrigatório</span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button disabled={isSaving} onClick={handleTentativaFechar} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                                Cancelar
                            </button>
                            <button
                                disabled={isSaving}
                                onClick={handleSubmit}
                                className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${!isSaving ? "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 hover:shadow-xl shadow-lg shadow-indigo-900/20" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                                {isSaving ? "Salvando..." : clienteParaEditar ? "Salvar Cliente" : "Cadastrar Cliente"}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
