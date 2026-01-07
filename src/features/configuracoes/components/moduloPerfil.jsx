import React from 'react';
import { User, Camera, Fingerprint, Activity, ShieldCheck, Mail, Clock } from 'lucide-react';
import { HUDInput, ConfigSection } from './ConfigUI';

export default function ProfileModule({ logic }) {
    // Verifica se o módulo deve ser exibido com base na pesquisa
    if (!logic.isVisible("perfil nome e-mail")) return null;

    // Puxa o total de horas acumuladas das impressoras direto da lógica
    const horasTotais = logic.totalPrintingHours || 0;

    return (
        <div className="space-y-16">
            {/* Banner de Identidade Maker */}
            <div className="relative p-10 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/60 to-zinc-900/20 border border-white/5 overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Fingerprint size={160} className="text-white" />
                </div>
                <div className="relative z-10 flex items-center gap-10">
                    <button
                        className="relative group/avatar cursor-pointer outline-none focus:ring-2 focus:ring-sky-500 rounded-[2.5rem]"
                        onClick={() => logic.fileInputRef.current.click()}
                        disabled={logic.isSaving}
                    >
                        <div className="w-36 h-36 rounded-[2.5rem] bg-zinc-950 border-2 border-zinc-800 p-1.5 group-hover/avatar:border-sky-500/50 transition-all shadow-2xl overflow-hidden">
                            <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                                {logic.user?.imageUrl ? (
                                    <img src={logic.user.imageUrl} className="w-full h-full object-cover" alt="Foto de Perfil" />
                                ) : (
                                    <User size={40} className="text-zinc-700" />
                                )}
                                <div className="absolute inset-0 bg-sky-950/80 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all">
                                    <Camera size={24} className="text-white mb-2" />
                                    <span className="text-[8px] font-black uppercase text-white tracking-widest">Alterar</span>
                                </div>
                            </div>
                        </div>
                        <input type="file" ref={logic.fileInputRef} onChange={logic.handleImageUpload} className="hidden" accept="image/*" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity size={12} className="text-emerald-500" />
                            <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">Maker Autenticado</p>
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tighter uppercase">{logic.firstName || "Maker"}</h3>

                        <div className="flex flex-wrap gap-3 mt-6">
                            {/* Badge: Horas Impressas acumuladas */}
                            <span className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.1)]" title="Total de horas de impressão de todas as suas máquinas">
                                <Clock size={14} /> {horasTotais}h de Impressão
                            </span>

                            {/* Badge: ID Único */}
                            <span className="px-4 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                ID: {logic.user?.id.slice(-8)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção de Dados de Identidade */}
            <ConfigSection title="Informações de Identidade" icon={User} badge="Módulo 01" description="Escolha como você quer ser identificado nos seus projetos e orçamentos aqui no sistema.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/20 p-10 rounded-[2.5rem] border border-zinc-800/40">
                    <HUDInput label="Nome ou Apelido Maker" value={logic.firstName} onChange={logic.setFirstName} placeholder="Ex: Alex" />
                    <HUDInput
                        label="E-mail de Acesso"
                        value={logic.user?.primaryEmailAddress?.emailAddress || ""}
                        disabled
                        info={`Acesso via ${logic.getAuthInfo().method}`}
                        icon={Mail}
                    />
                </div>
            </ConfigSection>
        </div>
    );
}