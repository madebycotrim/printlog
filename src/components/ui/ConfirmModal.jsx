import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDestructive = false,
    isLoading = false,
    icon: Icon = isDestructive ? AlertTriangle : HelpCircle
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={isDestructive ? "Ação Irreversível" : "Confirmação"}
            icon={Icon}
            maxWidth="max-w-md"
            color={isDestructive ? "rose" : "sky"}
            footer={
                <div className="flex gap-3 w-full">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={isDestructive ? "danger" : "primary"}
                        onClick={onConfirm}
                        className="flex-1"
                        isLoading={isLoading}
                        icon={isDestructive ? Trash2 : undefined}
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            <div className="p-6 space-y-6">
                <div className="text-zinc-300 text-sm font-medium leading-relaxed">
                    {message}
                </div>
                {description && (
                    <div className={`pl-4 border-l-2 py-1 ${isDestructive
                        ? "border-rose-500/50"
                        : "border-zinc-700"
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle size={14} className={isDestructive ? "text-rose-500" : "text-zinc-500"} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDestructive ? "text-rose-400" : "text-zinc-500"}`}>
                                Atenção
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            {description}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
