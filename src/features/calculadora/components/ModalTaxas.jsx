import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Percent, DollarSign, Store } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import { UnifiedInput } from "../../../components/UnifiedInput"; // Assuming might be useful, or standard inputs
import { useToastStore } from "../../../stores/toastStore";

import { useSettings, useUpdateSettings } from "../../sistema/logic/settingsQueries";

import { DEFAULT_PLATFORMS } from "../logic/constants";

export default function ModalTaxas({ isOpen, onClose, onApply }) {
    const { addToast } = useToastStore();

    // Conecta com o Banco de Dados (Hook Global)
    const { data: settings } = useSettings();
    const { mutate: salvarSettings } = useUpdateSettings();

    const [platforms, setPlatforms] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [tempData, setTempData] = useState({});
    const [isCreating, setIsCreating] = useState(false);

    // Carrega dados do banco ou default ao abrir
    useEffect(() => {
        if (isOpen) {
            if (settings?.platforms && Array.isArray(settings?.platforms)) {
                setPlatforms(settings.platforms);
            } else {
                setPlatforms(DEFAULT_PLATFORMS);
            }
            // Reset states
            setEditingId(null);
            setIsCreating(false);
            setTempData({});
        }
    }, [isOpen, settings]);

    const savePlatforms = (newPlatforms) => {
        setPlatforms(newPlatforms); // Otimista

        // Salva no banco (preservando outras configs)
        salvarSettings({
            ...settings,
            platforms: newPlatforms
        });
    };

    const handleEdit = (platform) => {
        setEditingId(platform.id);
        setTempData({ ...platform });
        setIsCreating(false);
    };

    const handleDelete = (id) => {
        if (confirm("Tem certeza que deseja remover esta plataforma?")) {
            const newPlatforms = platforms.filter(p => p.id !== id);
            savePlatforms(newPlatforms);
            addToast("Plataforma removida!", "info");
        }
    };

    const handleSaveEdit = () => {
        if (!tempData.name) return addToast("Nome é obrigatório", "warning");

        const newPlatforms = platforms.map(p => p.id === editingId ? tempData : p);
        savePlatforms(newPlatforms);
        setEditingId(null);
        addToast("Plataforma atualizada!", "success");
    };

    const handleCreate = () => {
        setIsCreating(true);
        setEditingId(null);
        setTempData({ name: "", taxa: 0, fixa: 0 });
    };

    const handleSaveNew = () => {
        if (!tempData.name) return addToast("Nome é obrigatório", "warning");

        const newId = `custom_${Date.now()}`;
        const newPlatform = { ...tempData, id: newId };
        const newPlatforms = [...platforms, newPlatform];

        savePlatforms(newPlatforms);
        setIsCreating(false);
        addToast("Nova plataforma adicionada!", "success");
    };

    const handleApply = (platform) => {
        onApply({
            taxa: platform.taxa,
            fixa: platform.fixa,
            nome: platform.name // Optional: pass name if we want to display it somewhere
        });
        onClose();
        addToast(`Taxas de ${platform.name} aplicadas!`, "success");
    };

    // Render Edit/Create Form Row
    const renderFormRow = (isNew = false) => (
        <div className="flex flex-col gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-2 animate-in fade-in zoom-in-95">
            <input
                autoFocus
                type="text"
                placeholder="Nome da Plataforma"
                value={tempData.name}
                onChange={e => setTempData({ ...tempData, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-sky-500 outline-none"
            />
            <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-2">
                    <Percent size={12} strokeWidth={2.5} className="text-zinc-500" />
                    <input
                        type="number"
                        placeholder="Taxa %"
                        value={tempData.taxa}
                        onChange={e => setTempData({ ...tempData, taxa: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-transparent py-2 text-xs text-white outline-none"
                    />
                </div>
                <div className="flex-1 flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-2">
                    <DollarSign size={12} strokeWidth={2.5} className="text-zinc-500" />
                    <input
                        type="number"
                        placeholder="Fixo R$"
                        value={tempData.fixa}
                        onChange={e => setTempData({ ...tempData, fixa: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-transparent py-2 text-xs text-white outline-none"
                    />
                </div>
            </div>
            <div className="flex gap-2 mt-1">
                <button
                    onClick={isNew ? handleSaveNew : handleSaveEdit}
                    className="flex-1 bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-600/30 h-8 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 transition-all"
                >
                    <Check size={12} strokeWidth={2.5} /> Salvar
                </button>
                <button
                    onClick={() => { isNew ? setIsCreating(false) : setEditingId(null) }}
                    className="flex-1 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 h-8 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 transition-all"
                >
                    <X size={12} strokeWidth={2.5} /> Cancelar
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Taxas de Venda"
            subtitle="Plataformas & Marketplaces"
            icon={Store}
            color="sky"
        >
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2 p-1">

                {/* Add New Button */}
                {!isCreating && (
                    <button
                        onClick={handleCreate}
                        className="w-full py-3 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:text-sky-400 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all mb-4"
                    >
                        <Plus size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Adicionar Nova Taxa</span>
                    </button>
                )}

                {/* Create Form */}
                {isCreating && renderFormRow(true)}

                {/* List */}
                <div className="space-y-2">
                    {platforms.map(p => {
                        if (editingId === p.id) return <div key={p.id}>{renderFormRow(false)}</div>;

                        return (
                            <div key={p.id} className="group flex items-center justify-between p-3 bg-zinc-900/20 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-all">
                                <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleApply(p)}
                                >
                                    <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{p.name}</h4>
                                    <div className="flex gap-3 mt-1">
                                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                            <Percent size={10} strokeWidth={2.5} className="text-sky-500" /> {p.taxa}%
                                        </span>
                                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                            <DollarSign size={10} strokeWidth={2.5} className="text-emerald-500" /> R$ {Number(p.fixa).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleApply(p)}
                                        className="p-2 text-zinc-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all"
                                        title="Aplicar"
                                    >
                                        <Check size={14} strokeWidth={2.5} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                                        title="Editar"
                                    >
                                        <Edit2 size={14} strokeWidth={2.5} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                        title="Excluir"
                                    >
                                        <Trash2 size={14} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
}
