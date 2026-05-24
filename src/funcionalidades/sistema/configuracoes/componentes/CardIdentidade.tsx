import { Store, Image, Type, Crown } from "lucide-react";
import { CabecalhoCard, CampoDashboard } from "./Compartilhados";

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
        <div className="rounded-2xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#121214] p-5 md:p-6 flex flex-col gap-5 relative overflow-hidden group hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-indigo-500/[0.01] dark:from-indigo-500/[0.05] dark:to-indigo-500/[0.02] pointer-events-none" />
            <CabecalhoCard titulo="Identidade Visual" descricao="Personalize a marca do seu estúdio" icone={Store} corIcone="text-indigo-500" pendente={pendente} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                <CampoDashboard
                    label="Nome do Estúdio"
                    valor={nomeEstudio}
                    aoMudar={definirNomeEstudio}
                    icone={Type}
                    placeholder="Ex: MalleVi 3D"
                />
                <CampoDashboard
                    label="Slogan"
                    valor={sloganEstudio}
                    aoMudar={definirSloganEstudio}
                    icone={Type}
                    placeholder="Ex: Criando suas ideias"
                />
                <div className="md:col-span-2">
                    <CampoDashboard
                        label="URL da Logo (Opcional)"
                        valor={logoEstudio}
                        aoMudar={definirLogoEstudio}
                        icone={Image}
                        placeholder="Ex: https://i.imgur.com/sua-logo.png"
                    />
                </div>

                {!eProOuSuperior && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-zinc-100/80 dark:bg-zinc-950/80 backdrop-blur-sm rounded-xl text-center gap-2">
                        <Crown size={24} className="text-zinc-400 dark:text-zinc-500" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">Exclusivo PRO</span>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                Personalize seus orçamentos
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {eProOuSuperior && logoEstudio && (
                <div className="mt-2 p-4 rounded-xl border border-borda-sutil bg-zinc-50 dark:bg-zinc-900 flex justify-center items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Sua Logo:</span>
                    <img src={logoEstudio} alt="Logo Preview" className="max-h-12 w-auto object-contain rounded" />
                </div>
            )}
        </div>
    );
}
