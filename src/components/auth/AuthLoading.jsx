import { Loader2 } from 'lucide-react';

/**
 * Loading Skeleton para forms de autenticação
 */
export default function AuthLoadingSkeleton() {
    return (
        <div className="w-full max-w-md space-y-6 animate-pulse">
            {/* Logo Skeleton */}
            <div className="h-12 w-32 bg-zinc-800/50 rounded-lg mx-auto" />

            {/* Title Skeleton */}
            <div className="space-y-2">
                <div className="h-8 w-48 bg-zinc-800/50 rounded mx-auto" />
                <div className="h-4 w-64 bg-zinc-800/30 rounded mx-auto" />
            </div>

            {/* Form Fields Skeleton */}
            <div className="space-y-4">
                <div className="h-12 w-full bg-zinc-800/50 rounded-xl" />
                <div className="h-12 w-full bg-zinc-800/50 rounded-xl" />
                <div className="h-12 w-full bg-zinc-800/50 rounded-xl" />
            </div>

            {/* Button Skeleton */}
            <div className="h-12 w-full bg-sky-500/20 rounded-xl" />
        </div>
    );
}

/**
 * Loading Spinner Inline
 */
export function InlineLoader({ text = 'Carregando...' }) {
    return (
        <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 size={20} className="text-sky-500 animate-spin" />
            <span className="text-sm text-zinc-400">{text}</span>
        </div>
    );
}

/**
 * Button Loading State
 */
export function ButtonLoader({ text = 'Processando...' }) {
    return (
        <>
            <Loader2 size={18} className="animate-spin" />
            {text}
        </>
    );
}
