import React, { useEffect, useState } from "react";
import {
    X, FileText, MessageCircle, Trash2, User,
    Layers, Clock, Printer, AlertTriangle, ArrowDownCircle
} from "lucide-react";
import { formatCurrency, formatDecimal } from "../../../utils/numbers";
import Modal from "../../../components/ui/Modal";
import { CONFIG_STATUS } from "../../../utils/constants";
import SideBySideModal from "../../../components/ui/SideBySideModal";

export default function ModalDetalhes({ item, onClose, onExcluir }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const handleEsc = (e) => (e.key === 'Escape') && onClose();
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleDelete = () => {
        setShowDeleteConfirm(false);
        onExcluir(item.id);
    };

    if (!item) return null;

    const d = item.data || {};
    const res = d.resultados || {};
    const ent = d.entradas || {};

    const statusKey = d.status || 'rascunho';
    const config = CONFIG_STATUS[statusKey] || CONFIG_STATUS['rascunho'];

    const precoFinal = Number(res.precoComDesconto || res.precoSugerido || 0);
    const lucroReal = Number(res.lucroReal || 0);
    const margemPercent = precoFinal > 0 ? (lucroReal / precoFinal) * 100 : 0;

    const pesoTotalCalculado = Number(res.pesoTotal || 0) > 0
        ? Number(res.pesoTotal)
        : (Number(ent.material?.pesoModelo || ent.pesoPeca || 0) * Number(ent.quantidade || ent.qtdPecas || 1));

    // Sidebar Content
    const sidebarContent = (
        <div className="flex flex-col h-full w-full justify-between">
            <div className="space-y-8 w-full">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.2em] border ${config.bg} ${config.color} ${config.border}`}>
                            {config.label}
                        </div>
                        <span className="text-zinc-600 font-mono text-[9px] font-bold">SERIAL://{String(item.id || '').slice(-8).toUpperCase()}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none break-words">
                        {item.label || ent.nomeProjeto || "Projeto sem nome"}
                    </h2>
                </div>

                <div className="space-y-3 pt-6 border-t border-zinc-800/50">
                    <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/50">
                        <span className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Preço Final</span>
                        <span className="text-xl font-mono font-black text-white italic">{formatCurrency(precoFinal)}</span>
                    </div>
                    <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/50">
                        <span className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Margem %</span>
                        <span className={`text-xl font-mono font-black italic ${margemPercent >= 20 ? 'text-emerald-400' : 'text-sky-400'}`}>
                            {formatDecimal(margemPercent, 1)}%
                        </span>
                    </div>
                    <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/50">
                        <span className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Massa Total</span>
                        <span className="text-xl font-mono font-black text-zinc-300 italic">{formatDecimal(pesoTotalCalculado, 0)}g</span>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-zinc-800/50 w-full">
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full h-10 text-rose-900/40 hover:text-rose-500 text-[8px] font-black uppercase tracking-[0.3em] transition-all hover:bg-rose-500/5 rounded-lg flex items-center justify-center gap-2"
                >
                    <Trash2 size={12} /> Remover Projeto
                </button>
            </div>
        </div>
    );

    // Footer Content
    const footerContent = (
        <div className="grid grid-cols-2 gap-4 w-full">
            <button className="h-12 bg-zinc-950/40 hover:bg-zinc-900/50 text-zinc-400 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-zinc-800 active:scale-95">
                <FileText size={16} /> PDF Relatório
            </button>
            <button className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 shadow-emerald-900/20">
                <MessageCircle size={16} /> Enviar WhatsApp
            </button>
        </div>
    );

    return (
        <>
            <SideBySideModal
                isOpen={!!item}
                onClose={onClose}
                sidebar={sidebarContent}
                header={{
                    title: "Detalhes do Projeto",
                    subtitle: "Visão geral financeira e técnica",
                    icon: FileText
                }}
                footer={footerContent}
            >
                <div className="space-y-8">
                    {/* FINANCEIRO */}
                    <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-3">
                            Métricas Financeiras <div className="h-px flex-1 bg-zinc-800/50" />
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-950/40/30 p-5 rounded-2xl border border-zinc-800/50">
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Custo Produção</span>
                                <span className="text-xl font-mono font-black text-zinc-400 italic">{formatCurrency(res.custoTotal || 0)}</span>
                            </div>
                            <div className="bg-emerald-500/[0.02] p-5 rounded-2xl border border-emerald-500/10">
                                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Lucro Líquido</span>
                                <span className="text-xl font-mono font-black text-emerald-500 italic">+{formatCurrency(lucroReal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* BLUEPRINT ESPECIFICAÇÕES */}
                    <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-3">
                            Blueprint Técnico <div className="h-px flex-1 bg-zinc-800/50" />
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { icon: <User size={14} />, label: "Cliente", val: ent.clienteNome || "Venda Direta", color: "text-zinc-400" },
                                { icon: <Layers size={14} />, label: "Material", val: ent.material?.nome || "Polímero Padrão", color: "text-sky-400" },
                                { icon: <Printer size={14} />, label: "Setup Impressora", val: ent.nomeImpressoraSelecionada || ent.selectedPrinterName || "Standby", color: "text-emerald-400" },
                                { icon: <Clock size={14} />, label: "Lead Time", val: `${res.tempoTotalHoras || 0} Horas`, color: "text-zinc-400" },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-zinc-950/30 rounded-xl border border-zinc-800/50 hover:bg-zinc-950/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-zinc-950/40 ${s.color} opacity-80`}>{s.icon}</div>
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase">{s.label}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-zinc-200 uppercase tracking-tight italic">{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TAXAS SUTIS */}
                    <div className="p-5 bg-rose-500/[0.01] border border-rose-500/10 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <ArrowDownCircle size={12} className="text-rose-900" />
                            <span className="text-[9px] font-bold text-zinc-600 uppercase">Deduções e Impostos</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-rose-900">-{formatCurrency(res.valorImpostos || 0)}</span>
                    </div>
                </div>
            </SideBySideModal>

            {/* Modal de Confirmação de Exclusão */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Excluir Projeto?"
                subtitle="Ação Irreversível"
                icon={AlertTriangle}
                maxWidth="max-w-md"
                className="z-[110]"
                footer={
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 h-12 rounded-xl bg-zinc-900/50 hover:bg-zinc-700 text-white text-[10px] font-black uppercase transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase transition-all"
                        >
                            Sim, Excluir
                        </button>
                    </div>
                }
            >
                <div className="p-4 text-center">
                    <p className="text-sm text-zinc-400 leading-relaxed mb-2">
                        Este projeto será removido permanentemente do banco de dados.
                    </p>
                    <p className="text-xs text-zinc-600">
                        Esta ação não pode ser desfeita.
                    </p>
                </div>
            </Modal>
        </>
    );
}
