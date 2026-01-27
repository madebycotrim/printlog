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
            <div className="p-8 text-center space-y-6">
                <div className="text-zinc-300 text-sm font-medium leading-relaxed">
                    {message}
                </div>
                {description && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 text-left ${isDestructive
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500"
                        }`}>
                        <AlertTriangle size={16} className={`shrink-0 ${isDestructive ? "text-rose-500" : "text-zinc-500"}`} />
                        <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed opacity-90 pt-0.5">
                            {description}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
