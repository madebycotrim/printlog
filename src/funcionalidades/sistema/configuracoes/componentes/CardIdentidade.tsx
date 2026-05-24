import { Store, Image as ImageIcon, Type, Crown } from "lucide-react";
import { CampoDashboard } from "./Compartilhados";

interface PropsCardIdentidade {
    nomeEstudio: string;
    definirNomeEstudio: (v: string) => void;
    sloganEstudio: string;
    definirSloganEstudio: (v: string) => void;
    logoEstudio: string;
    definirLogoEstudio: (v: string) => void;
    eProOuSuperior: boolean;
    pendente?: boolean;
}

export function CardIdentidade({
    nomeEstudio,
    definirNomeEstudio,
    sloganEstudio,
    definirSloganEstudio,
    logoEstudio,
    definirLogoEstudio,
    eProOuSuperior,
    pendente,
}: PropsCardIdentidade) {
    return (
        <div className="rounded-xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#121214] p-4 flex flex-col gap-4 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.03] to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-3 shrink-0 relative">
                <span className="shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 p-2 text-indigo-500">
                    <Store size={18} />
                </span>
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-black uppercase tracking-widest text-primary">Identidade Visual</h2>
                    <span className="text-xs text-muted-foreground opacity-60 font-medium hidden sm:inline-block">/ Personalize a marca do seu estúdio</span>
                    {pendente && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse ml-1" />}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative items-end">
                <div className="md:col-span-3">
                    <CampoDashboard
                        label="Nome do Estúdio"
                        valor={nomeEstudio}
                        aoMudar={definirNomeEstudio}
                        icone={Type}
                        placeholder="Ex: MalleVi 3D"
                    />
                </div>
                <div className="md:col-span-4">
                    <CampoDashboard
                        label="Slogan"
                        valor={sloganEstudio}
                        aoMudar={definirSloganEstudio}
                        icone={Type}
                        placeholder="Ex: Criando suas ideias"
                    />
                </div>
                <div className="md:col-span-4">
                    <CampoDashboard
                        label="URL da Logo"
                        valor={logoEstudio}
                        aoMudar={definirLogoEstudio}
                        icone={ImageIcon}
                        placeholder="https://..."
                    />
                </div>

                <div className="md:col-span-1 h-11 w-full flex items-center justify-center">
                    {eProOuSuperior && logoEstudio ? (
                        <div className="h-11 w-full bg-zinc-50 dark:bg-white/[0.02] border border-borda-sutil rounded-lg flex items-center justify-center overflow-hidden p-1 tooltip-trigger" title="Preview da Logo">
                            <img src={logoEstudio} alt="Logo" className="max-h-full w-auto object-contain" />
                        </div>
                    ) : (
                        <div className="h-11 w-full bg-zinc-50/50 dark:bg-white/[0.01] border border-dashed border-borda-sutil rounded-lg flex items-center justify-center" title="Preview da Logo">
                            <ImageIcon size={16} className="text-zinc-400 opacity-50" />
                        </div>
                    )}
                </div>

                {!eProOuSuperior && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-100/60 dark:bg-zinc-950/60 backdrop-blur-sm rounded-xl">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-borda-sutil rounded-full shadow-sm">
                            <Crown size={14} className="text-amber-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Exclusivo PRO</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
