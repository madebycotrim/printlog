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
            <div className="p-6 text-center space-y-4">
                <p className="text-zinc-300 text-sm font-medium leading-relaxed">
                    {message}
                </p>
                {description && (
                    <div className={`p-4 rounded-xl border ${isDestructive
                            ? "bg-rose-500/5 border-rose-500/10 text-rose-400"
                            : "bg-zinc-900/50 border-zinc-800 text-zinc-500"
                        }`}>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-tight opacity-80">
                            {description}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
