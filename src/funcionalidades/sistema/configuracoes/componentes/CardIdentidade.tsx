import { Store, Image as ImageIcon, Type, Lock, Zap, Palette, ArrowRight } from "lucide-react";
import { CampoDashboard, CabecalhoCard } from "./Compartilhados";

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

            <div className="flex items-center justify-between">
                <CabecalhoCard
                    titulo="Identidade Visual"
                    descricao="Personalize a marca do seu estúdio"
                    icone={Store}
                    corIcone="text-indigo-500"
                    pendente={pendente}
                />

                {!eProOuSuperior ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        <Lock size={13} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Exclusivo</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                        <Palette size={13} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Personalizar</span>
                    </div>
                )}
            </div>

            {/* === PAINEL BLOQUEADO (FREE) === */}
            {!eProOuSuperior ? (
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 dark:from-indigo-500/[0.04] dark:to-purple-500/[0.02] overflow-hidden w-full">
                    {/* Glows */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-400/20 dark:bg-indigo-500/10 blur-[40px] pointer-events-none rounded-full" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left flex-1">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <Store size={22} className="text-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 justify-center md:justify-start">
                                Identidade Visual Exclusiva
                                <span className="text-[8px] font-black uppercase tracking-widest bg-amber-400/15 text-amber-500 px-2 py-0.5 rounded border border-amber-400/30">PRO</span>
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-lg leading-relaxed">
                                Personalize o nome, slogan e logo do seu estúdio. Disponível nos planos <strong className="text-indigo-600 dark:text-indigo-400">Maker Pro</strong> e <strong className="text-sky-500">Maker Fundador</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
                        <a
                            href="https://printlog.com.br/planos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Zap size={13} className="fill-white" />
                            Upgrade de Plano
                            <ArrowRight size={13} />
                        </a>
                    </div>
                </div>
            ) : (
                /* === CONTEÚDO LIBERADO (PRO / FUNDADOR) === */
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
                        {logoEstudio ? (
                            <div className="h-11 w-full bg-zinc-50 dark:bg-white/[0.02] border border-borda-sutil rounded-lg flex items-center justify-center overflow-hidden p-1 tooltip-trigger" title="Preview da Logo">
                                <img src={logoEstudio} alt="Logo do Estúdio" className="max-h-full w-auto object-contain" />
                            </div>
                        ) : (
                            <div className="h-11 w-full bg-zinc-50/50 dark:bg-white/[0.01] border border-dashed border-borda-sutil rounded-lg flex items-center justify-center" title="Preview da Logo">
                                <ImageIcon size={16} className="text-zinc-400 opacity-50" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
