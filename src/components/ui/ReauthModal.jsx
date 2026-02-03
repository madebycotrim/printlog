import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { UnifiedInput } from '../UnifiedInput';
import { ShieldCheck, Lock } from 'lucide-react';

export default function ReauthModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading
}) {
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (password) {
            await onConfirm(password);
            setPassword(''); // Clear on success/attempt
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirmação de Segurança"
            subtitle="Requer Autenticação"
            icon={ShieldCheck}
            maxWidth="max-w-md"
            footer={
                <Button
                    onClick={handleSubmit}
                    disabled={!password || isLoading}
                    isLoading={isLoading}
                    variant="primary"
                    className="w-full"
                    icon={Lock}
                >
                    Confirmar Senha
                </Button>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-zinc-400">
                    Para sua segurança, confirme sua senha atual para continuar com esta ação sensível.
                </p>
                <UnifiedInput
                    label="Sua Senha Atual"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                />
            </form>
        </Modal>
    );
}
