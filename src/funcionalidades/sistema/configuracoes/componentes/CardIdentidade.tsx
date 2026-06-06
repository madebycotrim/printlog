import { Store, Image as ImageIcon, Type, Crown, Lock, Zap, Palette, Brush, ArrowRight } from "lucide-react";
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
                <div className="relative flex flex-col items-center justify-center py-10 px-6 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-500/[0.06] dark:to-purple-500/[0.04] overflow-hidden">
                    {/* Glows */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/20 dark:bg-indigo-500/10 blur-[50px] pointer-events-none rounded-full" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/15 dark:bg-purple-500/10 blur-[40px] pointer-events-none rounded-full" />

                    <div className="relative z-10 flex flex-col items-center text-center gap-4">
                        {/* Ícone central */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                                <Store size={28} className="text-indigo-500" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 dark:bg-amber-500 flex items-center justify-center shadow-md">
                                <Lock size={11} className="text-white" strokeWidth={3} />
                            </div>
                        </div>

                        {/* Título */}
                        <div>
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-1">
                                Identidade Visual Exclusiva
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed max-w-[300px]">
                                Personalize o nome, slogan e logo do seu estúdio. Disponível apenas para assinantes{" "}
                                <strong className="text-indigo-600 dark:text-indigo-400">Maker Pro</strong> e{" "}
                                <strong className="text-sky-500">Maker Fundador</strong>.
                            </p>
                        </div>

                        {/* Badges dos planos */}
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/25 text-indigo-700 dark:text-indigo-300">
                                <Zap size={11} className="fill-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Maker Pro</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-100 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/25 text-sky-700 dark:text-sky-300">
                                <Crown size={11} className="fill-sky-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Maker Fundador</span>
                            </div>
                        </div>

                        {/* O que está incluso */}
                        <div className="w-full mt-1 grid grid-cols-3 gap-2 text-left">
                            {[
                                { icone: Type, texto: "Nome do Estúdio" },
                                { icone: Brush, texto: "Slogan Próprio" },
                                { icone: ImageIcon, texto: "Logo Customizada" },
                            ].map(({ icone: Icone, texto }) => (
                                <div key={texto} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-indigo-100/80 dark:border-white/5">
                                    <Icone size={13} className="text-indigo-400 shrink-0" />
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-tight">{texto}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <a
                            href="https://printlog.com.br/planos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                        >
                            <Zap size={13} className="fill-white" />
                            Fazer Upgrade de Plano
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
