import { useState, useEffect } from "react";
import { User, HelpCircle } from "lucide-react";

export interface PropsCampo {
    label: string;
    valor: string;
    aoMudar: (v: string) => void;
    placeholder?: string;
    icone: typeof User;
    dica?: string;
}

export function CampoDashboard({ label, valor, aoMudar, placeholder, icone: Icone, dica }: PropsCampo) {
    const [valorLocal, setValorLocal] = useState(valor);

    // Sincroniza o valor local se o valor externo mudar
    useEffect(() => {
        setValorLocal(valor);
    }, [valor]);

    return (
        <div className="w-full">
            <div className="flex items-center gap-1 mb-1 ml-1 select-none">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {label}
                </label>
                {dica && (
                    <div className="group/tooltip relative inline-block">
                        <HelpCircle size={11} className="text-muted-foreground opacity-50 hover:opacity-100 cursor-help transition-opacity" />
                        <div className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-zinc-900 dark:bg-zinc-850 text-[9px] font-bold text-white normal-case p-2 rounded-lg shadow-xl border border-white/5 w-44 text-center leading-relaxed">
                            {dica}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-850" />
                        </div>
                    </div>
                )}
            </div>
            <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground opacity-60 group-focus-within:text-primary transition-colors duration-300">
                    <Icone size={16} />
                </span>
                <input
                    type="text"
                    value={valorLocal}
                    onChange={(e) => setValorLocal(e.target.value)}
                    onBlur={() => aoMudar(valorLocal)}
                    placeholder={placeholder}
                    className="h-11 w-full bg-transparent border-b-2 border-borda-sutil pl-8 pr-3 text-sm font-bold text-primary outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30"
                />
            </div>
        </div>
    );
}

import { InputBancario } from "@/compartilhado/componentes/ui/InputBancario";

export interface PropsCampoBancario {
    label: string;
    valor: number; // valor em centavos
    aoMudar: (v: number) => void;
    placeholder?: string;
    icone: typeof User;
    prefixo?: string;
    dica?: string;
}

export function CampoBancarioDashboard({ label, valor, aoMudar, placeholder, icone: Icone, prefixo, dica }: PropsCampoBancario) {
    const [valorLocal, setValorLocal] = useState(valor);

    useEffect(() => {
        setValorLocal(valor);
    }, [valor]);

    return (
        <div className="w-full">
            <div className="flex items-center gap-1 mb-1 ml-1 select-none">
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {label}
                </label>
                {dica && (
                    <div className="group/tooltip relative inline-block">
                        <HelpCircle size={11} className="text-muted-foreground opacity-50 hover:opacity-100 cursor-help transition-opacity" />
                        <div className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-zinc-900 dark:bg-zinc-850 text-[9px] font-bold text-white normal-case p-2 rounded-lg shadow-xl border border-white/5 w-44 text-center leading-relaxed">
                            {dica}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-850" />
                        </div>
                    </div>
                )}
            </div>
            <div className="relative group">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground opacity-60 group-focus-within:text-primary transition-colors duration-300">
                    <Icone size={16} />
                </span>
                {prefixo && (
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                        {prefixo}
                    </span>
                )}
                <InputBancario
                    value={valorLocal / 100}
                    onChange={(e) => {
                        const strVal = e.target.value.replace(/[^0-9.,]/g, '');
                        if (!strVal) return setValorLocal(0);
                        setValorLocal(Math.round(parseFloat(strVal.replace(',', '.')) * 100));
                    }}
                    onBlur={() => aoMudar(valorLocal)}
                    placeholder={placeholder}
                    className={`h-11 w-full bg-transparent border-b-2 border-borda-sutil ${prefixo ? 'pl-14' : 'pl-8'} pr-3 text-sm font-bold text-primary outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30`}
                />
            </div>
        </div>
    );
}

export interface PropsCabecalhoCard {
    titulo: string;
    descricao: string;
    icone: typeof User;
    corIcone: string;
    pendente?: boolean;
}

export interface PropriedadesSecaoConfiguracao {
    titulo: string;
    descricao?: string;
    children: React.ReactNode;
    semBorda?: boolean;
}

export const SecaoConfiguracao = ({ titulo, descricao, children, semBorda = false }: PropriedadesSecaoConfiguracao) => (
    <div className={`py-6 space-y-4 ${!semBorda ? 'border-b border-borda-sutil' : ''}`}>
        <div>
            <h3 className="text-sm font-black text-primary uppercase tracking-tight">{titulo}</h3>
            {descricao && <p className="text-xs text-muted-foreground mt-1">{descricao}</p>}
        </div>
        {children}
    </div>
);

export function CabecalhoCard({ titulo, descricao, icone: Icone, corIcone, pendente }: PropsCabecalhoCard) {
    return (
        <div className="flex items-center gap-3 border-b border-borda-sutil pb-4 shrink-0 relative">
            <span className="shrink-0 rounded-xl bg-muted p-2.5 transform group-hover:rotate-6 transition-transform">
                <Icone size={20} className={corIcone} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-black uppercase tracking-tight text-primary leading-none mb-1">{titulo}</h2>
                    {pendente && (
                        <span
                            className="w-2 h-2 rounded-full animate-pulse mb-1 shrink-0"
                            style={{ backgroundColor: "var(--cor-primaria)" }}
                            title="Alterações pendentes"
                        />
                    )}
                </div>
                <p className="truncate text-xs text-muted-foreground leading-none">{descricao}</p>
            </div>
        </div>
    );
}
