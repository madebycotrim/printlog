import { LucideIcon } from "lucide-react";

interface PropriedadesKPICard {
    titulo: string;
    valor: string | number;
    subteste: string;
    icone: LucideIcon;
    cor: string;
}

export function KPICard({ titulo, valor, subteste, icone: Icone, cor }: PropriedadesKPICard) {
    return (
        <div className="bg-white dark:bg-card border border-borda-sutil p-6 rounded-2xl flex items-center gap-5 relative overflow-hidden group" style={{ boxShadow: "var(--sombra-suave)" }}>
            {/* Ícone */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border relative z-10 transition-transform duration-300 group-hover:scale-110 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-white/10 ${cor}`}>
                <Icone size={24} strokeWidth={2} />
            </div>

            {/* Conteúdo */}
            <div className="relative z-10 flex flex-col">
                <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-500 mb-1 leading-tight">
                    {titulo}
                </h4>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                        {valor}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-600 mt-1.5 whitespace-nowrap">
                        {subteste}
                    </span>
                </div>
            </div>

            {/* Marca d'água */}
            <Icone
                className="absolute -right-6 -bottom-6 text-gray-100 dark:text-white/5 transition-transform duration-700 pointer-events-none"
                size={100}
                strokeWidth={1}
            />
        </div>
    );
}


