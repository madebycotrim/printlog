import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-900/20 active:scale-95",
    secondary: "bg-zinc-950/40 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900/50 active:scale-95",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 active:scale-95",
    ghost: "hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 active:scale-95",
    outline: "border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 bg-transparent active:scale-95",
    glass: "bg-zinc-950/40 backdrop-blur-md border border-zinc-800/50 text-zinc-300 hover:bg-zinc-900/60 hover:text-white",
    neutral: "bg-zinc-100 hover:bg-white text-zinc-950 shadow-lg shadow-zinc-500/10 active:scale-95"
};

const sizes = {
    xs: "h-8 px-3 text-[9px]",
    sm: "h-9 px-4 text-[10px]",
    md: "h-11 px-6 text-[10px]",
    lg: "h-14 px-8 text-xs",
    icon: "h-10 w-10 p-0 flex items-center justify-center",
    iconSm: "h-8 w-8 p-0 flex items-center justify-center"
};

export default function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon: Icon,
    children,
    className = "",
    disabled,
    ...props
}) {
    const variantClass = variants[variant] || variants.primary;
    const sizeClass = sizes[size] || sizes.md;

    return (
        <button
            className={`
                relative rounded-xl font-black uppercase tracking-widest transition-all duration-300
                flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                ${variantClass}
                ${sizeClass}
                ${className}
            `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="animate-spin" size={size === 'xs' || size === 'sm' ? 12 : 16} />
            ) : Icon ? (
                <Icon size={size === 'xs' || size === 'sm' ? 14 : 16} strokeWidth={3} />
            ) : null}

            {children}
        </button>
    );
}
