import React from 'react';

export const HUDInput = ({ label, value, onChange, placeholder, type = "text", info, disabled, icon: Icon, maxLength = 50 }) => (
    <div className="space-y-2 group w-full">
        <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-focus-within:text-sky-400 transition-colors">
                {label}
            </label>
            {info && (
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {info}
                </span>
            )}
        </div>
        <div className="relative flex items-center">
            {Icon && (
                <Icon size={14} className="absolute left-4 text-zinc-600 group-focus-within:text-sky-500 transition-colors" />
            )}
            <input
                disabled={disabled}
                type={type}
                value={value}
                maxLength={maxLength}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-zinc-900/40 border border-zinc-800 rounded-xl ${Icon ? 'pl-11' : 'px-4'} py-3.5 text-sm text-zinc-200 outline-none focus:border-sky-500/40 focus:bg-zinc-900/80 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-zinc-700 shadow-inner`}
            />
        </div>
    </div>
);

export const ConfigSection = ({ title, icon: Icon, badge, description, children, visible = true }) => {
    if (!visible) return null;
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-5">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sky-400 shadow-lg shadow-sky-500/5 mt-1 shrink-0">
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-100">{title}</h2>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none bg-zinc-900 px-2 py-1 rounded border border-zinc-800 shrink-0">{badge}</span>
                    </div>
                    {description && (
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight mt-2 leading-relaxed max-w-2xl">
                            {description}
                        </p>
                    )}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-800/80 to-transparent mx-4 mt-4 hidden md:block" />
            </div>
            <div className="grid gap-6 pl-0 md:pl-14">
                {children}
            </div>
        </div>
    );
};