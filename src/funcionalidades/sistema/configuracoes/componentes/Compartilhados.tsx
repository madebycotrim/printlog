import { useState, useEffect } from "react";
import { User } from "lucide-react";

export interface PropsCampo {
    label: string;
    valor: string;
    aoMudar: (v: string) => void;
    placeholder?: string;
    icone: typeof User;
}

export function CampoDashboard({ label, valor, aoMudar, placeholder, icone: Icone }: PropsCampo) {
    const [valorLocal, setValorLocal] = useState(valor);

    // Sincroniza o valor local se o valor externo mudar
    useEffect(() => {
        setValorLocal(valor);
    }, [valor]);

    return (
        <div className="w-full">
            <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                {label}
            </label>
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
